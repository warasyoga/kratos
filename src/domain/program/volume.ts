import type { Exercise, MovementPattern, Muscle } from '../exercise/types';
import { SECONDARY_MUSCLE_SET_WEIGHT, WEEKLY_SETS_PER_MUSCLE } from '../standards';

export interface VolumeEntry {
  exercise: Exercise;
  sets: number;
  /** Penanda hari, untuk menghitung frekuensi per otot. */
  dayKey: string;
}

export type VolumeStatus = 'low' | 'optimal' | 'high';

/** Otot besar yang dipantau volume dan frekuensinya (docs/sains-latihan/03-desain-program.md). */
export const MAJOR_MUSCLES: readonly Muscle[] = [
  'chest',
  'back_lats',
  'quads',
  'hamstrings',
  'glutes',
];

/**
 * Set per otot per minggu: otot utama 1 set, otot pendukung 0,5 set.
 * docs/sains-latihan/03-desain-program.md §1
 */
export function weeklySetsPerMuscle(entries: readonly VolumeEntry[]): Map<Muscle, number> {
  const totals = new Map<Muscle, number>();
  const add = (m: Muscle, n: number) => totals.set(m, (totals.get(m) ?? 0) + n);
  for (const { exercise, sets } of entries) {
    exercise.primaryMuscles.forEach((m) => add(m, sets));
    exercise.secondaryMuscles.forEach((m) => add(m, sets * SECONDARY_MUSCLE_SET_WEIGHT));
  }
  return totals;
}

/** Jumlah hari berbeda yang melatih otot sebagai otot utama. */
export function weeklyFrequencyPerMuscle(entries: readonly VolumeEntry[]): Map<Muscle, number> {
  const days = new Map<Muscle, Set<string>>();
  for (const { exercise, dayKey } of entries) {
    for (const m of exercise.primaryMuscles) {
      if (!days.has(m)) days.set(m, new Set());
      days.get(m)?.add(dayKey);
    }
  }
  return new Map([...days].map(([m, set]) => [m, set.size]));
}

export function classifyVolume(sets: number): VolumeStatus {
  if (sets < WEEKLY_SETS_PER_MUSCLE.min) return 'low';
  if (sets > WEEKLY_SETS_PER_MUSCLE.max) return 'high';
  return 'optimal';
}

const PUSH: readonly MovementPattern[] = ['horizontal_push', 'vertical_push'];
const PULL: readonly MovementPattern[] = ['horizontal_pull', 'vertical_pull'];

/** Total set gerakan dorong dan tarik tubuh atas. */
export function pushPullSets(entries: readonly VolumeEntry[]): { push: number; pull: number } {
  const sum = (patterns: readonly MovementPattern[]) =>
    entries.filter((e) => patterns.includes(e.exercise.pattern)).reduce((n, e) => n + e.sets, 0);
  return { push: sum(PUSH), pull: sum(PULL) };
}
