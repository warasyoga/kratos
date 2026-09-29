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
  const train = async (weightKg = 50, reps = 10) => {
    await services.workout.start();
    const first = must(must(await services.workout.getActive()).exercises[0]);
    await services.workout.sets.complete(must(first.sets.find((s) => s.kind === 'working')).id, {
      weightKg,
      reps,
    });
    await services.workout.finish();
  };
  return { deps, services, train, goTo: (days: number) => (now = MONDAY + days * DAY) };
}

describe('lencana', () => {
  it('sesi pertama membuka "first_session" sekali saja', async () => {
    const { services, train, deps } = await setup();
    expect(await services.achievements.sync()).toEqual([]);
    await train();
    expect(await services.achievements.sync()).toEqual(['first_session']);
    expect(await services.achievements.sync()).toEqual([]);
    expect(deps.state.achievements).toHaveLength(1);

    const list = await services.achievements.list();
    expect(list.find((a) => a.id === 'first_session')?.unlockedAt).toBe(MONDAY);
    expect(list.find((a) => a.id === 'first_pr')?.unlockedAt).toBeNull();
  });

  it('bench 1RM estimasi ≥ berat badan → "bench_bodyweight"; rekor → "first_pr"', async () => {
    const { services, train, goTo } = await setup();
    await train(50, 10);
    goTo(7);
    await train(60, 8); // 1RM 76 kg ≥ 68,4 kg
    const unlocked = await services.achievements.sync();
    expect(unlocked).toEqual(expect.arrayContaining(['bench_bodyweight', 'first_pr']));
  });

  it('protein ≥ target 7 hari berturut-turut → "protein_week"', async () => {
    const { services, goTo } = await setup();
    for (let d = 0; d < 7; d++) {
      goTo(d);
      await services.nutrition.logFood({ label: 'Makan', kcal: 2900, proteinG: 140 });
    }
    expect(await services.achievements.sync()).toContain('protein_week');
  });

  it('foto di 3 tanggal berbeda → "photo_diary"', async () => {
    const { services, goTo } = await setup();
    for (const d of [0, 14, 28]) {
      goTo(d);
      await services.progress.photos.add({
        file: new Blob(['x'], { type: 'image/jpeg' }),
        pose: 'front',
      });
    }
    expect(await services.achievements.sync()).toEqual(['photo_diary']);
  });
});

describe('evaluasi', () => {
  it('bulan pertama tersedia setelah bulan berganti dan muncul di Hari Ini 3 hari', async () => {
    const { services, train, goTo } = await setup();
    await train(50, 10);
    goTo(1);
    await services.progress.logMetric({ weightKg: 68.8 });
    goTo(2); // Rabu 30 Sep: bulan belum selesai
    expect(await services.evaluation.due()).toBeNull();

    goTo(3); // Kamis 1 Okt
    const due = must(await services.evaluation.due());
    expect(due).toMatchObject({ key: 'bulan-2026-09', kind: 'month', from: '2026-09-01' });

    const report = must(await services.evaluation.report('bulan-2026-09'));
    expect(report.sessions).toBe(1);
    // Program mulai Senin 28 Sep: Senin & Selasa terjadwal di September.
    expect(report.attendance).toEqual({ done: 1, scheduled: 2 });
    expect(report.tonnageKg).toBe(500);
    expect(report.weightChangeKg).toBeCloseTo(0.04, 5);

    goTo(6); // 4 Okt: lewat 3 hari
    expect(await services.evaluation.due()).toBeNull();
  });

  it('akhir blok 6 minggu', async () => {
    const { services, goTo } = await setup();
    goTo(42);
    const periods = await services.evaluation.periods();
    expect(periods.map((p) => p.key)).toContain('blok-1');
    expect(must(await services.evaluation.report('blok-1'))).toMatchObject({
      from: '2026-09-28',
      to: '2026-11-09',
    });
  });

  it('kunci tidak dikenal → null', async () => {
    const { services } = await setup();
    expect(await services.evaluation.report('bulan-1999-01')).toBeNull();
  });
});
