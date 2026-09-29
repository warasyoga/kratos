import { Link } from 'react-router';
import type { ProgressRange } from '@/domain/progress/range';
import { WEEKLY_SETS_PER_MUSCLE } from '@/domain/standards';
import { t } from '@/shared/i18n/id';
import { tProgress } from '@/shared/i18n/progress';
import { cn } from '@/shared/lib/cn';
import { formatNumber, formatShortDate } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { BarChart } from '@/shared/ui/charts/BarChart';
import { Meter } from '@/shared/ui/Meter';
import { formatCompact } from '../chartData';
import { EmptyCard } from '../components/EmptyCard';
import { useVolumeProgress } from '../hooks/useProgress';

const SCALE_MAX = 24;

/** Set per otot minggu ini vs zona 10–20, tonase mingguan, kehadiran. */
export function VolumeSection({ range }: { range: ProgressRange }) {
  const { data } = useVolumeProgress(range);
  if (data === undefined) return null;
  if (data === null) return <EmptyCard>{tProgress.volumeEmpty}</EmptyCard>;

  const zoneStart = (WEEKLY_SETS_PER_MUSCLE.min / SCALE_MAX) * 100;
  const zoneWidth = ((WEEKLY_SETS_PER_MUSCLE.max - WEEKLY_SETS_PER_MUSCLE.min) / SCALE_MAX) * 100;
  const lastTonnage = data.tonnage.at(-1);
  const { done, scheduled } = data.attendanceTotal;

  return (
    <>
      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans label-caps">{tProgress.weekVolumeTitle}</h2>
          <span className="text-xs text-muted">{tProgress.weekVolumeZone}</span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {data.thisWeek.map((v) => (
            <li
              key={v.muscle}
              className="grid grid-cols-[96px_1fr_auto] items-center gap-2 text-[13px]"
            >
              <span>{t.muscle[v.muscle]}</span>
              <span className="relative h-2.5 rounded-full bg-surface-2" aria-hidden>
                <span
                  className="absolute inset-y-0 rounded-full bg-good-bg"
                  style={{ left: `${zoneStart}%`, width: `${zoneWidth}%` }}
                />
                <span
                  className={cn(
                    'absolute inset-y-0.5 left-0 rounded-full',
                    v.status === 'optimal' ? 'bg-good' : 'bg-accent',
                  )}
                  style={{ width: `${Math.min(v.doneSets / SCALE_MAX, 1) * 100}%` }}
                />
                {v.plannedSets > 0 && (
                  <span
                    className="absolute -inset-y-0.5 w-0.5 rounded-full bg-ink"
                    style={{ left: `${Math.min(v.plannedSets / SCALE_MAX, 1) * 100}%` }}
                  />
                )}
              </span>
              <span className="font-semibold tabular-nums">
                {tProgress.weekVolumeValue(formatNumber(v.doneSets), formatNumber(v.plannedSets))}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">{tProgress.weekVolumeNote}</p>
        <Link to="/progres/otot" className="text-sm font-semibold text-accent">
          {t.muscleMap.open}
        </Link>
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{tProgress.tonnageTitle}</h2>
        {lastTonnage && (
          <p className="font-display text-[32px] leading-none font-bold tabular-nums">
            {formatNumber(lastTonnage.tonnageKg, 0)} kg
          </p>
        )}
        <BarChart
          label={tProgress.tonnageChart(
            data.tonnage.length,
            `${formatNumber(lastTonnage?.tonnageKg ?? 0, 0)} kg`,
          )}
          bars={data.tonnage.map((w) => ({
            key: w.weekStart,
            label: formatShortDate(w.weekStart),
            value: w.tonnageKg,
          }))}
          formatY={formatCompact}
        />
        <p className="text-xs text-muted">{tProgress.tonnageNote}</p>
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{tProgress.attendanceTitle}</h2>
        <Meter
          label={tProgress.since(formatShortDate(data.fromDate))}
          valueText={tProgress.attendanceValue(done, scheduled)}
          ratio={scheduled > 0 ? done / scheduled : 0}
        />
        <ol className="flex flex-wrap gap-1.5">
          {data.attendance
            .filter((w) => w.scheduled > 0)
            .map((w) => {
              const date = formatShortDate(w.weekStart);
              return (
                <li
                  key={w.weekStart}
                  aria-label={tProgress.attendanceWeek(date, w.done, w.scheduled)}
                  className={cn(
                    'rounded-lg px-2 py-1 text-xs font-bold tabular-nums',
                    w.done >= w.scheduled ? 'bg-good-bg text-good' : 'bg-surface-2 text-muted',
                  )}
                >
                  {w.done}/{w.scheduled}
                </li>
              );
            })}
        </ol>
      </Card>
    </>
  );
}
