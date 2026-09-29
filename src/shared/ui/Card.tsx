import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** 'gold' untuk rekor pribadi dan pencapaian. */
  tone?: 'default' | 'gold';
}

const toneClass = {
  default: 'border-line bg-surface',
  gold: 'border-gold-line bg-gold-bg',
} as const;

/** Satu-satunya komponen yang memiliki border + radius kartu (design system). */
export function Card({ tone = 'default', className, ...rest }: CardProps) {
  return (
    <section
      className={cn('flex flex-col gap-3 rounded-[18px] border p-4', toneClass[tone], className)}
      {...rest}
    />
  );
}
