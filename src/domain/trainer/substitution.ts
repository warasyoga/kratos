import type { Exercise } from '../exercise/types';
import type { Equipment, Experience, HealthCondition } from '../profile/types';
import { assessHealth } from './health';

export interface SelectionContext {
  library: readonly Exercise[];
  availableEquipment: readonly Equipment[];
  conditions: readonly HealthCondition[];
  experience: Experience;
  /** ID gerakan yang tidak boleh dipilih (mis. sudah ada di hari yang sama). */
  excludeIds?: readonly string[];
}

export interface RankedExercise {
  exercise: Exercise;
  score: number;
  progressionLocked: boolean;
}

export type RejectionReason = 'equipment' | 'health' | 'difficulty';

const MAX_DIFFICULTY: Record<Experience, number> = { beginner: 2, intermediate: 3 };
const MAX_RESULTS = 5;

/** Alasan gerakan tidak bisa dipakai, atau null jika bisa. */
export function whyUnavailable(exercise: Exercise, ctx: SelectionContext): RejectionReason | null {
  if (!exercise.equipment.every((e) => ctx.availableEquipment.includes(e))) return 'equipment';
  if (exercise.difficulty > MAX_DIFFICULTY[ctx.experience]) return 'difficulty';
  if (assessHealth(exercise, ctx.conditions) === 'rejected') return 'health';
  return null;
}

const overlap = <T>(a: readonly T[], b: readonly T[]) => a.filter((x) => b.includes(x)).length;

/** Skor kemiripan (aturan internal): docs/mesin-trainer/05-substitusi-gerakan.md */
export function similarityScore(original: Exercise, candidate: Exercise): number {
  const extraPrimary = candidate.primaryMuscles.filter(
    (m) => !original.primaryMuscles.includes(m),
  ).length;
  return (
    3 * overlap(original.primaryMuscles, candidate.primaryMuscles) -
    2 * extraPrimary +
    overlap(original.secondaryMuscles, candidate.secondaryMuscles) +
    (original.mechanics === candidate.mechanics ? 2 : 0) +
    (original.loadType === candidate.loadType ? 1 : 0) -
    candidate.difficulty
  );
}

function rank(
  original: Exercise,
  candidates: readonly Exercise[],
  ctx: SelectionContext,
): RankedExercise[] {
  return candidates
    .map((exercise) => ({
      exercise,
      score: similarityScore(original, exercise),
      progressionLocked: assessHealth(exercise, ctx.conditions) === 'locked',
    }))
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
    .slice(0, MAX_RESULTS);
}

/**
 * Pengganti gerakan, peringkat teratas lebih dulu. Syarat: pola sama, alat tersedia, aman,
 * sesuai pengalaman. Jika kosong, dilonggarkan ke gerakan dengan otot utama yang sama.
 */
export function findSubstitutes(
  original: Exercise,
  ctx: SelectionContext,
): { results: RankedExercise[]; relaxed: boolean } {
  const usable = ctx.library.filter(
    (e) =>
      e.id !== original.id && !ctx.excludeIds?.includes(e.id) && whyUnavailable(e, ctx) === null,
  );

  const samePattern = usable.filter((e) => e.pattern === original.pattern);
  if (samePattern.length > 0) return { results: rank(original, samePattern, ctx), relaxed: false };

  const sameMuscle = usable.filter((e) => overlap(original.primaryMuscles, e.primaryMuscles) > 0);
  return { results: rank(original, sameMuscle, ctx), relaxed: true };
}
