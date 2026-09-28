import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  MACHINE_STEP_OPTIONS_KG,
  PLATE_OPTIONS_KG,
  toInventoryForm,
  type InventoryForm,
} from '@/application/gym/gymUseCases';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { errorText, t } from '@/shared/i18n/id';
import { formatKg, formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { Sheet } from '@/shared/ui/Sheet';
import { Stepper } from '@/shared/ui/Stepper';
import { ToggleChip } from '@/shared/ui/ToggleChip';
import { useProfileAction } from '../hooks/useProfileAction';

const kg = (v: number) => formatNumber(v, 2);

/** Bar, pelat, dan dumbbell yang ada di gym (docs/fitur/09-profil.md). */
export function InventoryCard() {
  const { gym } = useServices();
  const { data: inventory } = useQuery({
    queryKey: queryKeys.inventory,
    queryFn: gym.inventory.get,
  });
  const { run, pending, errors } = useProfileAction();
  const [form, setForm] = useState<InventoryForm | null>(null);
  if (!inventory) return null;

  const current = toInventoryForm(inventory);
  const set = (patch: Partial<InventoryForm>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const togglePlate = (p: number) =>
    form &&
    set({
      platesKg: form.platesKg.includes(p)
        ? form.platesKg.filter((x) => x !== p)
        : [...form.platesKg, p],
    });

  const save = async () => {
    if (form && (await run(() => gym.inventory.save(form)))) setForm(null);
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-sans label-caps">{t.inventory.title}</h2>
        <Button variant="ghost" size="sm" onClick={() => setForm(current)}>
          {t.common.edit}
        </Button>
      </div>
      <p className="text-sm tabular-nums">
        {t.inventory.summary(
          formatKg(current.barKg),
          current.platesKg.map(kg).join(', '),
          formatKg(current.dumbbellMinKg),
          formatKg(current.dumbbellMaxKg),
        )}
      </p>
      <p className="text-xs text-muted">{t.inventory.hint}</p>

      <Sheet
        open={form !== null}
        title={t.inventory.title}
        onClose={() => setForm(null)}
        footer={
          <Button fullWidth disabled={pending} onClick={() => void save()}>
            {t.common.save}
          </Button>
        }
      >
        {form && (
          <div className="flex flex-col gap-5">
            <Stepper
              label={t.inventory.bar}
              value={form.barKg}
              min={5}
              max={30}
              step={2.5}
              suffix="kg"
              format={kg}
              onChange={(barKg) => set({ barKg })}
            />
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-sm font-semibold">{t.inventory.plates}</legend>
              <div className="flex flex-wrap gap-2">
                {PLATE_OPTIONS_KG.map((p) => (
                  <ToggleChip
                    key={p}
                    label={`${kg(p)} kg`}
                    pressed={form.platesKg.includes(p)}
                    onToggle={() => togglePlate(p)}
                  />
                ))}
              </div>
              {errors?.platesKg && (
                <p className="text-[13px] text-bad">{errorText(errors.platesKg)}</p>
              )}
            </fieldset>
            <Stepper
              label={t.inventory.dumbbellMin}
              value={form.dumbbellMinKg}
              min={1}
              max={60}
              step={form.dumbbellStepKg}
              suffix="kg"
              format={kg}
              onChange={(dumbbellMinKg) => set({ dumbbellMinKg })}
            />
            <Stepper
              label={t.inventory.dumbbellMax}
              value={form.dumbbellMaxKg}
              min={1}
              max={80}
              step={form.dumbbellStepKg}
              suffix="kg"
              format={kg}
              onChange={(dumbbellMaxKg) => set({ dumbbellMaxKg })}
            />
            {errors?.dumbbellMaxKg && (
              <p className="text-[13px] text-bad">{errorText(errors.dumbbellMaxKg)}</p>
            )}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">{t.inventory.dumbbellStep}</span>
              <SegmentedControl
                label={t.inventory.dumbbellStep}
                options={['1', '2', '2.5'].map((v) => ({ value: v, label: `${kg(Number(v))} kg` }))}
                value={String(form.dumbbellStepKg)}
                onChange={(v) =>
                  set({ dumbbellStepKg: Number(v) as InventoryForm['dumbbellStepKg'] })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">{t.inventory.machineStep}</span>
              <SegmentedControl
                label={t.inventory.machineStep}
                options={MACHINE_STEP_OPTIONS_KG.map((v) => ({
                  value: String(v),
                  label: `${kg(v)} kg`,
                }))}
                value={String(form.machineStepKg)}
                onChange={(v) => set({ machineStepKg: Number(v) })}
              />
            </div>
          </div>
        )}
      </Sheet>
    </Card>
  );
}
