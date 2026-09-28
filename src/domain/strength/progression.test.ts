import { DEFAULT_INVENTORY } from '../profile/inventory';
import { testExercise } from '../testing/exercises';
import type { ExerciseSessionResult, SetResult } from '../workout/types';
import { decideNextLoad, type DecideNextLoadInput } from './progression';

const sets = (...spec: [number, number?][]): SetResult[] =>
  spec.map(([reps, rir]) => ({ weightKg: 65, reps, ...(rir === undefined ? {} : { rir }) }));
const session = (
  s: SetResult[],
  extra: Partial<ExerciseSessionResult> = {},
): ExerciseSessionResult => ({
  logDate: '2026-09-28',
  sets: s,
  ...extra,
});

const bench = (overrides: Partial<DecideNextLoadInput> = {}): DecideNextLoadInput => ({
  exercise: testExercise('barbell-bench-press'),
  prescription: { sets: 3, repMin: 8, repMax: 12, targetRir: 2 },
  currentWeightKg: 65,
  recentSessions: [],
  inventory: DEFAULT_INVENTORY,
  isDeloadWeek: false,
  ...overrides,
});

// Tabel kasus uji: docs/mesin-trainer/02-progresi-beban.md
describe('decideNextLoad', () => {
  it('semua set 12 reps di RIR ≥ 1 → naik ke 67,5 kg, target 8', () => {
    const d = decideNextLoad(bench({ recentSessions: [session(sets([12, 2], [12, 2], [12, 1]))] }));
    expect(d).toEqual({
      kind: 'increase',
      weightKg: 67.5,
      targetReps: 8,
      reason: 'all_sets_hit_top',
    });
  });

  it('12, 12, 11 → tahan 65 kg, target 12', () => {
    const d = decideNextLoad(bench({ recentSessions: [session(sets([12, 2], [12, 1], [11, 0]))] }));
    expect(d).toMatchObject({ kind: 'hold', weightKg: 65, targetReps: 12 });
  });

  it('9, 8, 8 → tahan 65 kg, target 9', () => {
    const d = decideNextLoad(bench({ recentSessions: [session(sets([9, 2], [8, 2], [8, 1]))] }));
    expect(d).toMatchObject({ kind: 'hold', weightKg: 65, targetReps: 9, reason: 'building_reps' });
  });

  it('semua 12 reps tetapi RIR rata-rata < 1 → belum naik', () => {
    const d = decideNextLoad(bench({ recentSessions: [session(sets([12, 0], [12, 0], [12, 1]))] }));
    expect(d.kind).toBe('hold');
  });

  it('squat 60 kg, 3 × 10 → naik 5 kg ke 65, target 6', () => {
    const d = decideNextLoad({
      ...bench(),
      exercise: testExercise('barbell-back-squat'),
      prescription: { sets: 3, repMin: 6, repMax: 10, targetRir: 2 },
      currentWeightKg: 60,
      recentSessions: [session(sets([10, 2], [10, 2], [10, 2]))],
    });
    expect(d).toMatchObject({ kind: 'increase', weightKg: 65, targetReps: 6 });
  });

  it('gagal repMin di ≥ 2 set pada 2 sesi → turun ke 60 kg', () => {
    const d = decideNextLoad(
      bench({ recentSessions: [session(sets([7], [6], [8])), session(sets([7], [7], [6]))] }),
    );
    expect(d).toEqual({
      kind: 'decrease',
      weightKg: 60,
      targetReps: 8,
      reason: 'missed_min_twice',
    });
  });

  it('gagal hanya di 1 sesi → belum turun', () => {
    const d = decideNextLoad(
      bench({ recentSessions: [session(sets([7], [6], [8])), session(sets([9], [8], [8]))] }),
    );
    expect(d.kind).toBe('hold');
  });

  it('lateral raise 6 kg: langkah ke 8 kg = +33% → tahan, target 17', () => {
    const d = decideNextLoad({
      ...bench(),
      exercise: testExercise('dumbbell-lateral-raise'),
      prescription: { sets: 2, repMin: 12, repMax: 15, targetRir: 2 },
      currentWeightKg: 6,
      recentSessions: [
        session([
          { weightKg: 6, reps: 15, rir: 2 },
          { weightKg: 6, reps: 15, rir: 2 },
        ]),
      ],
    });
    expect(d).toEqual({
      kind: 'hold',
      weightKg: 6,
      targetReps: 17,
      reason: 'big_step_building_reps',
    });
  });

  it('lateral raise 6 kg setelah 17 reps → naik ke 8 kg', () => {
    const d = decideNextLoad({
      ...bench(),
      exercise: testExercise('dumbbell-lateral-raise'),
      prescription: { sets: 2, repMin: 12, repMax: 15, targetRir: 2 },
      currentWeightKg: 6,
      recentSessions: [
        session([
          { weightKg: 6, reps: 17, rir: 1 },
          { weightKg: 6, reps: 17, rir: 1 },
        ]),
      ],
    });
    expect(d).toMatchObject({ kind: 'increase', weightKg: 8, targetReps: 12 });
  });

  it('minggu deload → 57,5 kg (65 × 0,9 = 58,5 dibulatkan ke bawah)', () => {
    const d = decideNextLoad(bench({ isDeloadWeek: true }));
    expect(d).toEqual({ kind: 'deload', weightKg: 57.5, targetReps: 8, reason: 'deload_week' });
  });

  it('sesi readiness merah diabaikan', () => {
    const d = decideNextLoad(
      bench({
        recentSessions: [
          session(sets([6], [6]), { readiness: 'red' }),
          session(sets([12, 2], [12, 2], [12, 2])),
        ],
      }),
    );
    expect(d.kind).toBe('increase');
  });

  it('progresi terkunci (kondisi sedang) → tidak naik', () => {
    const d = decideNextLoad(
      bench({
        progressionLocked: true,
        recentSessions: [session(sets([12, 2], [12, 2], [12, 2]))],
      }),
    );
    expect(d).toMatchObject({ kind: 'hold', weightKg: 65, reason: 'locked' });
  });

  it('set kurang dari resep → belum naik', () => {
    const d = decideNextLoad(bench({ recentSessions: [session(sets([12, 2], [12, 2]))] }));
    expect(d.kind).toBe('hold');
  });

  it('belum ada riwayat → tahan, target repMin', () => {
    expect(decideNextLoad(bench())).toMatchObject({
      kind: 'hold',
      targetReps: 8,
      reason: 'no_history',
    });
  });

  it('bodyweight di batas atas → tahan (tidak ada beban lebih berat)', () => {
    const d = decideNextLoad({
      ...bench(),
      exercise: testExercise('push-up'),
      currentWeightKg: 0,
      recentSessions: [
        session([
          { weightKg: 0, reps: 12 },
          { weightKg: 0, reps: 12 },
          { weightKg: 0, reps: 12 },
        ]),
      ],
    });
    expect(d).toMatchObject({ kind: 'hold', reason: 'no_heavier_load', targetReps: 12 });
  });
});
