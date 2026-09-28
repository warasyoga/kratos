import type { PlateInventory } from '../profile/types';
import { plateUnitGrams, roundLoad, toGrams } from './loads';

export interface PlateLoadout {
  /** Pelat di satu sisi, dari terberat. */
  perSideKg: number[];
  /** Total yang benar-benar terpasang (bisa lebih kecil dari target). */
  totalKg: number;
  exact: boolean;
}

/**
 * Pelat yang dipasang di tiap sisi bar untuk mencapai target.
 * Target yang tidak bisa dibentuk dibulatkan ke bawah. docs/sains-latihan/02-kekuatan-dan-progresi.md §6
 */
export function plateLoadout(targetKg: number, inventory: PlateInventory): PlateLoadout {
  const totalKg = roundLoad(targetKg, 'barbell', inventory, 'down');
  const unitG = plateUnitGrams(inventory.platesKg);
  const perSideUnits = Math.round((toGrams(totalKg) - toGrams(inventory.barKg)) / 2 / unitG);
  const plateUnits = inventory.platesKg.map((kg) => toGrams(kg) / unitG);

  // Jumlah pelat paling sedikit (DP), agar tetap benar untuk inventaris pelat tidak standar.
  const best: (number[] | null)[] = [[]];
  for (let u = 1; u <= perSideUnits; u++) {
    let choice: number[] | null = null;
    for (const p of plateUnits) {
      const rest = u >= p ? best[u - p] : null;
      if (rest && (!choice || rest.length + 1 < choice.length)) choice = [p, ...rest];
    }
    best[u] = choice;
  }

  const perSideKg = (best[perSideUnits] ?? [])
    .map((units) => (units * unitG) / 1000)
    .sort((a, b) => b - a);
  return { perSideKg, totalKg, exact: toGrams(totalKg) === toGrams(targetKg) };
}
