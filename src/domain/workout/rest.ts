import type { Exercise } from '../exercise/types';
import { GENERAL_WARMUP_MIN, REST_SEC, SET_WORK_SEC } from '../standards';

/**
 * Istirahat default antar set. Sumber: ACSM 2009 · docs/sains-latihan/02-kekuatan-dan-progresi.md §4
 */
export function defaultRestSec(exercise: Exercise): number {
  if (exercise.mechanics === 'isolation') return REST_SEC.isolation;
  return exercise.loadType === 'barbell' ? REST_SEC.compoundBarbell : REST_SEC.compound;
}

/**
 * Estimasi durasi sesi (menit), dibulatkan ke 5 menit terdekat.
 * docs/fitur/02-hari-ini.md
 */
export function estimateSessionMinutes(
  items: readonly { sets: number; restSec: number }[],
): number {
  const seconds = items.reduce((sum, i) => sum + i.sets * (SET_WORK_SEC + i.restSec), 0);
  const minutes = seconds / 60 + GENERAL_WARMUP_MIN;
  return Math.round(minutes / 5) * 5;
}
