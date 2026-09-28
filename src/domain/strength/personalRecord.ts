import type { SetResult } from '../workout/types';
import { bestEstimatedOneRepMax, estimateOneRepMax } from './oneRepMax';

export type PrKind = 'estimated_1rm' | 'reps_at_weight';

/**
 * Jenis rekor pribadi yang dipecahkan sebuah set kerja, dibanding seluruh riwayat gerakan yang sama.
 * Set pertama kali tidak dihitung PR (menjadi patokan awal).
 * docs/sains-latihan/02-kekuatan-dan-progresi.md §2
 */
export function detectPersonalRecord(
  history: readonly SetResult[],
  candidate: SetResult,
): PrKind[] {
  if (history.length === 0 || candidate.weightKg <= 0 || candidate.reps < 1) return [];
  const kinds: PrKind[] = [];

  const candidateE1rm = estimateOneRepMax(candidate.weightKg, candidate.reps);
  const bestE1rm = bestEstimatedOneRepMax(history);
  if (candidateE1rm !== null && (bestE1rm === null || candidateE1rm > bestE1rm)) {
    kinds.push('estimated_1rm');
  }

  const mostRepsAtOrAbove = Math.max(
    0,
    ...history.filter((s) => s.weightKg >= candidate.weightKg).map((s) => s.reps),
  );
  if (candidate.reps > mostRepsAtOrAbove) kinds.push('reps_at_weight');

  return kinds;
}
