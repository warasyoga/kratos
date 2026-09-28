import { assertPositive } from '../common/assert';
import type { Sex } from '../profile/types';
import { NAVY_FEMALE, NAVY_MALE, NAVY_NUMERATOR, NAVY_OFFSET } from '../standards';

export interface NavyInput {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  /** Wajib untuk wanita. */
  hipCm?: number;
}

/**
 * Estimasi persen lemak tubuh dengan rumus US Navy (satuan cm).
 * Sumber: Hodgdon & Beckett 1984 · docs/sains-latihan/04-komposisi-tubuh.md §2
 */
export function estimateBodyFatNavy({ sex, heightCm, neckCm, waistCm, hipCm }: NavyInput): number {
  assertPositive('heightCm', heightCm);
  assertPositive('neckCm', neckCm);
  assertPositive('waistCm', waistCm);

  if (sex === 'male') {
    const girth = waistCm - neckCm;
    assertPositive('pinggang − leher', girth);
    const density =
      NAVY_MALE.a - NAVY_MALE.b * Math.log10(girth) + NAVY_MALE.c * Math.log10(heightCm);
    return NAVY_NUMERATOR / density - NAVY_OFFSET;
  }

  if (hipCm === undefined) throw new RangeError('hipCm wajib untuk wanita');
  const girth = waistCm + hipCm - neckCm;
  assertPositive('pinggang + pinggul − leher', girth);
  const density =
    NAVY_FEMALE.a - NAVY_FEMALE.b * Math.log10(girth) + NAVY_FEMALE.c * Math.log10(heightCm);
  return NAVY_NUMERATOR / density - NAVY_OFFSET;
}
