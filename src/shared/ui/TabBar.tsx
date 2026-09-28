import type { ComponentType } from 'react';
import { NavLink } from 'react-router';
import { cn } from '@/shared/lib/cn';

export interface TabItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /** Tombol utama yang ditonjolkan di tengah (Latihan). */
  emphasized?: boolean;
}

export function TabBar({ items, label }: { items: readonly TabItem[]; label: string }) {
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-safe"
    >
      <ul className="mx-auto grid max-w-[560px] grid-cols-5 px-1.5 pt-2">
        {items.map(({ to, label: itemLabel, icon: Icon, emphasized }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-end gap-0.5 text-[11px] font-semibold',
                  isActive ? 'text-accent' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {emphasized ? (
                    <span
                      className={cn(
                        '-mt-5 grid size-12 place-items-center rounded-[14px] bg-accent text-accent-ink shadow-float',
                        isActive && 'outline-3 outline-accent-soft',
                      )}
                    >
                      <Icon className="size-6" aria-hidden />
                    </span>
                  ) : (
                    <Icon className="size-[22px]" aria-hidden />
                  )}
                  {itemLabel}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
