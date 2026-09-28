import { daysBetween } from '../common/weekday';
import type { Readiness } from '../workout/types';
import { EARLY_DELOAD, MESOCYCLE_WEEKS } from '../standards';

/** Minggu program ke-n (mulai 1) pada tanggal tertentu. */
export function programWeek(startDate: string, date: string): number {
  return Math.floor(daysBetween(startDate, date) / 7) + 1;
}

/** Minggu ke-n dalam blok 6 minggu (1–6). */
export function blockWeek(week: number): number {
  return ((week - 1) % MESOCYCLE_WEEKS) + 1;
}

/** Deload terjadwal: minggu terakhir setiap blok. docs/mesin-trainer/06-deload.md */
export function isScheduledDeloadWeek(startDate: string, date: string): boolean {
  return blockWeek(programWeek(startDate, date)) === MESOCYCLE_WEEKS;
}

export type EarlyDeloadSignal = 'performance_drop' | 'poor_readiness' | 'repeated_decreases';

export interface EarlyDeloadInput {
  blockWeek: number;
  /** Per gerakan: 1RM estimasi terbaik tiap sesi dalam blok ini, urut kronologis. */
  e1rmHistory: readonly (readonly number[])[];
  /** Hasil check-in 7 hari terakhir. */
  recentReadiness: readonly Readiness[];
  /** Jumlah gerakan berbeda yang bebannya diturunkan minggu ini. */
  decreaseDecisionsThisWeek: number;
}

/** Performa turun: dua sesi terakhir sama-sama ≥ 5% di bawah rekor sebelumnya dalam blok. */
function isDropping(history: readonly number[]): boolean {
  if (history.length < 3) return false;
  const best = Math.max(...history.slice(0, -2));
  return history.slice(-2).every((e1rm) => e1rm <= best * (1 - EARLY_DELOAD.e1rmDropPct));
}

/**
 * Sinyal untuk mengusulkan deload lebih awal (minimal minggu ke-4 blok).
 * Dasar: Bell et al. 2023 · docs/mesin-trainer/06-deload.md
 */
export function earlyDeloadSignals(input: EarlyDeloadInput): EarlyDeloadSignal[] {
  if (input.blockWeek < EARLY_DELOAD.minBlockWeek || input.blockWeek >= MESOCYCLE_WEEKS) return [];

  const signals: EarlyDeloadSignal[] = [];
  if (input.e1rmHistory.filter(isDropping).length >= EARLY_DELOAD.minExercisesDropping) {
    signals.push('performance_drop');
  }
  if (
    input.recentReadiness.filter((r) => r !== 'green').length >= EARLY_DELOAD.poorReadinessCount
  ) {
    signals.push('poor_readiness');
  }
  if (input.decreaseDecisionsThisWeek >= EARLY_DELOAD.minDecreaseDecisions) {
    signals.push('repeated_decreases');
  }
  return signals;
}
