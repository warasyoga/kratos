import { isLoaded, type Exercise } from '../exercise/types';
import type { PlateInventory } from '../profile/types';
import { roundLoad } from '../strength/loads';
import { WARMUP_SCHEME, WARMUP_SINGLE_SET_MARGIN_KG } from '../standards';

export interface WarmupSet {
  weightKg: number;
  reps: number;
}

/**
 * Pemanasan spesifik hanya untuk gerakan compound pertama yang melatih suatu otot utama.
 * docs/sains-latihan/05-keamanan-dan-pemulihan.md §2
 */
export function needsWarmup(exercise: Exercise, earlierInSession: readonly Exercise[]): boolean {
  if (exercise.mechanics !== 'compound' || !isLoaded(exercise)) return false;
  const warmedUp = new Set(earlierInSession.flatMap((e) => e.primaryMuscles));
  return exercise.primaryMuscles.some((m) => !warmedUp.has(m));
}

/**
 * Set pemanasan 40% × 10, 60% × 5, 80% × 3 dari beban kerja, dibulatkan ke beban terdekat
 * yang bisa dipasang. Set yang sama dengan set sebelumnya atau ≥ beban kerja dibuang.
 */
export function generateWarmupSets(
  exercise: Exercise,
  workingKg: number,
  inventory: PlateInventory,
): WarmupSet[] {
  if (!isLoaded(exercise) || workingKg <= 0) return [];

  const minimum = exercise.loadType === 'barbell' ? inventory.barKg : 0;
  if (
    exercise.loadType === 'barbell' &&
    workingKg <= inventory.barKg + WARMUP_SINGLE_SET_MARGIN_KG
  ) {
    const first = WARMUP_SCHEME[0];
    return workingKg > inventory.barKg ? [{ weightKg: inventory.barKg, reps: first.reps }] : [];
  }

  const sets: WarmupSet[] = [];
  for (const step of WARMUP_SCHEME) {
    const raw = Math.max(workingKg * step.pct, minimum);
    const weightKg = roundLoad(raw, exercise.loadType, inventory, 'nearest');
    const previous = sets[sets.length - 1];
    if (weightKg >= workingKg || (previous && weightKg <= previous.weightKg)) continue;
    sets.push({ weightKg, reps: step.reps });
  }
  return sets;
}
