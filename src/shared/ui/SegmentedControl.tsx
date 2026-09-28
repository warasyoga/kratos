import { cn } from '@/shared/lib/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-surface-2 p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-10 rounded-[10px] px-2 text-[13px] font-semibold transition-colors',
              selected ? 'bg-accent-soft text-accent' : 'text-muted',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
