import { Minus, Plus } from 'lucide-react';
import { useId } from 'react';
import { t } from '@/shared/i18n/id';

export interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}

/** Input angka dengan tombol − / + (target sentuh 44 px), untuk set, repetisi, dan beban. */
export function Stepper({ label, value, onChange, min, max, step = 1, suffix }: StepperProps) {
  const labelId = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex items-center justify-between gap-3">
      <span id={labelId} className="text-sm font-semibold">
        {label}
      </span>
      <div role="group" aria-labelledby={labelId} className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={t.common.decrease(label)}
          disabled={value <= min}
          onClick={() => onChange(clamp(value - step))}
          className="grid size-11 place-items-center rounded-xl bg-surface-2 disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <output
          aria-live="polite"
          className="min-w-14 text-center font-display text-[22px] font-bold tabular-nums"
        >
          {value}
          {suffix && <span className="ml-0.5 text-sm text-muted">{suffix}</span>}
        </output>
        <button
          type="button"
          aria-label={t.common.increase(label)}
          disabled={value >= max}
          onClick={() => onChange(clamp(value + step))}
          className="grid size-11 place-items-center rounded-xl bg-surface-2 disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
