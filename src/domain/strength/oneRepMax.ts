import { assertPositive } from '../common/assert';
import type { SetResult } from '../workout/types';
import { E1RM_MAX_REPS, EPLEY_DIVISOR } from '../standards';

function assertReps(reps: number): void {
  if (!Number.isInteger(reps) || reps < 1)
    throw new RangeError(`reps harus bilangan bulat ≥ 1, diterima ${reps}`);
}

/**
 * Estimasi one-rep max dengan rumus Epley: beban × (1 + reps/30).
 * Sumber: Epley 1985 · docs/sains-latihan/02-kekuatan-dan-progresi.md §1
 * Akurat untuk 1–10 repetisi; di atas itu mengembalikan null.
 */
export function estimateOneRepMax(weightKg: number, reps: number): number | null {
  assertPositive('weightKg', weightKg);
  assertReps(reps);
  if (reps === 1) return weightKg;
  if (reps > E1RM_MAX_REPS) return null;
  return weightKg * (1 + reps / EPLEY_DIVISOR);
}

/** Pembanding Brzycki: beban × 36 / (37 − reps). Tidak ditampilkan ke pengguna. */
export function estimateOneRepMaxBrzycki(weightKg: number, reps: number): number | null {
  assertPositive('weightKg', weightKg);
  assertReps(reps);
  if (reps > E1RM_MAX_REPS) return null;
  return (weightKg * 36) / (37 - reps);
}

/** 1RM estimasi tertinggi dari kumpulan set kerja. */
export function bestEstimatedOneRepMax(sets: readonly SetResult[]): number | null {
  let best: number | null = null;
  for (const s of sets) {
    if (s.weightKg <= 0 || s.reps < 1) continue;
    const e1rm = estimateOneRepMax(s.weightKg, s.reps);
    if (e1rm !== null && (best === null || e1rm > best)) best = e1rm;
  }
  return best;
}
