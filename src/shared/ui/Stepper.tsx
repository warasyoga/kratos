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
  /** Langkah khusus, mis. ke ukuran dumbbell berikutnya. Default: nilai ± step. */
  stepTo?: (value: number, direction: 1 | -1) => number;
  /** Format tampilan, mis. koma desimal. */
  format?: (value: number) => string;
}

/** Input angka dengan tombol − / + (target sentuh 44 px), untuk set, repetisi, dan beban. */
export function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  stepTo,
  format = String,
}: StepperProps) {
  const labelId = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const move = (direction: 1 | -1) =>
    onChange(clamp(stepTo ? stepTo(value, direction) : value + direction * step));
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
          onClick={() => move(-1)}
          className="grid size-11 place-items-center rounded-xl bg-surface-2 disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <output
          aria-live="polite"
          className="min-w-14 text-center font-display text-[22px] font-bold tabular-nums"
        >
          {format(value)}
          {suffix && <span className="ml-0.5 text-sm text-muted">{suffix}</span>}
        </output>
        <button
          type="button"
          aria-label={t.common.increase(label)}
          disabled={value >= max}
          onClick={() => move(1)}
          className="grid size-11 place-items-center rounded-xl bg-surface-2 disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
