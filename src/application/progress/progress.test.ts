import { must } from '@/domain/testing/profiles';
import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

const MONDAY = new Date('2026-09-28T07:00:00').getTime();
const DAY = 86_400_000;

async function setup() {
  let now = MONDAY;
  const deps = createInMemoryDeps({ clock: { now: () => now } });
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  return { deps, services, goTo: (days: number) => (now = MONDAY + days * DAY) };
}

type Services = Awaited<ReturnType<typeof setup>>['services'];

/** Latihan hari ini: set kerja pertama gerakan pertama dengan beban/repetisi tertentu. */
async function train(services: Services, weightKg: number, reps: number) {
  await services.workout.start();
  const view = must(await services.workout.getActive());
  const first = must(view.exercises[0]);
  const set = must(first.sets.find((s) => s.kind === 'working'));
  await services.workout.sets.complete(set.id, { weightKg, reps });
  await services.workout.finish();
  return first.exercise;
}

describe('progres kekuatan', () => {
  it('tren 1RM estimasi dan rekor pribadi dari latihan yang selesai', async () => {
    const { services, goTo } = await setup();
    const exercise = await train(services, 50, 10); // Senin minggu 1
    goTo(7);
    await train(services, 52.5, 10); // Senin minggu 2 → 1RM naik

    const strength = await services.progress.strength('4w');
    expect(strength.fromDate).toBe('2026-09-14');
    const trend = must(strength.exercises.find((e) => e.exercise.id === exercise.id));
    expect(trend.sessionCount).toBe(2);
    expect(trend.changeKg).toBeCloseTo(70 - 66.67, 1);
    expect(strength.recentPrs.map((p) => [p.exercise.id, p.weightKg, p.reps])).toEqual([
      [exercise.id, 52.5, 10],
    ]);

    const detail = must(await services.progress.exercise(exercise.id));
    expect(detail.sessions.map((s) => s.logDate)).toEqual(['2026-10-05', '2026-09-28']);
    expect(detail.bestE1rmKg).toBeCloseTo(70, 5);
  });

  it('gerakan tidak dikenal → null', async () => {
    const { services } = await setup();
    expect(await services.progress.exercise('tidak-ada')).toBeNull();
  });
});

describe('progres tubuh', () => {
  it('berat onboarding jadi titik pertama; ukuran menghasilkan % lemak', async () => {
    const { services, goTo } = await setup();
    goTo(1);
    expect(await services.progress.logMetric({ neckCm: 37, waistCm: 80 })).toEqual({
      ok: true,
      value: undefined,
    });

    const body = must(await services.progress.body('4w'));
    expect(body.latestWeightKg).toBe(68.4);
    expect(body.trend).toHaveLength(1);
    expect(body.bodyFat?.latest.pct).toBeCloseTo(13.7, 1);
    expect(body.measurementDue).toBe(false);
    expect(body.measurements.map((m) => m.field)).toEqual(['neckCm', 'waistCm']);
  });

  it('laju naik mingguan tersedia setelah 8 hari penimbangan', async () => {
    const { services, goTo } = await setup();
    for (let day = 1; day <= 8; day++) {
      goTo(day);
      await services.progress.logMetric({ weightKg: 68.4 + day * 0.05 });
    }
    const body = must(await services.progress.body('4w'));
    expect(body.rate).not.toBeNull();
    expect(body.band).toHaveLength(body.trend.length);
  });

  it('validasi: kosong ditolak, di luar batas ditolak per kolom', async () => {
    const { services } = await setup();
    const empty = await services.progress.logMetric({});
    expect(!empty.ok && empty.error.fields).toEqual({ _: 'metric_required' });
    const bad = await services.progress.logMetric({ waistCm: 10 });
    expect(!bad.ok && bad.error.fields).toEqual({ waistCm: 'circumference_range' });
  });

  it('catatan berat terakhir tidak bisa dihapus, ukuran bisa', async () => {
    const { deps, services } = await setup();
    await services.progress.logMetric({ waistCm: 80 });
    const [weight, waist] = deps.state.bodyMetrics;
    const blocked = await services.progress.removeMetric(must(weight).id);
    expect(!blocked.ok && blocked.error.code).toBe('last_weight');
    expect((await services.progress.removeMetric(must(waist).id)).ok).toBe(true);
    expect(deps.state.bodyMetrics).toHaveLength(1);
  });
});

describe('progres volume', () => {
  it('set per otot minggu ini vs rencana, tonase, dan kehadiran', async () => {
    const { services, goTo } = await setup();
    await train(services, 50, 10);
    goTo(1); // Selasa: Lower A belum dikerjakan

    const volume = must(await services.progress.volume('4w'));
    const chest = must(volume.thisWeek.find((v) => v.muscle === 'chest'));
    expect(chest.doneSets).toBe(1);
    expect(chest.plannedSets).toBeGreaterThanOrEqual(10);
    expect(volume.tonnage.at(-1)).toEqual({ weekStart: '2026-09-28', tonnageKg: 500 });
    expect(volume.attendance.at(-1)).toEqual({ weekStart: '2026-09-28', done: 1, scheduled: 2 });
    expect(volume.attendanceTotal).toEqual({ done: 1, scheduled: 2 });
  });
});

describe('foto progres', () => {
  it('dikompres (foto + thumbnail) lalu tersimpan dengan tanggal hari ini', async () => {
    const { deps, services } = await setup();
    const file = new Blob(['x'], { type: 'image/png' });
    const result = await services.progress.photos.add({ file, pose: 'front' });
    expect(result.ok).toBe(true);
    const [photo] = await services.progress.photos.list();
    expect(photo).toMatchObject({ logDate: '2026-09-28', pose: 'front' });
    expect(must(photo).blob.type).toBe('image/jpeg');
    expect(deps.state.photos).toHaveLength(1);
  });

  it('bukan gambar atau gagal diproses → photo_invalid', async () => {
    const { deps, services } = await setup();
    const text = await services.progress.photos.add({
      file: new Blob(['x'], { type: 'text/plain' }),
      pose: 'front',
    });
    expect(!text.ok && text.error.fields).toEqual({ file: 'photo_invalid' });

    deps.platform.resizeImage = () => Promise.reject(new Error('rusak'));
    const broken = await services.progress.photos.add({
      file: new Blob(['x'], { type: 'image/jpeg' }),
      pose: 'side',
    });
    expect(!broken.ok && broken.error.code).toBe('photo_invalid');
  });
});
