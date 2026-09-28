import { assertInRange } from '../common/assert';
import type { BodyArea } from '../profile/types';
import { READINESS } from '../standards';
import type { Readiness } from '../workout/types';

export interface CheckInInput {
  sleepHours: number;
  /** 1 = tidak pegal … 5 = sangat pegal. */
  soreness: number;
  /** 1 = sangat lelah … 5 = sangat bertenaga. */
  energy: number;
  painAreas: readonly BodyArea[];
}

/**
 * Kesiapan latihan dari check-in. Aturan internal berbasis prinsip autoregulasi
 * (Helms et al. 2016; Zourdos et al. 2016) · docs/mesin-trainer/03-autoregulasi-checkin.md
 */
export function assessReadiness({ sleepHours, soreness, energy }: CheckInInput): Readiness {
  assertInRange('sleepHours', sleepHours, 0, 24);
  assertInRange('soreness', soreness, 1, 5);
  assertInRange('energy', energy, 1, 5);

  const { red, yellow } = READINESS;
  if (soreness >= red.soreness || energy <= red.energy || sleepHours < red.sleepHoursBelow)
    return 'red';
  if (
    soreness >= yellow.soreness ||
    energy <= yellow.energy ||
    sleepHours < yellow.sleepHoursBelow
  ) {
    return 'yellow';
  }
  return 'green';
}
