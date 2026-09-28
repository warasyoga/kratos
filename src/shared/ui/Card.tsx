import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/** Satu-satunya komponen yang memiliki border + radius kartu (design system). */
export function Card({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-[18px] border border-line bg-surface p-4',
        className,
      )}
      {...rest}
    />
  );
}
