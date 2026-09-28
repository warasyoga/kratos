import { createSequentialIds } from '../common/id';
import { DEFAULT_INVENTORY } from '../profile/inventory';
import type { ProgramExercise } from '../program/types';
import { must } from '../testing/profiles';
import { testExercise } from '../testing/exercises';
import { buildSession, type BuildSessionInput } from './buildSession';
import { planSession } from './planSession';

const pe = (id: string, currentWeightKg: number | null, sets = 3): ProgramExercise => ({
  id: `pe-${id}`,
  programDayId: 'day',
  exerciseId: id,
  order: 0,
  sets,
  repMin: 8,
  repMax: 12,
  targetRir: 2,
  restSec: 120,
  currentWeightKg,
  progressionLocked: false,
});

function build(overrides: Partial<BuildSessionInput> = {}) {
  const bench = pe('barbell-bench-press', 65);
  const lateral = pe('dumbbell-lateral-raise', null, 2);
  const decision = {
    kind: 'increase',
    weightKg: 67.5,
    targetReps: 8,
    reason: 'all_sets_hit_top',
  } as const;
  const plan = planSession({
    items: [
      { programExercise: bench, exercise: testExercise('barbell-bench-press'), decision },
      { programExercise: lateral, exercise: testExercise('dumbbell-lateral-raise') },
    ],
    readiness: 'green',
    isDeloadWeek: false,
    painAreas: [],
    inventory: DEFAULT_INVENTORY,
  });
  return buildSession({
    sessionId: 's1',
    programDayId: 'day',
    dayLabel: 'Upper A',
    logDate: '2026-09-28',
    startedAt: 0,
    readiness: 'green',
    isDeloadWeek: false,
    plan,
    decisions: new Map([[bench.id, decision]]),
    previousWeights: new Map([
      [bench.id, 65],
      [lateral.id, null],
    ]),
    inventory: DEFAULT_INVENTORY,
    newId: createSequentialIds('set'),
    ...overrides,
  });
}

describe('buildSession', () => {
  it('set pemanasan lalu set kerja dengan beban & target dari progresi', () => {
    const { sets } = build();
    const bench = sets.filter((s) => s.exerciseId === 'barbell-bench-press');
    expect(bench.map((s) => [s.kind, s.setNumber, s.weightKg, s.reps])).toEqual([
      ['warmup', 1, 27.5, 10],
      ['warmup', 2, 40, 5],
      ['warmup', 3, 55, 3],
      ['working', 1, 67.5, 8],
      ['working', 2, 67.5, 8],
      ['working', 3, 67.5, 8],
    ]);
    expect(bench.every((s) => s.completedAt === undefined)).toBe(true);
  });

  it('rencana mencatat beban sebelumnya dan alasan keputusan', () => {
    const { session } = build();
    expect(must(session.plan[0])).toMatchObject({
      previousWeightKg: 65,
      decision: 'all_sets_hit_top',
      decisionKind: 'increase',
      targetReps: 8,
    });
  });

  it('gerakan baru: kalibrasi dari beban awal yang aman, tanpa pemanasan', () => {
    const { session, sets } = build();
    const lateral = sets.filter((s) => s.exerciseId === 'dumbbell-lateral-raise');
    expect(lateral.map((s) => [s.kind, s.weightKg])).toEqual([
      ['working', 4],
      ['working', 4],
    ]);
    expect(must(session.plan[1])).toMatchObject({
      decision: 'calibration',
      previousWeightKg: null,
    });
  });

  it('sesi aktif menyimpan readiness dan penyesuaian', () => {
    const { session } = build();
    expect(session).toMatchObject({
      status: 'active',
      readiness: 'green',
      adjustment: 'none',
      dayLabel: 'Upper A',
    });
  });
});
