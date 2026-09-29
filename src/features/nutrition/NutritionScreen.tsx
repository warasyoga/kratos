import { ChevronLeft, Plus, Star, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useServices } from '@/application/ServicesContext';
import {
  FOOD_REFERENCES,
  nutrientsFor,
  type FoodReference,
} from '@/domain/nutrition/foodReferences';
import type { NutritionLog } from '@/domain/nutrition/intake';
import { WATER_QUICK_ADD_ML } from '@/domain/standards';
import { t } from '@/shared/i18n/id';
import { formatNumber, formatShortDate, formatSigned } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Meter } from '@/shared/ui/Meter';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { FoodSheet } from './components/FoodSheet';
import { ReferenceSheet } from './components/ReferenceSheet';
import { useNutritionAction, useNutritionDay } from './hooks/useNutrition';

/** Catat makan dan minum, menu favorit, porsi referensi TKPI. docs/fitur/08-nutrisi.md */
export function NutritionScreen() {
  const { nutrition } = useServices();
  const navigate = useNavigate();
  const { data: day } = useNutritionDay();
  const { run, pending } = useNutritionAction();
  const [sheet, setSheet] = useState<{ food?: NutritionLog } | undefined>();
  const [reference, setReference] = useState<FoodReference>();

  const back = (
    <button
      type="button"
      onClick={() => void navigate(-1)}
      className="flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-accent"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {t.common.back}
    </button>
  );
  if (!day) return back;
  const { intake, targets } = day;
  const lastWater = day.water.at(-1);
  const g = (v: number) => formatNumber(v, 0);

  return (
    <div className="flex flex-col gap-3.5">
      {back}
      <ScreenHeader title={t.nutrition.title} />

      <Card>
        <h2 className="font-sans label-caps">{t.nutrition.intakeTitle}</h2>
        <Meter
          label={t.nutrition.kcal}
          valueText={t.nutrition.ofTarget(g(intake.kcal), g(targets.kcal), 'kkal')}
          ratio={intake.kcal / targets.kcal}
        />
        <Meter
          label={t.nutrition.protein}
          valueText={t.nutrition.ofTarget(g(intake.proteinG), g(targets.proteinG), 'g')}
          ratio={intake.proteinG / targets.proteinG}
        />
        <Meter
          label={t.nutrition.carbs}
          valueText={t.nutrition.ofTarget(g(intake.carbsG), g(targets.carbsG), 'g')}
          ratio={intake.carbsG / targets.carbsG}
        />
        <Meter
          label={t.nutrition.fat}
          valueText={t.nutrition.ofTarget(g(intake.fatG), g(targets.fatG), 'g')}
          ratio={intake.fatG / targets.fatG}
        />
        <Button onClick={() => setSheet({})}>
          <Plus className="size-5" aria-hidden />
          {t.nutrition.logFood}
        </Button>
      </Card>

      <Card>
        <Meter
          label={t.nutrition.water}
          valueText={t.nutrition.ofTarget(g(intake.waterMl), g(targets.waterMl), 'ml')}
          ratio={intake.waterMl / targets.waterMl}
        />
        <div className="flex gap-2">
          {WATER_QUICK_ADD_ML.map((ml) => (
            <Button
              key={ml}
              variant="ghost"
              className="flex-1"
              disabled={pending}
              aria-label={t.nutrition.addWaterLabel(ml)}
              onClick={() => void run(() => nutrition.logWater(ml))}
            >
              {t.nutrition.addWater(ml)}
            </Button>
          ))}
          {lastWater && (
            <Button
              variant="ghost"
              disabled={pending}
              aria-label={t.nutrition.undoWater}
              onClick={() => void run(() => nutrition.removeWater(lastWater.id))}
            >
              <Undo2 className="size-5" aria-hidden />
            </Button>
          )}
        </div>
        {day.isGymDay && <p className="text-xs text-muted">{t.nutrition.gymDayWater}</p>}
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.nutrition.foodsTitle}</h2>
        {day.foods.length === 0 ? (
          <p className="text-sm text-muted">{t.nutrition.foodsEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {day.foods.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  aria-label={t.nutrition.editFoodLabel(food.label)}
                  onClick={() => setSheet({ food })}
                  className="flex min-h-12 w-full flex-col items-start py-2 text-left"
                >
                  <span className="font-semibold">{food.label}</span>
                  <span className="text-xs text-muted tabular-nums">
                    {t.nutrition.foodLine(g(food.kcal), formatNumber(food.proteinG))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.nutrition.mealsTitle}</h2>
        {day.meals.length === 0 ? (
          <p className="text-[13px] text-muted">{t.nutrition.mealsEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {day.meals.map((meal) => (
              <li key={meal.id} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pending}
                  aria-label={t.nutrition.logMeal(meal.label)}
                  onClick={() => void run(() => nutrition.logMeal(meal.id), t.nutrition.logged)}
                  className="flex min-h-12 flex-1 items-center gap-3 rounded-[14px] border border-line px-3 text-left"
                >
                  <Star className="size-4 shrink-0 text-gold" aria-hidden />
                  <span className="flex-1">
                    <span className="block font-semibold">{meal.label}</span>
                    <span className="text-xs text-muted tabular-nums">
                      {t.nutrition.foodLine(g(meal.kcal), formatNumber(meal.proteinG))}
                    </span>
                  </span>
                  <Plus className="size-5 text-accent" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  aria-label={t.nutrition.removeMeal(meal.label)}
                  onClick={() => void run(() => nutrition.removeMeal(meal.id))}
                  className="grid size-11 place-items-center rounded-full text-muted"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.nutrition.referencesTitle}</h2>
        <ul className="flex flex-col divide-y divide-line">
          {FOOD_REFERENCES.map((food) => {
            const n = nutrientsFor(food);
            return (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => setReference(food)}
                  className="flex min-h-12 w-full items-center justify-between gap-2 py-2 text-left"
                >
                  <span>
                    <span className="block text-sm font-semibold">{food.name}</span>
                    <span className="text-xs text-muted">
                      {food.portion.label} · {food.portion.grams} g
                    </span>
                  </span>
                  <span className="text-right text-xs text-muted tabular-nums">
                    {t.nutrition.foodLine(g(n.kcal), formatNumber(n.proteinG))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted">{t.nutrition.referencesHint}</p>
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.nutrition.historyTitle}</h2>
        {day.historyAverage ? (
          <>
            <p className="text-sm font-semibold">
              {t.nutrition.historyAverage(
                g(day.historyAverage.kcal),
                g(day.historyAverage.proteinG),
              )}
            </p>
            <ul className="flex flex-col gap-1 text-[13px] tabular-nums">
              {day.history.map((d) => (
                <li key={d.logDate} className="flex justify-between">
                  <span>{formatShortDate(d.logDate)}</span>
                  <span className="text-muted">
                    {t.nutrition.foodLine(g(d.kcal), g(d.proteinG))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">{t.nutrition.historyNote}</p>
          </>
        ) : (
          <p className="text-sm text-muted">{t.nutrition.historyEmpty}</p>
        )}
        {day.adjustmentKcal !== 0 && (
          <p className="text-xs text-muted">
            {t.nutrition.adjustment(formatSigned(day.adjustmentKcal, 0))}
          </p>
        )}
      </Card>

      {sheet && <FoodSheet {...sheet} onClose={() => setSheet(undefined)} />}
      {reference && <ReferenceSheet food={reference} onClose={() => setReference(undefined)} />}
    </div>
  );
}
