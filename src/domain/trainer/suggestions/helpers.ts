import type { Muscle } from '../../exercise/types';
import type { ProgramDay } from '../../program/types';
import type { VolumeEntry } from '../../program/volume';
import { PROGRAM_EDIT_LIMITS } from '../../standards';
import { findSubstitutes } from '../substitution';
import type { ProgramExerciseWithDetail, SuggestionContext } from './types';

/** Otot besar yang dipantau volume dan frekuensinya. */
export const MAJOR_MUSCLES: readonly Muscle[] = [
  'chest',
  'back_lats',
  'quads',
  'hamstrings',
  'glutes',
];

const UPPER: readonly Muscle[] = [
  'chest',
  'back_lats',
  'back_upper',
  'shoulder_front',
  'shoulder_side',
  'shoulder_rear',
  'biceps',
  'triceps',
  'forearm',
];

export function toVolumeEntries(ctx: SuggestionContext): VolumeEntry[] {
  return ctx.exercises.map((e) => ({ exercise: e.exercise, sets: e.sets, dayKey: e.programDayId }));
}

export function exercisesOn(ctx: SuggestionContext, dayId: string): ProgramExerciseWithDetail[] {
  return ctx.exercises.filter((e) => e.programDayId === dayId);
}

export function trainsAsPrimary(e: ProgramExerciseWithDetail, muscle: Muscle): boolean {
  return e.exercise.primaryMuscles.includes(muscle);
}

function setsFor(ctx: SuggestionContext, dayId: string, muscle: Muscle): number {
  return exercisesOn(ctx, dayId)
    .filter((e) => trainsAsPrimary(e, muscle))
    .reduce((n, e) => n + e.sets, 0);
}

function isUpperDay(ctx: SuggestionContext, day: ProgramDay): boolean {
  return exercisesOn(ctx, day.id).some((e) =>
    e.exercise.primaryMuscles.some((m) => UPPER.includes(m)),
  );
}

function isLowerDay(ctx: SuggestionContext, day: ProgramDay): boolean {
  return exercisesOn(ctx, day.id).some((e) =>
    e.exercise.primaryMuscles.some((m) => !UPPER.includes(m) && m !== 'abs'),
  );
}

/** Hari yang cocok untuk menambah volume otot: bagian tubuh yang sama, volume otot itu paling kecil. */
export function dayForMuscle(
  ctx: SuggestionContext,
  muscle: Muscle,
  excludeDaysTraining = false,
): ProgramDay | undefined {
  const sameRegion = ctx.days.filter((d) =>
    UPPER.includes(muscle) ? isUpperDay(ctx, d) : isLowerDay(ctx, d),
  );
  const pool = (sameRegion.length > 0 ? sameRegion : [...ctx.days]).filter(
    (d) => !excludeDaysTraining || setsFor(ctx, d.id, muscle) === 0,
  );
  return [...pool].sort(
    (a, b) => setsFor(ctx, a.id, muscle) - setsFor(ctx, b.id, muscle) || a.order - b.order,
  )[0];
}

/** Gerakan baru untuk otot tertentu di sebuah hari: pengganti terbaik dari gerakan yang sudah melatih otot itu. */
export function exerciseToAdd(
  ctx: SuggestionContext,
  muscle: Muscle,
  dayId: string,
): string | undefined {
  const reference =
    exercisesOn(ctx, dayId).find((e) => trainsAsPrimary(e, muscle)) ??
    ctx.exercises.find((e) => trainsAsPrimary(e, muscle));
  if (!reference) return undefined;
  const excludeIds = exercisesOn(ctx, dayId).map((e) => e.exerciseId);
  const { results } = findSubstitutes(reference.exercise, { ...ctx.selection, excludeIds });
  return results.find((r) => r.exercise.primaryMuscles.includes(muscle))?.exercise.id;
}

/** Gerakan program yang masih bisa ditambah setnya, set paling sedikit lebih dulu. */
export function growableExercise(
  candidates: readonly ProgramExerciseWithDetail[],
): ProgramExerciseWithDetail | undefined {
  return [...candidates]
    .filter((e) => e.sets < PROGRAM_EDIT_LIMITS.setsMax)
    .sort((a, b) => a.sets - b.sets || a.order - b.order)[0];
}

export const DAY_MS = 86_400_000;
