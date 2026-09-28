import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type ChipTone = 'neutral' | 'accent' | 'good' | 'warn' | 'bad';

const toneClass: Record<ChipTone, string> = {
  neutral: 'bg-surface-2 text-muted',
  accent: 'bg-accent-soft text-accent',
  good: 'bg-good-bg text-good',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-surface-2 text-bad',
};

export function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}
