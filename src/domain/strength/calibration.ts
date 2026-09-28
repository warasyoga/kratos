import type { Exercise } from '../exercise/types';
import type { PlateInventory } from '../profile/types';
import { CALIBRATION_ADJUSTMENT, STARTING_LOAD_KG } from '../standards';
import { nextHeavierLoad, roundLoad } from './loads';

/**
 * Beban awal untuk gerakan yang belum pernah dilakukan. Aturan internal,
 * docs/sains-latihan/02-kekuatan-dan-progresi.md §7
 */
export function startingLoad(exercise: Exercise, inventory: PlateInventory): number {
  switch (exercise.loadType) {
    case 'bodyweight':
      return 0;
    case 'barbell':
      return inventory.barKg;
    case 'dumbbell': {
      const kg =
        exercise.mechanics === 'compound'
          ? STARTING_LOAD_KG.dumbbellCompound
          : STARTING_LOAD_KG.dumbbellIsolation;
      return roundLoad(kg, 'dumbbell', inventory, 'nearest');
    }
    case 'machine':
      return roundLoad(STARTING_LOAD_KG.machine, 'machine', inventory, 'nearest');
    case 'cable':
      return roundLoad(STARTING_LOAD_KG.cable, 'cable', inventory, 'nearest');
  }
}

/** Beban set berikutnya saat kalibrasi, berdasarkan RIR set sebelumnya (target 2). */
export function nextCalibrationLoad(
  exercise: Exercise,
  currentKg: number,
  rir: number,
  inventory: PlateInventory,
): number {
  if (exercise.loadType === 'bodyweight') return 0;
  const rule = CALIBRATION_ADJUSTMENT.find((r) => rir >= r.minRir);
  const factor = rule?.factor ?? 1;
  if (factor === 1) return currentKg;

  const rounded = roundLoad(currentKg * factor, exercise.loadType, inventory, 'nearest');
  if (factor > 1 && rounded <= currentKg) {
    // Kenaikan terlalu kecil untuk pelat yang ada: naik satu langkah terkecil.
    return nextHeavierLoad(exercise, currentKg, inventory)?.weightKg ?? currentKg;
  }
  if (factor < 1 && rounded >= currentKg) {
    return roundLoad(currentKg * factor, exercise.loadType, inventory, 'down');
  }
  return rounded;
}
