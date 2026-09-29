/** Satu catatan makan. Nilai gizi diisi pengguna (atau dari menu favorit / porsi referensi). */
export interface NutritionLog {
  id: string;
  logDate: string;
  label: string;
  kcal: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
  createdAt: number;
}

export interface WaterLog {
  id: string;
  logDate: string;
  ml: number;
  createdAt: number;
}

/** Menu favorit untuk dicatat ulang dengan satu ketukan. */
export interface SavedMeal {
  id: string;
  label: string;
  kcal: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
}

export interface DailyIntake {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
}

/** Total asupan dari catatan makan dan minum (yang sudah difilter per tanggal). */
export function sumIntake(
  foods: readonly NutritionLog[],
  water: readonly WaterLog[] = [],
): DailyIntake {
  return {
    kcal: foods.reduce((n, f) => n + f.kcal, 0),
    proteinG: foods.reduce((n, f) => n + f.proteinG, 0),
    carbsG: foods.reduce((n, f) => n + (f.carbsG ?? 0), 0),
    fatG: foods.reduce((n, f) => n + (f.fatG ?? 0), 0),
    waterMl: water.reduce((n, w) => n + w.ml, 0),
  };
}

/**
 * Asupan per tanggal untuk tanggal yang punya catatan makan.
 * Hari tanpa catatan dilewati: tidak mencatat ≠ tidak makan.
 */
export function intakeByDay(
  foods: readonly NutritionLog[],
  dates: readonly string[],
): { logDate: string; intake: DailyIntake }[] {
  return dates.flatMap((logDate) => {
    const day = foods.filter((f) => f.logDate === logDate);
    return day.length === 0 ? [] : [{ logDate, intake: sumIntake(day) }];
  });
}
