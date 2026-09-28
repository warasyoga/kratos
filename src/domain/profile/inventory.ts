import {
  DEFAULT_BAR_KG,
  DEFAULT_DUMBBELLS_KG,
  DEFAULT_MACHINE_STEP_KG,
  DEFAULT_PLATES_KG,
} from '../standards';
import type { PlateInventory } from './types';

export const DEFAULT_INVENTORY: PlateInventory = {
  barKg: DEFAULT_BAR_KG,
  platesKg: [...DEFAULT_PLATES_KG],
  dumbbellsKg: [...DEFAULT_DUMBBELLS_KG],
  machineStepKg: DEFAULT_MACHINE_STEP_KG,
};
