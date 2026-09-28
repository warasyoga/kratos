import { isLowerBodyCompound, type Exercise, type LoadType } from '../exercise/types';
import type { PlateInventory } from '../profile/types';
import { LOAD_STEPS_KG, PROGRESSION_PCT } from '../standards';

/**
 * Pembulatan beban ke nilai yang benar-benar bisa dipasang: kombinasi pelat di bar,
 * ukuran dumbbell yang ada, atau kelipatan tumpukan mesin.
 * Perhitungan memakai gram (bilangan bulat) agar bebas galat pecahan seperti 1,25 kg.
 */
export type RoundMode = 'down' | 'nearest' | 'up';

export const toGrams = (kg: number) => Math.round(kg * 1000);
const toKg = (grams: number) => grams / 1000;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Satuan terkecil (gram) yang bisa dibentuk dari pelat, mis. 1250 g untuk pelat standar. */
export function plateUnitGrams(platesKg: readonly number[]): number {
  const plates = platesKg.map(toGrams).filter((g) => g > 0);
  return plates.length === 0 ? 1 : plates.reduce(gcd);
}

/** Tanda per jumlah satuan per sisi: apakah bisa dibentuk dari pelat yang ada. */
function reachablePerSide(platesKg: readonly number[], maxUnits: number): boolean[] {
  const unitG = plateUnitGrams(platesKg);
  const plateUnits = platesKg
    .map(toGrams)
    .filter((g) => g > 0)
    .map((g) => g / unitG);
  const reachable = Array.from({ length: maxUnits + 1 }, (_, i) => i === 0);
  for (let u = 1; u <= maxUnits; u++) {
    reachable[u] = plateUnits.some((p) => u >= p && reachable[u - p] === true);
  }
  return reachable;
}

/** Semua total beban barbell yang bisa dipasang sampai `maxKg`, terurut naik. */
export function barbellLoads(inventory: PlateInventory, maxKg: number): number[] {
  const barG = toGrams(inventory.barKg);
  const unitG = plateUnitGrams(inventory.platesKg);
  const perSideMaxG = Math.max(0, (toGrams(maxKg) - barG) / 2);
  const reachable = reachablePerSide(inventory.platesKg, Math.floor(perSideMaxG / unitG));
  const loads: number[] = [];
  reachable.forEach((ok, u) => {
    if (ok) loads.push(toKg(barG + 2 * u * unitG));
  });
  return loads;
}

function pick(sortedKg: readonly number[], kg: number, mode: RoundMode): number {
  const target = toGrams(kg);
  const grams = sortedKg.map(toGrams);
  const first = grams[0] as number;
  const last = grams[grams.length - 1] as number;
  const below = [...grams].reverse().find((g) => g <= target) ?? first;
  const above = grams.find((g) => g >= target) ?? last;
  if (mode === 'down') return toKg(below);
  if (mode === 'up') return toKg(above);
  // Seri dibulatkan ke bawah: lebih aman.
  return toKg(target - below <= above - target ? below : above);
}

/** Bulatkan beban sesuai jenis alat. Bodyweight selalu 0 (tanpa beban tambahan). */
export function roundLoad(
  kg: number,
  loadType: LoadType,
  inventory: PlateInventory,
  mode: RoundMode,
): number {
  switch (loadType) {
    case 'bodyweight':
      return 0;
    case 'barbell': {
      const maxPlate = Math.max(0, ...inventory.platesKg);
      return pick(barbellLoads(inventory, Math.max(kg, inventory.barKg) + 2 * maxPlate), kg, mode);
    }
    case 'dumbbell':
      return pick(
        [...inventory.dumbbellsKg].sort((a, b) => a - b),
        kg,
        mode,
      );
    case 'machine':
    case 'cable': {
      const step = inventory.machineStepKg;
      const units =
        mode === 'down'
          ? Math.floor(kg / step)
          : mode === 'up'
            ? Math.ceil(kg / step)
            : Math.round(kg / step);
      return Math.max(1, units) * step;
    }
  }
}

export interface HeavierLoad {
  weightKg: number;
  /** Kenaikan relatif terhadap beban saat ini, mis. 0,038 = 3,8%. */
  stepPct: number;
}

/**
 * Beban satu langkah lebih berat. Memilih langkah terbesar yang ≤ 10% (ACSM 2009);
 * jika semua langkah > 10%, kembalikan langkah terkecil (pemanggil memutuskan).
 * null jika tidak ada beban lebih berat (dumbbell terberat, bodyweight).
 */
export function nextHeavierLoad(
  exercise: Exercise,
  currentKg: number,
  inventory: PlateInventory,
): HeavierLoad | null {
  const pct = (kg: number) => (kg - currentKg) / currentKg;
  const higher = (kg: number) => toGrams(kg) > toGrams(currentKg);

  const candidates: number[] = [];
  switch (exercise.loadType) {
    case 'bodyweight':
      return null;
    case 'dumbbell': {
      const next = [...inventory.dumbbellsKg].sort((a, b) => a - b).find(higher);
      if (next !== undefined) candidates.push(next);
      break;
    }
    case 'barbell': {
      const steps = isLowerBodyCompound(exercise)
        ? LOAD_STEPS_KG.barbellLower
        : LOAD_STEPS_KG.barbellUpper;
      for (const step of steps)
        candidates.push(roundLoad(currentKg + step, 'barbell', inventory, 'up'));
      break;
    }
    case 'machine':
    case 'cable':
      candidates.push(
        roundLoad(currentKg + inventory.machineStepKg, exercise.loadType, inventory, 'up'),
      );
      break;
  }

  const valid = candidates.filter(higher);
  if (valid.length === 0) return null;
  const withinLimit = valid.find((kg) => pct(kg) <= PROGRESSION_PCT.max + 1e-9);
  const chosen = withinLimit ?? Math.min(...valid);
  return { weightKg: chosen, stepPct: pct(chosen) };
}

/** Beban dikali faktor lalu dibulatkan, mis. deload 0,9 → ke bawah. */
export function scaleLoad(
  exercise: Exercise,
  currentKg: number,
  factor: number,
  inventory: PlateInventory,
  mode: RoundMode,
): number {
  return roundLoad(currentKg * factor, exercise.loadType, inventory, mode);
}
