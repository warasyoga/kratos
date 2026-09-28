import { must } from '@/domain/testing/profiles';
import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

const MONDAY = new Date('2026-09-28T17:00:00').getTime();
const MIN = 60_000;
const DAY = 86_400_000;

async function setup() {
  let now = MONDAY;
  const clock = { now: () => now };
  const deps = createInMemoryDeps({ clock });
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  const advance = (ms: number) => {
    now += ms;
  };
  return { deps, services, advance, setNow: (t: number) => (now = t) };
}

type Services = Awaited<ReturnType<typeof setup>>['services'];

async function active(services: Services) {
  return must(await services.workout.getActive(), 'sesi aktif');
}

/** Kerjakan semua set kerja satu gerakan dengan beban & repetisi tertentu. */
async function doExercise(
  services: Services,
  exerciseId: string,
  weightKg: number,
  reps: number,
  rir = 2,
) {
  const view = must((await active(services)).exercises.find((e) => e.exercise.id === exerciseId));
  for (const set of view.sets.filter((s) => s.kind === 'working')) {
    expect((await services.workout.sets.complete(set.id, { weightKg, reps })).ok).toBe(true);
    await services.workout.sets.rate(set.id, rir);
  }
}

describe('sesi latihan', () => {
  it('Senin: sesi Upper A dimulai dengan semua set siap dicentang (kalibrasi)', async () => {
    const { services } = await setup();
    expect((await services.workout.start()).ok).toBe(true);
    const view = await active(services);
    expect(view.session).toMatchObject({
      dayLabel: 'Upper A',
      status: 'active',
      readiness: 'green',
    });
    const bench = must(view.exercises[0]);
    expect(bench.exercise.name).toBe('Bench Press');
    expect(bench.plan.decision).toBe('calibration');
    expect(bench.sets.map((s) => [s.kind, s.weightKg])).toEqual([
      ['working', 20],
      ['working', 20],
      ['working', 20],
    ]);
  });

  it('memulai lagi saat ada sesi aktif mengembalikan sesi yang sama', async () => {
    const { services } = await setup();
    const a = await services.workout.start();
    const b = await services.workout.start();
    expect(a).toEqual(b);
  });

  it('Rabu (hari pemulihan) tidak ada latihan terjadwal', async () => {
    const { services, advance } = await setup();
    advance(2 * DAY);
    expect(await services.workout.start()).toMatchObject({
      ok: false,
      error: { code: 'no_workout_today' },
    });
  });

  it('kalibrasi: RIR tinggi menaikkan beban set berikutnya', async () => {
    const { services } = await setup();
    await services.workout.start();
    const [first] = must((await active(services)).exercises[0]).sets;
    await services.workout.sets.complete(must(first).id, { weightKg: 20, reps: 10 });
    const rated = await services.workout.sets.rate(must(first).id, 5);
    expect(rated).toEqual({ ok: true, value: { nextWeightKg: 25 } });
    const sets = must((await active(services)).exercises[0]).sets;
    expect(sets.map((s) => s.weightKg)).toEqual([20, 25, 25]);
  });

  it('mengatur beban set sebelum dicentang juga membawa beban ke set berikutnya', async () => {
    const { services } = await setup();
    await services.workout.start();
    const [first] = must((await active(services)).exercises[0]).sets;
    await services.workout.sets.update(must(first).id, { weightKg: 60, reps: 8 });
    expect(must((await active(services)).exercises[0]).sets.map((s) => s.weightKg)).toEqual([
      60, 60, 60,
    ]);
  });

  it('mengubah beban saat mencentang membawa beban baru ke set berikutnya', async () => {
    const { services } = await setup();
    await services.workout.start();
    const [first] = must((await active(services)).exercises[0]).sets;
    await services.workout.sets.complete(must(first).id, { weightKg: 40, reps: 10 });
    expect(must((await active(services)).exercises[0]).sets.map((s) => s.weightKg)).toEqual([
      40, 40, 40,
    ]);
  });

  it('timer istirahat: mulai saat dicentang, bisa digeser dan dilewati', async () => {
    const { services } = await setup();
    await services.workout.start();
    const set = must(must((await active(services)).exercises[0]).sets[0]);
    const done = await services.workout.sets.complete(set.id, { weightKg: 40, reps: 10 });
    expect(done.ok && done.value.restEndsAt).toBe(MONDAY + 120_000);
    expect(await services.workout.sets.adjustRest(set.id, { deltaSec: 15 })).toEqual({
      ok: true,
      value: { restEndsAt: MONDAY + 135_000 },
    });
    expect(await services.workout.sets.adjustRest(set.id, { skip: true })).toEqual({
      ok: true,
      value: { restEndsAt: MONDAY },
    });
  });

  it('tambah set dan batal centang', async () => {
    const { services } = await setup();
    await services.workout.start();
    const bench = must((await active(services)).exercises[0]);
    await services.workout.sets.addSet(bench.plan.programExerciseId);
    expect(must((await active(services)).exercises[0]).sets).toHaveLength(4);

    const set = must(bench.sets[0]);
    await services.workout.sets.complete(set.id, { weightKg: 40, reps: 10 });
    await services.workout.sets.uncomplete(set.id);
    expect(must((await active(services)).exercises[0]).sets[0]?.completedAt).toBeUndefined();
  });

  it('nilai set di luar batas ditolak', async () => {
    const { services } = await setup();
    await services.workout.start();
    const set = must(must((await active(services)).exercises[0]).sets[0]);
    expect(await services.workout.sets.complete(set.id, { weightKg: -5, reps: 10 })).toMatchObject({
      ok: false,
      error: { fields: { weightKg: 'set_weight_range' } },
    });
  });

  it('selesai: beban tersimpan, ringkasan, dan beban minggu depan naik', async () => {
    const { deps, services, advance } = await setup();
    await services.workout.start();
    await doExercise(services, 'barbell-bench-press', 40, 12);
    advance(45 * MIN);
    const result = await services.workout.finish();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.summary).toMatchObject({
      durationMin: 45,
      workingSets: 3,
      tonnageKg: 1440,
      prs: [],
    });
    expect(result.value.summary.next).toContainEqual(
      expect.objectContaining({
        exerciseId: 'barbell-bench-press',
        fromKg: 40,
        toKg: 42.5,
        targetReps: 8,
        kind: 'increase',
      }),
    );
    const bench = must(
      (await deps.programs.getActive())?.exercises.find(
        (e) => e.exerciseId === 'barbell-bench-press',
      ),
    );
    expect(bench.currentWeightKg).toBe(40);
    // Set yang tidak dikerjakan tidak masuk riwayat.
    expect(deps.state.setLogs.every((s) => s.completedAt !== undefined)).toBe(true);
    expect(await services.workout.getActive()).toBeNull();
  });

  it('Senin berikutnya: beban naik otomatis, dan rekor pribadi terdeteksi', async () => {
    const { services, advance } = await setup();
    await services.workout.start();
    await doExercise(services, 'barbell-bench-press', 40, 12);
    await services.workout.finish();

    advance(7 * DAY);
    await services.workout.start();
    const bench = must((await active(services)).exercises[0]);
    expect(bench.plan).toMatchObject({
      previousWeightKg: 40,
      decision: 'all_sets_hit_top',
      targetReps: 8,
    });
    expect(bench.previous.map((s) => s.reps)).toEqual([12, 12, 12]);
    expect(
      bench.sets
        .filter((s) => s.kind === 'working')
        .every((s) => s.weightKg === 42.5 && s.reps === 8),
    ).toBe(true);
    expect(bench.sets.filter((s) => s.kind === 'warmup').length).toBeGreaterThan(0);

    await doExercise(services, 'barbell-bench-press', 42.5, 10);
    const result = await services.workout.finish();
    expect(result.ok && result.value.summary.prs).toContainEqual(
      expect.objectContaining({ exerciseId: 'barbell-bench-press', weightKg: 42.5, reps: 10 }),
    );
  });

  it('check-in merah → sesi ringan, beban tidak menjadi patokan', async () => {
    const { deps, services, advance } = await setup();
    await services.workout.start();
    await doExercise(services, 'barbell-bench-press', 40, 12);
    await services.workout.finish();

    advance(7 * DAY);
    const checkIn = await services.checkIn.submit({
      sleepHours: 3.5,
      soreness: 2,
      energy: 4,
      painAreas: [],
    });
    expect(checkIn).toEqual({ ok: true, value: { readiness: 'red' } });
    await services.workout.start();
    const bench = must((await active(services)).exercises[0]);
    expect(bench.sets.filter((s) => s.kind === 'working')).toHaveLength(2);
    expect(must(bench.sets.find((s) => s.kind === 'working')).weightKg).toBe(37.5);

    await doExercise(services, 'barbell-bench-press', 37.5, 8);
    await services.workout.finish();
    const pe = must(
      (await deps.programs.getActive())?.exercises.find(
        (e) => e.exerciseId === 'barbell-bench-press',
      ),
    );
    expect(pe.currentWeightKg).toBe(40);
  });

  it('"Tetap latihan penuh" mengabaikan readiness', async () => {
    const { services } = await setup();
    await services.checkIn.submit({ sleepHours: 3.5, soreness: 2, energy: 4, painAreas: [] });
    await services.workout.start({ ignoreReadiness: true });
    expect((await active(services)).session.readiness).toBe('green');
  });

  it('check-in dengan berat badan mencatat pengukuran', async () => {
    const { services } = await setup();
    await services.checkIn.submit({
      sleepHours: 7,
      soreness: 2,
      energy: 4,
      painAreas: [],
      bodyWeightKg: 69,
    });
    expect((await services.profile.getOverview())?.weightKg).toBe(69);
    expect(await services.checkIn.today()).toMatchObject({ readiness: 'green', bodyWeightKg: 69 });
  });

  it('sesi tanpa aktivitas > 4 jam ditutup, set yang tercatat tetap ada', async () => {
    const { deps, services, advance } = await setup();
    await services.workout.start();
    const set = must(must((await active(services)).exercises[0]).sets[0]);
    await services.workout.sets.complete(set.id, { weightKg: 40, reps: 10 });
    advance(5 * 60 * MIN);
    expect(await services.workout.getActive()).toBeNull();
    expect(deps.state.sessions[0]?.status).toBe('abandoned');
    expect(deps.state.setLogs).toHaveLength(1);
  });

  it('batalkan sesi menghapus semuanya', async () => {
    const { deps, services } = await setup();
    await services.workout.start();
    expect((await services.workout.discard()).ok).toBe(true);
    expect(deps.state.sessions).toHaveLength(0);
    expect(deps.state.setLogs).toHaveLength(0);
  });
});
