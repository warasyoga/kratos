import { Check } from 'lucide-react';
import type { WeekDayView } from '@/domain/today/week';
import { t } from '@/shared/i18n/id';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';

const CELL: Record<WeekDayView['status'], string> = {
  done: 'bg-good text-surface',
  missed: 'border-2 border-warn text-warn',
  today: 'border-2 border-accent text-accent',
  upcoming: 'bg-accent-soft text-accent',
  recovery: 'bg-surface-2 text-muted',
};

/** Kalender minggu berjalan + streak (docs/fitur/02-hari-ini.md). */
export function WeekCard({
  week,
  streakWeeks,
}: {
  week: readonly WeekDayView[];
  streakWeeks: number;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-sans label-caps">{t.today.weekTitle}</h2>
        {streakWeeks > 0 && <Chip tone="good">{t.today.streak(streakWeeks)}</Chip>}
      </div>
      <ol className="grid grid-cols-7 gap-1 text-center">
        {week.map((d) => (
          <li
            key={d.date}
            aria-label={`${t.weekdayLong[d.weekday]}${d.label ? ` · ${d.label}` : ''} · ${t.today.status[d.status]}`}
            className="flex flex-col items-center gap-1 text-[11px] font-bold text-muted"
          >
            <span
              className={cn(
                'grid size-9 place-items-center rounded-full text-[11px]',
                CELL[d.status],
              )}
            >
              {d.status === 'done' ? (
                <Check className="size-4" strokeWidth={3} aria-hidden />
              ) : (
                (d.label
                  ?.split(' ')
                  .map((w) => w[0])
                  .join('') ?? '·')
              )}
            </span>
            {t.weekdayShort[d.weekday]}
          </li>
        ))}
      </ol>
      {streakWeeks === 0 && <p className="text-xs text-muted">{t.today.streakNone}</p>}
    </Card>
  );
}
