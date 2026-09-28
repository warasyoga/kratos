import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface OptionGroupProps<T extends string> {
  name: string;
  label: string;
  options: readonly Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  error?: string | undefined;
  /** 'row' untuk pilihan pendek berjajar (mis. jenis kelamin). */
  layout?: 'stack' | 'row';
}

/** Pilihan tunggal berbentuk kartu (radio button yang dapat diakses). */
export function OptionGroup<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  error,
  layout = 'stack',
}: OptionGroupProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-[13px] font-semibold">{label}</legend>
      <div
        className={cn(
          'gap-2',
          layout === 'row' ? 'grid auto-cols-fr grid-flow-col' : 'flex flex-col',
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] border px-3.5 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent',
                selected ? 'border-accent bg-accent-soft' : 'border-line bg-surface',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="flex flex-1 flex-col">
                <span className={cn('font-semibold', selected && 'text-accent')}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-[13px] text-muted">{option.description}</span>
                )}
              </span>
              <span
                aria-hidden
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border-2',
                  selected ? 'border-accent bg-accent text-accent-ink' : 'border-line',
                )}
              >
                {selected && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
    </fieldset>
  );
}
