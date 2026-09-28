import type { SetLog, SetResult } from './types';

/**
 * Beban kerja sebuah gerakan dalam satu sesi: beban yang paling sering dipakai di set kerja
 * yang selesai (seri → yang lebih berat). Satu set turun beban karena lelah tidak menggeser patokan.
 */
export function workingWeightOf(sets: readonly SetResult[]): number | null {
  if (sets.length === 0) return null;
  const counts = new Map<number, number>();
  for (const s of sets) counts.set(s.weightKg, (counts.get(s.weightKg) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? null;
}

/** Tonase: Σ beban × repetisi (kg). */
export function tonnageOf(sets: readonly SetResult[]): number {
  return sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

export const isCompletedWorking = (s: SetLog) =>
  s.kind === 'working' && s.completedAt !== undefined;

/** Durasi sesi dalam menit penuh. */
export function durationMinutes(startedAt: number, finishedAt: number): number {
  return Math.max(0, Math.round((finishedAt - startedAt) / 60_000));
}
