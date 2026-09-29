import type { TrendPoint, WeighIn } from '../body/weightTrend';
import { assertPositive } from '../common/assert';
import { addDays } from '../common/weekday';
import { CALORIE_RECALIBRATION, WEIGHT_GAIN_PCT_PER_WEEK } from '../standards';

export type CalorieAdjustment =
  | { kind: 'increase'; deltaKcal: number }
  | { kind: 'decrease'; deltaKcal: number }
  | { kind: 'keep' }
  | { kind: 'insufficient_data' };

export interface RecalibrationInput {
  /** Perubahan tren berat per minggu (kg), dari computeWeightTrend. */
  weeklyGainKg: number;
  bodyWeightKg: number;
  /** Jumlah penimbangan dalam 14 hari terakhir. */
  weighInsInWindow: number;
}

/**
 * Usulan penyesuaian kalori dari laju naik berat nyata. Aturan internal,
 * docs/sains-latihan/01-nutrisi.md §7
 */
export function decideCalorieAdjustment({
  weeklyGainKg,
  bodyWeightKg,
  weighInsInWindow,
}: RecalibrationInput): CalorieAdjustment {
  assertPositive('bodyWeightKg', bodyWeightKg);
  if (weighInsInWindow < CALORIE_RECALIBRATION.minWeighIns) return { kind: 'insufficient_data' };

  const rate = weeklyGainKg / bodyWeightKg;
  if (rate < WEIGHT_GAIN_PCT_PER_WEEK.min) {
    return { kind: 'increase', deltaKcal: CALORIE_RECALIBRATION.stepKcal };
  }
  if (rate > WEIGHT_GAIN_PCT_PER_WEEK.max) {
    return { kind: 'decrease', deltaKcal: -CALORIE_RECALIBRATION.stepKcal };
  }
  return { kind: 'keep' };
}

/**
 * Masukan kalibrasi dari tren berat: perubahan tren 14 hari terakhir ÷ 2 minggu
 * dan jumlah penimbangan di jendela itu. null jika tren belum 14 hari.
 */
export function recalibrationInput(
  trend: readonly TrendPoint[],
  weighIns: readonly WeighIn[],
): RecalibrationInput | null {
  const last = trend.at(-1);
  if (!last) return null;
  const windowStart = addDays(last.logDate, -CALORIE_RECALIBRATION.everyDays);
  const start = trend.find((p) => p.logDate === windowStart);
  if (!start) return null;
  return {
    weeklyGainKg: ((last.trendKg - start.trendKg) * 7) / CALORIE_RECALIBRATION.everyDays,
    bodyWeightKg: last.trendKg,
    weighInsInWindow: weighIns.filter((w) => w.logDate > windowStart).length,
  };
}

/** Rentang target naik berat per minggu (kg). Contoh 68,4 kg → 0,17–0,34 kg. */
export function weeklyGainTargetKg(bodyWeightKg: number): { min: number; max: number } {
  assertPositive('bodyWeightKg', bodyWeightKg);
  return {
    min: bodyWeightKg * WEIGHT_GAIN_PCT_PER_WEEK.min,
    max: bodyWeightKg * WEIGHT_GAIN_PCT_PER_WEEK.max,
  };
}
