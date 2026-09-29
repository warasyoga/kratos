import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import type { Result } from '@/domain/common/result';
import type { NutritionLog } from '@/domain/nutrition/intake';
import { errorText, t } from '@/shared/i18n/id';
import { parseDecimal } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { TextField } from '@/shared/ui/TextField';
import { useNutritionAction } from '../hooks/useNutrition';

const toText = (n: number | undefined) => (n === undefined ? '' : String(n).replace('.', ','));

/** Catat makan baru, atau ubah/hapus catatan yang ada (termasuk memindah tanggal). */
export function FoodSheet({ food, onClose }: { food?: NutritionLog; onClose: () => void }) {
  const { nutrition } = useServices();
  const { run, pending, errors } = useNutritionAction();
  const [form, setForm] = useState({
    label: food?.label ?? '',
    kcal: toText(food?.kcal),
    proteinG: toText(food?.proteinG),
    carbsG: toText(food?.carbsG),
    fatG: toText(food?.fatG),
    logDate: food?.logDate ?? '',
    saveAsMeal: false,
  });
  const set = (changes: Partial<typeof form>) => setForm((f) => ({ ...f, ...changes }));

  const save = async () => {
    const optional = (text: string) => {
      const value = parseDecimal(text);
      return value === undefined ? {} : { value };
    };
    const carbs = optional(form.carbsG);
    const fat = optional(form.fatG);
    const input = {
      label: form.label,
      kcal: parseDecimal(form.kcal),
      proteinG: parseDecimal(form.proteinG),
      ...('value' in carbs && { carbsG: carbs.value }),
      ...('value' in fat && { fatG: fat.value }),
      ...(form.logDate && { logDate: form.logDate }),
      ...(!food && form.saveAsMeal && { saveAsMeal: true }),
    };
    const saved = await run(
      async (): Promise<Result<unknown>> =>
        food ? nutrition.updateFood(food.id, input) : nutrition.logFood(input),
      food ? t.common.saved : t.nutrition.logged,
    );
    if (saved) onClose();
  };

  const remove = async () => {
    if (food && (await run(() => nutrition.removeFood(food.id)))) onClose();
  };

  const number = (key: 'kcal' | 'proteinG' | 'carbsG' | 'fatG', suffix: string) => (
    <TextField
      id={`food-${key}`}
      label={t.nutrition.field[key]}
      inputMode="decimal"
      suffix={suffix}
      value={form[key]}
      onChange={(e) => set({ [key]: e.target.value })}
      error={errorText(errors?.[key])}
    />
  );

  return (
    <Sheet
      open
      title={food ? t.nutrition.editFood : t.nutrition.logFood}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {food && (
            <Button variant="ghost" disabled={pending} onClick={() => void remove()}>
              {t.nutrition.removeFood}
            </Button>
          )}
          <Button fullWidth disabled={pending} onClick={() => void save()}>
            {t.common.save}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          id="food-label"
          label={t.nutrition.field.label}
          value={form.label}
          onChange={(e) => set({ label: e.target.value })}
          error={errorText(errors?.label)}
        />
        <div className="grid grid-cols-2 gap-3">
          {number('kcal', 'kkal')}
          {number('proteinG', 'g')}
          {number('carbsG', 'g')}
          {number('fatG', 'g')}
        </div>
        {food ? (
          <TextField
            id="food-date"
            type="date"
            label={t.nutrition.field.logDate}
            value={form.logDate}
            onChange={(e) => set({ logDate: e.target.value })}
            error={errorText(errors?.logDate)}
          />
        ) : (
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.saveAsMeal}
              onChange={(e) => set({ saveAsMeal: e.target.checked })}
              className="size-5 accent-[var(--accent)]"
            />
            {t.nutrition.saveAsMeal}
          </label>
        )}
      </div>
    </Sheet>
  );
}
