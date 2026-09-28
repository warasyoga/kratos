import { assertInRange, assertPositive } from '../common/assert';
import { FAT_PCT_OF_KCAL, KCAL_PER_G, PROTEIN_G_PER_KG } from '../standards';

/**
 * Target protein harian (g), dibulatkan.
 * Sumber: ISSN 2017; Morton et al. 2018 · docs/sains-latihan/01-nutrisi.md §4
 */
export function calculateProteinTarget(
  weightKg: number,
  gPerKg: number = PROTEIN_G_PER_KG.default,
): number {
  assertPositive('weightKg', weightKg);
  assertInRange('gPerKg', gPerKg, PROTEIN_G_PER_KG.min, PROTEIN_G_PER_KG.max);
  return Math.round(weightKg * gPerKg);
}

export interface MacroTargets {
  proteinG: number;
  fatG: number;
  carbsG: number;
  /** true jika protein + lemak sudah melebihi target kalori (karbohidrat dipotong ke 0). */
  carbsClamped: boolean;
}

/**
 * Pembagian makro: protein tetap, lemak % kalori, karbohidrat sisanya.
 * docs/sains-latihan/01-nutrisi.md §5
 */
export function calculateMacros(
  targetKcal: number,
  proteinG: number,
  fatPct: number = FAT_PCT_OF_KCAL.default,
): MacroTargets {
  assertPositive('targetKcal', targetKcal);
  assertPositive('proteinG', proteinG);
  assertInRange('fatPct', fatPct, FAT_PCT_OF_KCAL.min, FAT_PCT_OF_KCAL.max);

  const fatG = Math.round((targetKcal * fatPct) / KCAL_PER_G.fat);
  const remainingKcal = targetKcal - proteinG * KCAL_PER_G.protein - fatG * KCAL_PER_G.fat;
  const carbsG = Math.round(remainingKcal / KCAL_PER_G.carbs);
  return { proteinG, fatG, carbsG: Math.max(carbsG, 0), carbsClamped: carbsG < 0 };
}
