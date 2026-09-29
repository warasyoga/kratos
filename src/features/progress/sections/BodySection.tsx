import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import { CIRCUMFERENCES } from '@/domain/body/types';
import type { ProgressRange } from '@/domain/progress/range';
import { t } from '@/shared/i18n/id';
import { tProfile } from '@/shared/i18n/onboarding';
import { tProgress } from '@/shared/i18n/progress';
import { cn } from '@/shared/lib/cn';
import { formatFixed, formatNumber, formatShortDate, formatSigned } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { LineChart } from '@/shared/ui/charts/LineChart';
import { Chip } from '@/shared/ui/Chip';
import { Stat } from '@/shared/ui/Stat';
import { dayX, formatDayX, formatKg1 } from '../chartData';
import { LogMetricSheet } from '../components/LogMetricSheet';
import { useBodyProgress, useProgressAction } from '../hooks/useProgress';

/** Berat (tren + laju naik), ukuran tubuh, dan estimasi lemak. */
export function BodySection({ range }: { range: ProgressRange }) {
  const { data } = useBodyProgress(range);
  const { progress } = useServices();
  const { run, pending } = useProgressAction();
  const [sheet, setSheet] = useState<'weight' | 'measure'>();
  if (!data) return null;

  const first = data.trend[0];
  const last = data.trend.at(-1);
  const rate = data.rate;

  return (
    <>
      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans label-caps">{tProgress.weightTitle}</h2>
          {rate && (
            <Chip tone={rate.status === 'on_target' ? 'good' : 'warn'}>
              {tProgress.rateStatus[rate.status]}
            </Chip>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-3">
          {data.latestWeightKg !== null && (
            <p className="font-display text-[40px] leading-none font-bold tabular-nums">
              {formatKg1(data.latestWeightKg)}
            </p>
          )}
          {rate && (
            <p className="text-right text-[13px] font-semibold tabular-nums">
              {tProgress.rateValue(
                formatSigned(rate.weeklyChangeKg, 2),
                formatSigned(rate.weeklyPct * 100, 2),
              )}
            </p>
          )}
        </div>
        {first && last && data.trend.length >= 2 ? (
          <>
            <LineChart
              label={tProgress.weightChart(
                formatShortDate(first.logDate),
                formatShortDate(last.logDate),
                formatKg1(last.trendKg),
              )}
              band={{
                points: data.band.map((b) => ({ x: dayX(b.logDate), lo: b.loKg, hi: b.hiKg })),
              }}
              series={[
                {
                  variant: 'dots',
                  points: data.trend.flatMap((p) =>
                    p.weightKg === undefined ? [] : [{ x: dayX(p.logDate), y: p.weightKg }],
                  ),
                },
                {
                  variant: 'line',
                  points: data.trend.map((p) => ({ x: dayX(p.logDate), y: p.trendKg })),
                },
              ]}
              formatX={formatDayX}
              formatY={(y) => formatNumber(y, 1)}
            />
            <p className="text-xs text-muted">{tProgress.weightLegend}</p>
          </>
        ) : (
          <p className="text-[13px] text-muted">{tProgress.weightOne}</p>
        )}
        <p className="text-[13px]">
          {rate ? tProgress.rateHint[rate.status] : tProgress.rateNeedsData}
        </p>
        <Button variant="ghost" onClick={() => setSheet('weight')}>
          {tProgress.logWeight}
        </Button>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans label-caps">{tProgress.measureTitle}</h2>
          {data.measurementDue && <Chip tone="accent">{tProgress.measureDue}</Chip>}
        </div>
        {data.measurements.length === 0 ? (
          <p className="text-sm text-muted">{tProgress.measureEmpty}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-line">
              {CIRCUMFERENCES.flatMap((field) => {
                const m = data.measurements.find((x) => x.field === field);
                return m
                  ? [
                      <tr key={field}>
                        <th scope="row" className="py-2 text-left font-normal">
                          {tProgress.field[field]}
                        </th>
                        <td className="py-2 text-right font-semibold tabular-nums">
                          {formatNumber(m.latestCm, 1)} cm
                        </td>
                        <td
                          className={cn(
                            'w-20 py-2 text-right text-xs font-semibold tabular-nums',
                            m.changeCm === null ? 'text-muted' : 'text-ink',
                          )}
                        >
                          {m.changeCm === null ? '—' : tProgress.changeCm(formatSigned(m.changeCm))}
                        </td>
                      </tr>,
                    ]
                  : [];
              })}
            </tbody>
          </table>
        )}
        {data.lastMeasuredOn && (
          <p className="text-xs text-muted">
            {tProgress.lastMeasured(formatShortDate(data.lastMeasuredOn))} ·{' '}
            {tProgress.measureDueHint}
          </p>
        )}
        <Button variant="ghost" onClick={() => setSheet('measure')}>
          {tProgress.logMeasure}
        </Button>
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{tProgress.bodyFatTitle}</h2>
        <div className="grid grid-cols-2 gap-2">
          <Stat
            value={data.bodyFat ? `${formatFixed(data.bodyFat.latest.pct, 1)}%` : '—'}
            label={
              data.bodyFat && data.bodyFat.changePct !== null
                ? `${formatSigned(data.bodyFat.changePct)}% · US Navy`
                : 'US Navy'
            }
          />
          <Stat
            value={data.bmi ? formatFixed(data.bmi.value, 1) : '—'}
            label={data.bmi ? `BMI · ${t.bmi[data.bmi.category]}` : 'BMI'}
          />
        </div>
        <p className="text-xs text-muted">
          {data.bodyFat ? tProgress.bodyFatNote : tProgress.bodyFatNeeds(data.sex === 'female')}
        </p>
        {data.bmi && (
          <p className="text-xs text-muted">{tProfile.bmiAsiaNote(t.bmi[data.bmi.asiaCategory])}</p>
        )}
      </Card>

      {data.recentEntries.length > 0 && (
        <Card>
          <h2 className="font-sans label-caps">{tProgress.entriesTitle}</h2>
          <ul className="flex flex-col divide-y divide-line">
            {data.recentEntries.map((entry) => {
              const parts = [
                entry.weightKg !== undefined && formatKg1(entry.weightKg),
                ...CIRCUMFERENCES.map(
                  (f) =>
                    entry[f] !== undefined &&
                    `${tProgress.field[f]} ${formatNumber(entry[f] ?? 0, 1)}`,
                ),
              ].filter(Boolean);
              const date = formatShortDate(entry.logDate);
              return (
                <li key={entry.id} className="flex items-center gap-2 py-1.5 text-[13px]">
                  <span className="w-14 shrink-0 font-semibold">{date}</span>
                  <span className="min-w-0 flex-1 text-muted">{parts.join(' · ')}</span>
                  <button
                    type="button"
                    disabled={pending}
                    aria-label={tProgress.removeEntry(date)}
                    onClick={() =>
                      void run(() => progress.removeMetric(entry.id), tProgress.entryRemoved)
                    }
                    className="grid size-11 shrink-0 place-items-center rounded-full text-muted"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {sheet && <LogMetricSheet mode={sheet} onClose={() => setSheet(undefined)} />}
    </>
  );
}
