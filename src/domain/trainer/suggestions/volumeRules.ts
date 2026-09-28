import { weeklyFrequencyPerMuscle, weeklySetsPerMuscle, pushPullSets } from '../../program/volume';
import {
  HAM_TO_QUAD_RATIO,
  MIN_FREQUENCY_PER_MUSCLE,
  PULL_TO_PUSH_RATIO,
  SUGGESTION,
  WEEKLY_SETS_PER_MUSCLE,
} from '../../standards';
import {
  MAJOR_MUSCLES,
  dayForMuscle,
  exerciseToAdd,
  growableExercise,
  toVolumeEntries,
  trainsAsPrimary,
} from './helpers';
import type { SuggestionDraft, SuggestionRule } from './types';

const ADDED_REP_RANGE = { repMin: 10, repMax: 12 } as const;

/** Volume otot besar < 10 set/minggu (Schoenfeld et al. 2017). */
export const lowWeeklyVolume: SuggestionRule = {
  id: 'low_weekly_volume',
  category: 'program',
  evaluate(ctx) {
    const sets = weeklySetsPerMuscle(toVolumeEntries(ctx));
    const drafts: SuggestionDraft[] = [];
    for (const muscle of MAJOR_MUSCLES) {
      const current = sets.get(muscle) ?? 0;
      if (current >= WEEKLY_SETS_PER_MUSCLE.min) continue;
      const addSets = Math.min(
        SUGGESTION.addSetsStep,
        Math.ceil(WEEKLY_SETS_PER_MUSCLE.min - current),
      );
      const day = dayForMuscle(ctx, muscle);
      if (!day) continue;

      const params = { muscle, sets: current, addSets, dayLabel: day.label };
      const newExerciseId = exerciseToAdd(ctx, muscle, day.id);
      if (newExerciseId) {
        drafts.push({
          ruleId: this.id,
          targetKey: muscle,
          category: this.category,
          params: { ...params, exerciseId: newExerciseId },
          action: {
            kind: 'add_exercise',
            programDayId: day.id,
            exerciseId: newExerciseId,
            sets: addSets,
            ...ADDED_REP_RANGE,
          },
        });
        continue;
      }
      const grow = growableExercise(ctx.exercises.filter((e) => trainsAsPrimary(e, muscle)));
      drafts.push({
        ruleId: this.id,
        targetKey: muscle,
        category: this.category,
        params,
        ...(grow && { action: { kind: 'add_sets', programExerciseId: grow.id, sets: addSets } }),
      });
    }
    return drafts;
  },
};

/** Volume > 20 set/minggu: kurangi dari gerakan isolasi dulu. */
export const highWeeklyVolume: SuggestionRule = {
  id: 'high_weekly_volume',
  category: 'program',
  evaluate(ctx) {
    const sets = weeklySetsPerMuscle(toVolumeEntries(ctx));
    const drafts: SuggestionDraft[] = [];
    for (const [muscle, current] of sets) {
      if (current <= WEEKLY_SETS_PER_MUSCLE.max) continue;
      const excess = Math.ceil(current - WEEKLY_SETS_PER_MUSCLE.max);
      const target = ctx.exercises
        .filter((e) => trainsAsPrimary(e, muscle) && e.sets > 1)
        .sort(
          (a, b) =>
            Number(a.exercise.mechanics === 'compound') -
              Number(b.exercise.mechanics === 'compound') || b.sets - a.sets,
        )[0];
      drafts.push({
        ruleId: this.id,
        targetKey: muscle,
        category: this.category,
        params: { muscle, sets: current, removeSets: excess },
        ...(target && {
          action: {
            kind: 'remove_sets',
            programExerciseId: target.id,
            sets: Math.min(excess, target.sets - 1),
          },
        }),
      });
    }
    return drafts;
  },
};

/** Otot besar hanya dilatih 1×/minggu (Schoenfeld et al. 2016). */
export const lowFrequency: SuggestionRule = {
  id: 'low_frequency',
  category: 'program',
  evaluate(ctx) {
    const frequency = weeklyFrequencyPerMuscle(toVolumeEntries(ctx));
    const drafts: SuggestionDraft[] = [];
    for (const muscle of MAJOR_MUSCLES) {
      const times = frequency.get(muscle) ?? 0;
      if (times === 0 || times >= MIN_FREQUENCY_PER_MUSCLE) continue; // 0× ditangani low_weekly_volume
      const day = dayForMuscle(ctx, muscle, true);
      const exerciseId = day && exerciseToAdd(ctx, muscle, day.id);
      drafts.push({
        ruleId: this.id,
        targetKey: muscle,
        category: this.category,
        params: {
          muscle,
          frequency: times,
          ...(day && { dayLabel: day.label }),
          ...(exerciseId && { exerciseId }),
        },
        ...(day &&
          exerciseId && {
            action: {
              kind: 'add_exercise',
              programDayId: day.id,
              exerciseId,
              sets: SUGGESTION.addSetsStep,
              ...ADDED_REP_RANGE,
            },
          }),
      });
    }
    return drafts;
  },
};

/** Set tarik lebih sedikit dari set dorong (aturan internal). */
export const pushPullImbalance: SuggestionRule = {
  id: 'push_pull_imbalance',
  category: 'program',
  evaluate(ctx) {
    const { push, pull } = pushPullSets(toVolumeEntries(ctx));
    if (push === 0 || pull / push >= PULL_TO_PUSH_RATIO.min) return [];
    const grow = growableExercise(
      ctx.exercises.filter((e) =>
        ['horizontal_pull', 'vertical_pull'].includes(e.exercise.pattern),
      ),
    );
    return [
      {
        ruleId: this.id,
        targetKey: 'upper',
        category: this.category,
        params: { push, pull },
        ...(grow && {
          action: { kind: 'add_sets', programExerciseId: grow.id, sets: SUGGESTION.addSetsStep },
        }),
      },
    ];
  },
};

/** Paha belakang < 75% paha depan (aturan internal). */
export const quadHamImbalance: SuggestionRule = {
  id: 'quad_ham_imbalance',
  category: 'program',
  evaluate(ctx) {
    const sets = weeklySetsPerMuscle(toVolumeEntries(ctx));
    const quads = sets.get('quads') ?? 0;
    const hams = sets.get('hamstrings') ?? 0;
    if (quads === 0 || hams / quads >= HAM_TO_QUAD_RATIO.min) return [];
    const hamExercises = ctx.exercises.filter((e) => trainsAsPrimary(e, 'hamstrings'));
    const grow =
      growableExercise(hamExercises.filter((e) => e.exercise.pattern === 'knee_flexion')) ??
      growableExercise(hamExercises);
    return [
      {
        ruleId: this.id,
        targetKey: 'lower',
        category: this.category,
        params: { quads, hamstrings: hams },
        ...(grow && {
          action: { kind: 'add_sets', programExerciseId: grow.id, sets: SUGGESTION.addSetsStep },
        }),
      },
    ];
  },
};
