import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  /** Satuan di sisi kanan, mis. "kg". */
  suffix?: string;
  error?: string | undefined;
  hint?: string;
}

export function TextField({ id, label, suffix, error, hint, className, ...input }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          // 16 px mencegah iPhone memperbesar layar saat fokus.
          className={cn(
            'h-12 w-full rounded-xl border bg-surface px-3.5 text-[16px] text-ink tabular-nums outline-none focus-visible:border-accent',
            error ? 'border-bad' : 'border-line',
            suffix && 'pr-12',
          )}
          {...input}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 text-sm font-semibold text-muted">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-bad">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
