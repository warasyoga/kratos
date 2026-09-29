import { ChevronRight, Trophy } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router';
import type { ProgressRange } from '@/domain/progress/range';
import { tProgress } from '@/shared/i18n/progress';
import { cn } from '@/shared/lib/cn';
import { formatKg, formatShortDate, formatSigned } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { LineChart } from '@/shared/ui/charts/LineChart';
import { Sparkline } from '@/shared/ui/charts/Sparkline';
import { Chip } from '@/shared/ui/Chip';
import { dayX, formatDayX, formatKg1 } from '../chartData';
import { EmptyCard } from '../components/EmptyCard';
import { useStrengthProgress } from '../hooks/useProgress';

/** 1RM estimasi per gerakan dan rekor pribadi. */
export function StrengthSection({ range }: { range: ProgressRange }) {
  const { data } = useStrengthProgress(range);
  const [selectedId, setSelectedId] = useState<string>();
  const selectId = useId();
  if (!data) return null;
  if (data.exercises.length === 0) return <EmptyCard>{tProgress.strengthEmpty}</EmptyCard>;

  const featured = data.exercises.find((e) => e.exercise.id === selectedId) ?? data.exercises[0];
  const first = featured?.points[0];
  const last = featured?.points.at(-1);

  return (
    <>
      {data.recentPrs.length > 0 && (
        <Card tone="gold">
          <h2 className="flex items-center gap-2 font-sans label-caps text-gold">
            <Trophy className="size-4" aria-hidden />
            {tProgress.prsTitle}
          </h2>
          <ul className="flex flex-col gap-2">
            {data.recentPrs.map((pr) => (
              <li
                key={`${pr.exerciseId}-${pr.sessionId}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{pr.exercise.name}</span>
                  <span className="text-xs text-muted">
                    {formatShortDate(pr.logDate)} ·{' '}
                    {pr.kinds.map((k) => tProgress.prKind[k]).join(' + ')}
                  </span>
                </span>
                <span className="font-display text-lg font-bold whitespace-nowrap tabular-nums">
                  {tProgress.setLine(formatKg(pr.weightKg), pr.reps)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {featured && (
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-sans label-caps">{tProgress.e1rmTitle}</h2>
            {featured.changeKg !== null && (
              <Chip tone={featured.changeKg >= 0 ? 'good' : 'warn'}>
                {formatSigned(featured.changeKg)} kg
              </Chip>
            )}
          </div>
          <label htmlFor={selectId} className="sr-only">
            {tProgress.exercisesTitle}
          </label>
          <select
            id={selectId}
            value={featured.exercise.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-[16px] font-semibold text-ink"
          >
            {data.exercises.map((e) => (
              <option key={e.exercise.id} value={e.exercise.id}>
                {e.exercise.name}
              </option>
            ))}
          </select>
          {featured.currentE1rmKg !== null && (
            <p className="font-display text-[40px] leading-none font-bold tabular-nums">
              {formatKg1(featured.currentE1rmKg)}
            </p>
          )}
          {first && last && featured.points.length >= 2 ? (
            <LineChart
              label={tProgress.e1rmChart(
                featured.exercise.name,
                formatShortDate(first.logDate),
                formatShortDate(last.logDate),
                formatKg1(last.e1rmKg),
              )}
              series={[
                {
                  variant: 'line',
                  points: featured.points.map((p) => ({ x: dayX(p.logDate), y: p.e1rmKg })),
                },
              ]}
              formatX={formatDayX}
              formatY={(y) => formatKg1(y).replace(' kg', '')}
            />
          ) : (
            <p className="text-[13px] text-muted">{tProgress.detailNote}</p>
          )}
          <p className="text-xs text-muted">{tProgress.e1rmNote}</p>
        </Card>
      )}

      <Card>
        <h2 className="font-sans label-caps">{tProgress.exercisesTitle}</h2>
        <ul className="flex flex-col divide-y divide-line">
          {data.exercises.map((e) => (
            <li key={e.exercise.id}>
              <Link
                to={`/progres/gerakan/${e.exercise.id}`}
                className="flex min-h-14 items-center gap-3 py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{e.exercise.name}</span>
                  <span className="text-xs text-muted">{tProgress.sessions(e.sessionCount)}</span>
                </span>
                <Sparkline values={e.points.map((p) => p.e1rmKg)} />
                <span className="w-20 text-right">
                  <span className="block font-semibold tabular-nums">
                    {e.currentE1rmKg === null ? '—' : formatKg1(e.currentE1rmKg)}
                  </span>
                  {e.changeKg !== null && (
                    <span
                      className={cn(
                        'text-xs font-semibold tabular-nums',
                        e.changeKg >= 0 ? 'text-good' : 'text-warn',
                      )}
                    >
                      {formatSigned(e.changeKg)} kg
                    </span>
                  )}
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
