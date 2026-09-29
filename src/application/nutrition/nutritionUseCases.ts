import { z } from 'zod/mini';
import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import { addDays, weekdayOf } from '@/domain/common/weekday';
import { FOOD_REFERENCES, nutrientsFor } from '@/domain/nutrition/foodReferences';
import {
  intakeByDay,
  sumIntake,
  type DailyIntake,
  type NutritionLog,
  type SavedMeal,
  type WaterLog,
} from '@/domain/nutrition/intake';
import type { AppDeps } from '../deps';
import { makeGetProfileOverview } from '../profile/getProfileOverview';
import { numberInRange } from '../profile/schemas';
import { validate } from '../validation';

const HISTORY_DAYS = 7;

const optionalGrams = (max: number) => z.optional(numberInRange(0, max, 'macro_range'));

export const foodSchema = z.object({
  label: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, { error: 'food_label_required' }),
      z.maxLength(40, { error: 'food_label_too_long' }),
    ),
  kcal: numberInRange(0, 5000, 'kcal_range'),
  proteinG: numberInRange(0, 300, 'macro_range'),
  carbsG: optionalGrams(1000),
  fatG: optionalGrams(500),
  logDate: z.optional(z.iso.date({ error: 'date_invalid' })),
  saveAsMeal: z.optional(z.boolean()),
});

const waterSchema = numberInRange(50, 2000, 'water_range');

export interface NutritionTargets {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
}

export interface NutritionDay {
  date: string;
  isGymDay: boolean;
  targets: NutritionTargets;
  /** Koreksi kalibrasi yang sudah termasuk di target kalori. */
  adjustmentKcal: number;
  intake: DailyIntake;
  foods: NutritionLog[];
  water: WaterLog[];
  meals: SavedMeal[];
  /** 7 hari sebelum hari ini yang punya catatan makan. */
  history: { logDate: string; kcal: number; proteinG: number }[];
  historyAverage: { kcal: number; proteinG: number } | null;
}

const macros = (v: {
  kcal: number;
  proteinG: number;
  carbsG?: number | undefined;
  fatG?: number | undefined;
}) => ({
  kcal: v.kcal,
  proteinG: v.proteinG,
  ...(v.carbsG !== undefined && { carbsG: v.carbsG }),
  ...(v.fatG !== undefined && { fatG: v.fatG }),
});

const futureDate = () =>
  err({ code: 'validation_failed', message: 'Tanggal', fields: { logDate: 'date_future' } });

/** Catat makan & minum, menu favorit, dan ringkasan harian. docs/fitur/08-nutrisi.md */
export function makeNutritionUseCases(deps: AppDeps) {
  const getOverview = makeGetProfileOverview(deps);
  const today = () => toLocalDate(deps.clock.now());

  async function addFood(values: Omit<NutritionLog, 'id' | 'createdAt'>) {
    const id = deps.newId();
    await deps.nutrition.saveFood({ id, createdAt: deps.clock.now(), ...values });
    return id;
  }

  return {
    async day(): Promise<NutritionDay | null> {
      const date = today();
      const from = addDays(date, -HISTORY_DAYS);
      const [overview, foods, water, meals] = await Promise.all([
        getOverview(),
        deps.nutrition.listFoodsSince(from),
        deps.nutrition.listWaterSince(date),
        deps.nutrition.listMeals(),
      ]);
      if (!overview) return null;
      const t = overview.targets;
      const isGymDay = overview.profile.trainingDays.includes(weekdayOf(date));
      const todayFoods = foods.filter((f) => f.logDate === date);
      const todayWater = water.filter((w) => w.logDate === date);
      const pastDates = Array.from({ length: HISTORY_DAYS }, (_, i) => addDays(from, i));
      const history = intakeByDay(foods, pastDates).map(({ logDate, intake }) => ({
        logDate,
        kcal: intake.kcal,
        proteinG: intake.proteinG,
      }));
      const avg = (key: 'kcal' | 'proteinG') =>
        history.reduce((n, d) => n + d[key], 0) / history.length;

      return {
        date,
        isGymDay,
        targets: {
          kcal: t.kcal,
          proteinG: t.proteinG,
          carbsG: t.carbsG,
          fatG: t.fatG,
          waterMl: Math.round((isGymDay ? t.waterGymL : t.waterRestL) * 1000),
        },
        adjustmentKcal: t.calorieAdjustmentKcal,
        intake: sumIntake(todayFoods, todayWater),
        foods: todayFoods,
        water: todayWater,
        meals,
        history,
        historyAverage:
          history.length > 0 ? { kcal: avg('kcal'), proteinG: avg('proteinG') } : null,
      };
    },

    /** Catat makan; tanggal bisa diubah ke hari sebelumnya (makan lewat tengah malam). */
    async logFood(raw: unknown): Promise<Result<{ id: string }>> {
      const parsed = validate(foodSchema, raw);
      if (!parsed.ok) return parsed;
      const { label, logDate = today(), saveAsMeal, ...values } = parsed.value;
      if (logDate > today()) return futureDate();
      const id = await addFood({ label, logDate, ...macros(values) });
      if (saveAsMeal) await deps.nutrition.saveMeal({ id: deps.newId(), label, ...macros(values) });
      return ok({ id });
    },

    async updateFood(id: string, raw: unknown): Promise<Result<void>> {
      const parsed = validate(foodSchema, raw);
      if (!parsed.ok) return parsed;
      const existing = (await deps.nutrition.listFoodsSince('0000-01-01')).find((f) => f.id === id);
      if (!existing) return err({ code: 'not_found', message: 'Catatan tidak ditemukan' });
      const { label, logDate = existing.logDate, saveAsMeal: _save, ...values } = parsed.value;
      if (logDate > today()) return futureDate();
      await deps.nutrition.saveFood({
        id,
        createdAt: existing.createdAt,
        label,
        logDate,
        ...macros(values),
      });
      return ok(undefined);
    },

    async removeFood(id: string): Promise<Result<void>> {
      await deps.nutrition.removeFood(id);
      return ok(undefined);
    },

    /** Catat ulang menu favorit hari ini (satu ketukan). */
    async logMeal(mealId: string): Promise<Result<{ id: string }>> {
      const meal = (await deps.nutrition.listMeals()).find((m) => m.id === mealId);
      if (!meal) return err({ code: 'not_found', message: 'Menu tidak ditemukan' });
      const { id: _mealId, label, ...values } = meal;
      return ok({ id: await addFood({ label, logDate: today(), ...macros(values) }) });
    },

    async removeMeal(id: string): Promise<Result<void>> {
      await deps.nutrition.removeMeal(id);
      return ok(undefined);
    },

    /** Catat porsi referensi TKPI/USDA dengan berat tertentu (default porsi umum). */
    async logReference(referenceId: string, grams?: number): Promise<Result<{ id: string }>> {
      const food = FOOD_REFERENCES.find((f) => f.id === referenceId);
      if (!food) return err({ code: 'not_found', message: 'Bahan tidak ditemukan' });
      const weight = grams ?? food.portion.grams;
      if (!(weight > 0 && weight <= 2000))
        return err({
          code: 'validation_failed',
          message: 'Berat',
          fields: { grams: 'grams_range' },
        });
      const n = nutrientsFor(food, weight);
      return ok({
        id: await addFood({ label: `${food.name} ${weight} g`, logDate: today(), ...n }),
      });
    },

    async logWater(ml: unknown): Promise<Result<{ id: string }>> {
      const parsed = validate(waterSchema, ml);
      if (!parsed.ok) return parsed;
      const now = deps.clock.now();
      const id = deps.newId();
      await deps.nutrition.addWater({
        id,
        logDate: toLocalDate(now),
        ml: parsed.value,
        createdAt: now,
      });
      return ok({ id });
    },

    async removeWater(id: string): Promise<Result<void>> {
      await deps.nutrition.removeWater(id);
      return ok(undefined);
    },
  };
}
