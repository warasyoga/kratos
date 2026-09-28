import { DEFAULT_INVENTORY } from '../profile/inventory';
import type { ProgramExercise } from '../program/types';
import { testExercise } from '../testing/exercises';
import { planSession, type PlanSessionInput } from './planSession';

const pe = (id: string, overrides: Partial<ProgramExercise> = {}): ProgramExercise => ({
  id: `pe-${id}`,
  programDayId: 'day-1',
  exerciseId: id,
  order: 0,
  sets: 3,
  repMin: 8,
  repMax: 12,
  targetRir: 2,
  restSec: 120,
  currentWeightKg: 65,
  progressionLocked: false,
  ...overrides,
});

const input = (overrides: Partial<PlanSessionInput> = {}): PlanSessionInput => ({
  items: [
    { programExercise: pe('barbell-bench-press'), exercise: testExercise('barbell-bench-press') },
    {
      programExercise: pe('incline-dumbbell-press', { currentWeightKg: 18, sets: 3 }),
      exercise: testExercise('incline-dumbbell-press'),
    },
    {
      programExercise: pe('dumbbell-lateral-raise', { currentWeightKg: 6, sets: 2 }),
      exercise: testExercise('dumbbell-lateral-raise'),
    },
  ],
  readiness: 'green',
  isDeloadWeek: false,
  painAreas: [],
  inventory: DEFAULT_INVENTORY,
  ...overrides,
});

describe('planSession', () => {
  it('hijau: sesuai rencana, pemanasan hanya untuk compound pertama per otot', () => {
    const plan = planSession(input());
    expect(plan.adjustment).toBe('none');
    const [bench, incline, lateral] = plan.exercises;
    expect(bench).toMatchObject({ sets: 3, weightKg: 65, targetRir: 2, targetReps: 8 });
    expect(bench?.warmupSets).toHaveLength(3);
    // Incline: dada sudah hangat, tetapi bahu depan belum → tetap pemanasan.
    expect(incline?.warmupSets.length).toBeGreaterThan(0);
    expect(lateral?.warmupSets).toEqual([]);
  });

  it('kuning: −1 set (min. 2), RIR +1', () => {
    const plan = planSession(input({ readiness: 'yellow' }));
    expect(plan.adjustment).toBe('reduced');
    expect(plan.exercises.map((e) => [e.sets, e.targetRir])).toEqual([
      [2, 3],
      [2, 3],
      [2, 3],
    ]);
  });

  it('merah (contoh dokumen): bench 3 → 2 set, 65 → 57,5 kg, RIR 3', () => {
    const plan = planSession(input({ readiness: 'red' }));
    expect(plan.adjustment).toBe('light');
    expect(plan.exercises[0]).toMatchObject({ sets: 2, weightKg: 57.5, targetRir: 3 });
    expect(plan.exercises[2]).toMatchObject({ sets: 1 });
  });

  it('deload: set setengah, beban dari keputusan progresi', () => {
    const plan = planSession(
      input({
        isDeloadWeek: true,
        readiness: 'red',
        items: [
          {
            programExercise: pe('barbell-bench-press'),
            exercise: testExercise('barbell-bench-press'),
            decision: { kind: 'deload', weightKg: 57.5, targetReps: 8, reason: 'deload_week' },
          },
        ],
      }),
    );
    expect(plan.adjustment).toBe('deload');
    expect(plan.exercises[0]).toMatchObject({ sets: 2, weightKg: 57.5, targetRir: 3 });
  });

  it('keputusan progresi menentukan beban dan target repetisi', () => {
    const plan = planSession(
      input({
        items: [
          {
            programExercise: pe('barbell-bench-press'),
            exercise: testExercise('barbell-bench-press'),
            decision: {
              kind: 'increase',
              weightKg: 67.5,
              targetReps: 8,
              reason: 'all_sets_hit_top',
            },
          },
        ],
      }),
    );
    expect(plan.exercises[0]).toMatchObject({ weightKg: 67.5, targetReps: 8 });
  });

  it('nyeri bahu kiri menandai gerakan yang membebani bahu', () => {
    const plan = planSession(input({ painAreas: ['shoulder_left'] }));
    expect(plan.exercises.every((e) => e.painFlag)).toBe(true);
  });

  it('gerakan belum dikalibrasi: tanpa beban dan tanpa pemanasan', () => {
    const plan = planSession(
      input({
        items: [
          {
            programExercise: pe('barbell-bench-press', { currentWeightKg: null }),
            exercise: testExercise('barbell-bench-press'),
          },
        ],
      }),
    );
    expect(plan.exercises[0]).toMatchObject({ weightKg: null, warmupSets: [] });
  });
});
