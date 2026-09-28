import { WEEKDAYS, type Weekday } from '@/domain/common/weekday';
import { t } from '@/shared/i18n/id';
import { cn } from '@/shared/lib/cn';

/** Tujuh hari dengan label hari latihan; hari lain = pemulihan. */
export function WeekStrip({ labels }: { labels: ReadonlyMap<Weekday, string> }) {
  return (
    <ul className="grid grid-cols-7 gap-1.5 text-center">
      {WEEKDAYS.map((day) => {
        const label = labels.get(day);
        return (
          <li
            key={day}
            className={cn(
              'flex flex-col gap-0.5 rounded-[10px] py-2 text-[11px] font-bold',
              label ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted',
            )}
          >
            {t.weekdayShort[day]}
            <span className="font-display text-[14px] leading-tight">{label ?? '—'}</span>
          </li>
        );
      })}
    </ul>
  );
}
