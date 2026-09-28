import { assertInRange, roundTo } from '../common/assert';
import type { Sex } from '../profile/types';
import {
  WATER_EXTRA_L_PER_TRAINING_HOUR,
  WATER_FROM_DRINKS_RATIO,
  WATER_TOTAL_L,
} from '../standards';

/**
 * Target minum harian (liter), dibulatkan ke 0,1 L.
 * Dasar: EFSA 2010 (air total) × 80% dari minuman + tambahan saat latihan.
 * docs/sains-latihan/01-nutrisi.md §6
 */
export function calculateWaterTargetL(sex: Sex, trainingMinutes = 0): number {
  assertInRange('trainingMinutes', trainingMinutes, 0, 600);
  const base = WATER_TOTAL_L[sex] * WATER_FROM_DRINKS_RATIO;
  const extra = (trainingMinutes / 60) * WATER_EXTRA_L_PER_TRAINING_HOUR;
  return roundTo(base + extra, 0.1);
}
