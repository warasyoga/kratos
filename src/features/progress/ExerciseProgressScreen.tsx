import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { t } from '@/shared/i18n/id';
import { formatDayDate, formatKg, formatShortDate } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { LineChart } from '@/shared/ui/charts/LineChart';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Stat } from '@/shared/ui/Stat';
import { dayX, formatDayX, formatKg1 } from './chartData';
import { useExerciseProgress } from './hooks/useProgress';

/** Riwayat satu gerakan: grafik 1RM sepanjang waktu, rekor, dan semua sesi. */
export function ExerciseProgressScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isPending } = useExerciseProgress(id);

  const back = (
    <button
      type="button"
      onClick={() => void navigate(-1)}
      className="flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-accent"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {t.common.back}
    </button>
  );
  if (isPending) return back;
  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <p className="text-muted">{t.errors.not_found}</p>
      </div>
    );
  }

  const { exercise, points, sessions, prs } = data;
  const first = points[0];
  const last = points.at(-1);
  const prSessions = new Set(prs.map((p) => p.sessionId));

  return (
    <div className="flex flex-col gap-3.5">
      {back}
      <ScreenHeader title={exercise.name} eyebrow={t.progress.e1rmTitle} />
      <div className="grid grid-cols-3 gap-2">
        <Stat
          value={last ? formatKg1(last.e1rmKg).replace(' kg', '') : '—'}
          label={t.progress.detailCurrent}
        />
        <Stat
          value={data.bestE1rmKg === null ? '—' : formatKg1(data.bestE1rmKg).replace(' kg', '')}
          label={t.progress.detailBest}
        />
        <Stat value={String(sessions.length)} label={t.progress.detailSessions} />
      </div>

      <Card>
        {first && last && points.length >= 2 ? (
          <LineChart
            label={t.progress.e1rmChart(
              exercise.name,
              formatShortDate(first.logDate),
              formatShortDate(last.logDate),
              formatKg1(last.e1rmKg),
            )}
            series={[
              {
                variant: 'line',
                points: points.map((p) => ({ x: dayX(p.logDate), y: p.e1rmKg })),
              },
            ]}
            formatX={formatDayX}
            formatY={(y) => formatKg1(y).replace(' kg', '')}
          />
        ) : (
          <p className="text-[13px] text-muted">{t.progress.detailNote}</p>
        )}
        <p className="text-xs text-muted">{t.progress.e1rmNote}</p>
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.progress.historyTitle}</h2>
        <ul className="flex flex-col divide-y divide-line">
          {sessions.map((s) => (
            <li key={s.sessionId} className="flex flex-col gap-1 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{formatDayDate(s.logDate)}</span>
                {prSessions.has(s.sessionId) ? (
                  <Chip tone="accent">{t.progress.prChip}</Chip>
                ) : (
                  s.e1rmKg !== null && (
                    <span className="text-xs text-muted tabular-nums">{formatKg1(s.e1rmKg)}</span>
                  )
                )}
              </div>
              <p className="text-[13px] text-muted tabular-nums">
                {s.sets
                  .map((set) => t.progress.setLine(formatKg(set.weightKg), set.reps))
                  .join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Link
        to={`/gerakan/${exercise.id}`}
        className="flex min-h-11 items-center justify-center text-sm font-semibold text-accent"
      >
        {t.progress.guideLink}
      </Link>
    </div>
  );
}
