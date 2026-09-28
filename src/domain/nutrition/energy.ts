import { assertInRange, assertPositive, roundTo } from '../common/assert';
import type { ActivityLevel, Sex } from '../profile/types';
import { ACTIVITY_FACTOR, CALORIE_ROUNDING_KCAL, MIFFLIN, SURPLUS_KCAL } from '../standards';

export interface BmrInput {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}

/**
 * Energi basal (kkal/hari) dengan rumus Mifflin-St Jeor.
 * Sumber: Mifflin et al. 1990 · docs/sains-latihan/01-nutrisi.md §1
 */
export function calculateBmr({ sex, weightKg, heightCm, ageYears }: BmrInput): number {
  assertPositive('weightKg', weightKg);
  assertPositive('heightCm', heightCm);
  assertPositive('ageYears', ageYears);
  const offset = sex === 'male' ? MIFFLIN.maleOffset : MIFFLIN.femaleOffset;
  return MIFFLIN.weight * weightKg + MIFFLIN.height * heightCm - MIFFLIN.age * ageYears + offset;
}

/** Energi harian total = BMR × faktor aktivitas. docs/sains-latihan/01-nutrisi.md §2 */
export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  assertPositive('bmr', bmr);
  return bmr * ACTIVITY_FACTOR[activityLevel];
}

/**
 * Target kalori menambah otot = TDEE + surplus, dibulatkan ke 10 kkal.
 * Sumber: Iraki et al. 2019 · docs/sains-latihan/01-nutrisi.md §3
 */
export function calculateCalorieTarget(
  tdee: number,
  surplusKcal: number = SURPLUS_KCAL.default,
): number {
  assertPositive('tdee', tdee);
  assertInRange('surplusKcal', surplusKcal, SURPLUS_KCAL.min, SURPLUS_KCAL.max);
  return roundTo(tdee + surplusKcal, CALORIE_ROUNDING_KCAL);
}
