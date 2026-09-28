import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type Variant = 'primary' | 'ghost';
type Size = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink',
  ghost: 'bg-surface-2 text-ink',
};

// Tinggi minimum 44 px sesuai target sentuh di design system.
const sizeClass: Record<Size, string> = {
  md: 'min-h-12 rounded-[14px] px-4 text-[15px]',
  sm: 'min-h-11 rounded-[10px] px-3 text-[13px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold transition-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variantClass[variant],
        sizeClass[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  );
}
