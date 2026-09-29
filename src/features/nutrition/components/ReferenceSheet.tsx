import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import { nutrientsFor, type FoodReference } from '@/domain/nutrition/foodReferences';
import { t } from '@/shared/i18n/id';
import { formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { Stepper } from '@/shared/ui/Stepper';
import { useNutritionAction } from '../hooks/useNutrition';

const GRAMS_STEP = 10;

/** Catat porsi referensi dengan berat yang bisa diubah; nilai gizi dihitung dari per 100 g. */
export function ReferenceSheet({ food, onClose }: { food: FoodReference; onClose: () => void }) {
  const { nutrition } = useServices();
  const { run, pending } = useNutritionAction();
  const [grams, setGrams] = useState(food.portion.grams);
  const n = nutrientsFor(food, grams);

  const log = async () => {
    if (await run(() => nutrition.logReference(food.id, grams), t.nutrition.logged)) onClose();
  };

  return (
    <Sheet
      open
      title={food.name}
      onClose={onClose}
      footer={
        <Button fullWidth disabled={pending} onClick={() => void log()}>
          {t.nutrition.logReference(food.name)}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Stepper
          label={t.nutrition.grams}
          value={grams}
          onChange={setGrams}
          min={GRAMS_STEP}
          max={1000}
          step={GRAMS_STEP}
          suffix="g"
        />
        <dl className="grid grid-cols-4 gap-2 text-center">
          {(
            [
              [t.nutrition.kcal, formatNumber(n.kcal, 0)],
              [t.nutrition.protein, `${formatNumber(n.proteinG)} g`],
              [t.nutrition.carbs, `${formatNumber(n.carbsG)} g`],
              [t.nutrition.fat, `${formatNumber(n.fatG)} g`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex flex-col-reverse rounded-xl bg-surface-2 px-1 py-2">
              <dt className="text-[11px] font-semibold text-muted">{label}</dt>
              <dd className="font-display text-lg font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted">
          {food.portion.label} ≈ {food.portion.grams} g ·{' '}
          {t.nutrition.referenceSource(food.source, food.code)}
        </p>
      </div>
    </Sheet>
  );
}
