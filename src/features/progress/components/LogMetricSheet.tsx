import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import { CIRCUMFERENCES, type Circumference } from '@/domain/body/types';
import { errorText, t } from '@/shared/i18n/id';
import { tProgress } from '@/shared/i18n/progress';
import { parseDecimal } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { TextField } from '@/shared/ui/TextField';
import { useProgressAction } from '../hooks/useProgress';

type Field = 'weightKg' | Circumference;

/** Catat berat (mode 'weight') atau ukuran lingkar tubuh (mode 'measure') hari ini. */
export function LogMetricSheet({
  mode,
  onClose,
}: {
  mode: 'weight' | 'measure';
  onClose: () => void;
}) {
  const { progress } = useServices();
  const { run, pending, errors } = useProgressAction();
  const fields: readonly Field[] = mode === 'weight' ? ['weightKg'] : CIRCUMFERENCES;
  const [values, setValues] = useState<Partial<Record<Field, string>>>({});

  const save = async () => {
    const input = Object.fromEntries(
      fields.flatMap((f) => {
        const value = parseDecimal(values[f] ?? '');
        return value === undefined ? [] : [[f, value]];
      }),
    );
    if (await run(() => progress.logMetric(input), t.common.saved)) onClose();
  };

  return (
    <Sheet
      open
      title={mode === 'weight' ? tProgress.logWeight : tProgress.logMeasure}
      onClose={onClose}
      footer={
        <Button fullWidth disabled={pending} onClick={() => void save()}>
          {t.common.save}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-muted">{tProgress.metricSheetHint}</p>
        <div className="grid grid-cols-2 gap-3">
          {fields.map((field) => (
            <TextField
              key={field}
              id={`metric-${field}`}
              className={mode === 'weight' ? 'col-span-2' : undefined}
              label={field === 'weightKg' ? tProgress.weightField : tProgress.field[field]}
              hint={field === 'weightKg' ? undefined : tProgress.fieldHint[field]}
              inputMode="decimal"
              suffix={field === 'weightKg' ? 'kg' : 'cm'}
              value={values[field] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
              error={errorText(errors?.[field])}
            />
          ))}
        </div>
      </div>
    </Sheet>
  );
}
