import { assertPositive } from '../common/assert';
import { BMI_ASIA, BMI_WHO } from '../standards';

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

/** BMI = berat ÷ tinggi² (m). Sumber: WHO 2000 · docs/sains-latihan/04-komposisi-tubuh.md §1 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  assertPositive('weightKg', weightKg);
  assertPositive('heightCm', heightCm);
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function classify(bmi: number, cutoffs: { underMax: number; normalMax: number; overMax: number }) {
  if (bmi < cutoffs.underMax) return 'underweight';
  if (bmi < cutoffs.normalMax) return 'normal';
  if (bmi < cutoffs.overMax) return 'overweight';
  return 'obese';
}

/** Kategori WHO internasional. */
export function classifyBmi(bmi: number): BmiCategory {
  return classify(bmi, BMI_WHO);
}

/** Kategori dengan titik tindakan Asia (WHO 2004), ditampilkan sebagai catatan. */
export function classifyBmiAsia(bmi: number): BmiCategory {
  return classify(bmi, BMI_ASIA);
}
