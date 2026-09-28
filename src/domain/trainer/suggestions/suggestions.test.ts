import { createSequentialIds } from '../../common/id';
import type { Weekday } from '../../common/weekday';
import { generateProgram } from '../../program/generateProgram';
import { FULL_GYM, TEST_EXERCISES, testExercise } from '../../testing/exercises';
import { evaluateSuggestions, type SuggestionContext } from './index';

const NOW = new Date('2026-09-28T07:00:00').getTime();
const DAY = 86_400_000;
const selection = {
  library: TEST_EXERCISES,
  availableEquipment: FULL_GYM,
  conditions: [],
  experience: 'beginner' as const,
};

function contextFor(
  trainingDays: Weekday[] = ['mon', 'tue', 'thu', 'fri'],
  overrides: Partial<SuggestionContext> = {},
): SuggestionContext {
  const program = generateProgram({
    ...selection,
    trainingDays,
    startDate: '2026-09-28',
    createdAt: NOW,
    newId: createSequentialIds('p'),
  });
  return {
    now: NOW,
    days: program.days,
    exercises: program.exercises.map((e) => ({ ...e, exercise: testExercise(e.exerciseId) })),
    selection,
    trainingDays,
    isDeloadWeek: false,
    ...overrides,
  };
}

/** Konteks dengan beberapa gerakan dihapus (mensimulasikan editan pengguna). */
function withoutExercises(ctx: SuggestionContext, ...exerciseIds: string[]): SuggestionContext {
  return { ...ctx, exercises: ctx.exercises.filter((e) => !exerciseIds.includes(e.exerciseId)) };
}

const ruleIds = (ctx: SuggestionContext) => evaluateSuggestions(ctx).map((s) => s.ruleId);
const dayId = (ctx: SuggestionContext, label: string) =>
  ctx.days.find((d) => d.label === label)?.id;

describe('evaluateSuggestions', () => {
  it.each([
    [['mon', 'wed', 'fri']],
    [['mon', 'tue', 'thu', 'fri']],
    [['mon', 'tue', 'wed', 'thu', 'fri']],
    [['mon', 'tue', 'wed', 'thu', 'fri', 'sat']],
  ] as Weekday[][][])('program bawaan %j tidak memicu saran', (days) => {
    expect(evaluateSuggestions(contextFor(days))).toEqual([]);
  });

  describe('volume', () => {
    it('dada 8 set → tambah 2 set Dumbbell Bench Press di Upper B', () => {
      const ctx = withoutExercises(contextFor(), 'cable-fly', 'face-pull');
      const [s] = evaluateSuggestions(ctx);
      expect(s).toMatchObject({
        ruleId: 'low_weekly_volume',
        targetKey: 'chest',
        params: { muscle: 'chest', sets: 8, addSets: 2, dayLabel: 'Upper B' },
        action: {
          kind: 'add_exercise',
          programDayId: dayId(ctx, 'Upper B'),
          exerciseId: 'dumbbell-bench-press',
          sets: 2,
        },
      });
    });

    it('volume > 20 set → kurangi dari gerakan isolasi', () => {
      const base = contextFor();
      const ctx = {
        ...base,
        exercises: base.exercises.map((e) =>
          e.exercise.primaryMuscles.includes('chest') ? { ...e, sets: 6 } : e,
        ),
      };
      const s = evaluateSuggestions(ctx).find((x) => x.ruleId === 'high_weekly_volume');
      const fly = ctx.exercises.find((e) => e.exerciseId === 'cable-fly');
      expect(s?.action).toEqual({ kind: 'remove_sets', programExerciseId: fly?.id, sets: 4 });
    });

    it('dada hanya dilatih 1×/minggu → tambah gerakan dada di hari atas lain', () => {
      const ctx = withoutExercises(contextFor(), 'machine-chest-press', 'cable-fly');
      const s = evaluateSuggestions(ctx).find((x) => x.ruleId === 'low_frequency');
      expect(s?.action).toMatchObject({
        kind: 'add_exercise',
        programDayId: dayId(ctx, 'Upper B'),
      });
    });

    it('set tarik < set dorong → tambah set gerakan tarik', () => {
      const ctx = withoutExercises(contextFor(), 'face-pull', 'assisted-pull-up');
      const s = evaluateSuggestions(ctx).find((x) => x.ruleId === 'push_pull_imbalance');
      expect(s).toMatchObject({
        params: { push: 13, pull: 9 },
        action: { kind: 'add_sets', sets: 2 },
      });
    });

    it('paha belakang < 75% paha depan', () => {
      const ctx = withoutExercises(
        contextFor(),
        'romanian-deadlift',
        'lying-leg-curl',
        'trap-bar-deadlift',
      );
      expect(ruleIds(ctx)).toContain('quad_ham_imbalance');
    });
  });

  describe('progres', () => {
    const benchId = (ctx: SuggestionContext) =>
      ctx.exercises.find((e) => e.exerciseId === 'barbell-bench-press')?.id ?? '';

    it('1RM tidak naik 3 sesi → tawarkan gerakan pengganti', () => {
      const base = contextFor();
      const ctx = { ...base, e1rmHistory: { [benchId(base)]: [80, 82, 81, 82, 80] } };
      const s = evaluateSuggestions(ctx).find((x) => x.ruleId === 'stagnation');
      expect(s?.action).toEqual({
        kind: 'swap_exercise',
        programExerciseId: benchId(base),
        exerciseId: 'dumbbell-bench-press',
      });
    });

    it('masih naik → tidak stagnan', () => {
      const base = contextFor();
      expect(ruleIds({ ...base, e1rmHistory: { [benchId(base)]: [80, 81, 82, 83, 84] } })).toEqual(
        [],
      );
    });

    it('minggu deload → stagnasi tidak dinilai', () => {
      const base = contextFor();
      const ctx = {
        ...base,
        isDeloadWeek: true,
        e1rmHistory: { [benchId(base)]: [80, 82, 81, 82, 80] },
      };
      expect(ruleIds(ctx)).toEqual([]);
    });

    it('sinyal deload awal → saran deload di urutan pertama', () => {
      const ctx = withoutExercises(
        contextFor(undefined, { earlyDeloadSuggested: true }),
        'cable-fly',
      );
      expect(evaluateSuggestions(ctx)[0]).toMatchObject({
        ruleId: 'deload_due',
        category: 'safety',
        action: { kind: 'start_deload' },
      });
    });
  });

  describe('jadwal', () => {
    it('kehadiran 5 dari 8 sesi → tawarkan program 3 hari', () => {
      const s = evaluateSuggestions(
        contextFor(undefined, { attendance: { scheduled: 8, completed: 5 } }),
      );
      expect(s[0]?.action).toEqual({
        kind: 'regenerate_program',
        trainingDays: ['mon', 'wed', 'fri'],
      });
    });

    it('kehadiran 75% masih wajar', () => {
      expect(
        ruleIds(contextFor(undefined, { attendance: { scheduled: 8, completed: 6 } })),
      ).toEqual([]);
    });

    it('Full Body di Sen–Sel–Rab → pindahkan hari kedua ke Jumat', () => {
      const ctx = contextFor(['mon', 'tue', 'wed']);
      const s = evaluateSuggestions(ctx).filter((x) => x.ruleId === 'consecutive_same_split');
      expect(s[0]?.action).toEqual({
        kind: 'move_day',
        programDayId: dayId(ctx, 'Full Body B'),
        weekday: 'fri',
      });
    });
  });

  describe('gaya hidup & pemeliharaan', () => {
    it('protein < 80% target di ≥ 4 hari', () => {
      const s = evaluateSuggestions(
        contextFor(undefined, {
          protein: { targetG: 137, dailyG: [90, 95, 100, 140, 98, 85, 137] },
        }),
      );
      expect(s).toContainEqual(
        expect.objectContaining({ ruleId: 'low_protein', params: { averageG: 106, targetG: 137 } }),
      );
    });

    it('tidur rata-rata < 7 jam', () => {
      expect(ruleIds(contextFor(undefined, { sleepHours: [6, 6.5, 6] }))).toContain('low_sleep');
    });

    it('kalibrasi kalori', () => {
      const s = evaluateSuggestions(
        contextFor(undefined, { calorieAdjustment: { kind: 'increase', deltaKcal: 150 } }),
      );
      expect(s[0]?.action).toEqual({ kind: 'set_calorie_offset', deltaKcal: 150 });
    });

    it('aerobik < 150 menit/minggu (WHO)', () => {
      expect(ruleIds(contextFor(undefined, { aerobicMinutesLastWeek: 110 }))).toContain(
        'aerobic_below_who',
      );
      expect(ruleIds(contextFor(undefined, { aerobicMinutesLastWeek: 160 }))).toEqual([]);
    });

    it('PAR-Q+ belum diisi atau kedaluwarsa', () => {
      expect(ruleIds(contextFor(undefined, { parqCompletedAt: null }))).toContain('parq_expired');
      expect(ruleIds(contextFor(undefined, { parqCompletedAt: NOW - 400 * DAY }))).toContain(
        'parq_expired',
      );
      expect(ruleIds(contextFor(undefined, { parqCompletedAt: NOW - 30 * DAY }))).toEqual([]);
    });

    it('backup > 14 hari', () => {
      const s = evaluateSuggestions(contextFor(undefined, { backupReferenceAt: NOW - 20 * DAY }));
      expect(s[0]).toMatchObject({ ruleId: 'backup_reminder', params: { days: 20 } });
    });
  });

  describe('urutan & jeda setelah diabaikan', () => {
    it('keamanan → program → nutrisi → lainnya', () => {
      const ctx = withoutExercises(
        contextFor(undefined, {
          parqCompletedAt: null,
          backupReferenceAt: NOW - 20 * DAY,
          protein: { targetG: 137, dailyG: [90, 90, 90, 90] },
        }),
        'cable-fly',
        'face-pull',
      );
      expect(evaluateSuggestions(ctx).map((s) => s.category)).toEqual([
        'safety',
        'program',
        'nutrition',
        'other',
      ]);
    });

    it('saran yang diabaikan < 14 hari tidak muncul lagi', () => {
      const ctx = withoutExercises(contextFor(), 'cable-fly', 'face-pull');
      const dismissed = [
        { ruleId: 'low_weekly_volume', targetKey: 'chest', resolvedAt: NOW - 5 * DAY },
      ];
      expect(evaluateSuggestions(ctx, dismissed)).toEqual([]);
    });

    it('setelah 14 hari muncul lagi', () => {
      const ctx = withoutExercises(contextFor(), 'cable-fly', 'face-pull');
      const dismissed = [
        { ruleId: 'low_weekly_volume', targetKey: 'chest', resolvedAt: NOW - 20 * DAY },
      ];
      expect(evaluateSuggestions(ctx, dismissed)).toHaveLength(1);
    });
  });
});
