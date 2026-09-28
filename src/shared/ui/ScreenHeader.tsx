import type { ReactNode } from 'react';

export interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  aside?: ReactNode;
}

export function ScreenHeader({ title, eyebrow, aside }: ScreenHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-[13px] font-medium text-muted">{eyebrow}</p>}
        <h1 className="text-[30px] leading-none uppercase">{title}</h1>
      </div>
      {aside}
    </header>
  );
}
