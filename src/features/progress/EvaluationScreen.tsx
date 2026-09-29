import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import type { SuggestionDraft } from '@/domain/trainer/suggestions';
import { t } from '@/shared/i18n/id';
import { tProgress } from '@/shared/i18n/progress';
import { describeSuggestion } from '@/shared/i18n/suggestionText';
import { formatDateRange, formatNumber, formatSigned } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Stat } from '@/shared/ui/Stat';
import { formatKg1 } from './chartData';

/** Evaluasi bulanan / akhir blok. docs/fitur/11-pencapaian.md */
export function EvaluationScreen() {
  const { key = '' } = useParams();
  const { evaluation } = useServices();
  const navigate = useNavigate();
  const { data: report, isPending } = useQuery({
    queryKey: queryKeys.evaluation(key),
    queryFn: () => evaluation.report(key),
  });

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
  if (!report) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <p className="text-muted">{t.errors.not_found}</p>
      </div>
    );
  }

  const { attendance } = report;
  const pct = attendance.scheduled > 0 ? (attendance.done / attendance.scheduled) * 100 : 0;
  const noData = t.achievements.noData;

  return (
    <div className="flex flex-col gap-3.5">
      {back}
      <ScreenHeader
        title={t.achievements.periodTitle(report.kind, report.label)}
        eyebrow={formatDateRange(report.from, report.to)}
      />

      <div className="grid grid-cols-2 gap-2">
        <Stat value={String(report.sessions)} label={t.achievements.sessions} />
        <Stat value={`${formatNumber(report.tonnageKg, 0)} kg`} label={t.achievements.tonnage} />
      </div>

      <Card>
        <h2 className="font-sans label-caps">{t.achievements.attendance}</h2>
        <p className="text-sm font-semibold">
          {attendance.scheduled > 0
            ? t.achievements.attendanceValue(
                attendance.done,
                attendance.scheduled,
                formatNumber(pct, 0),
              )
            : noData}
        </p>
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.achievements.liftsTitle}</h2>
        {report.lifts.length === 0 ? (
          <p className="text-sm text-muted">{noData}</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {report.lifts.map((lift) => (
              <li key={lift.exercise.id} className="flex items-center justify-between gap-2">
                <span className="font-semibold">{lift.exercise.name}</span>
                <span className="tabular-nums">
                  {t.achievements.liftLine(formatKg1(lift.fromKg), formatKg1(lift.toKg))}{' '}
                  <span className={lift.toKg >= lift.fromKg ? 'text-good' : 'text-warn'}>
                    ({formatSigned(lift.toKg - lift.fromKg)} kg)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.achievements.bodyTitle}</h2>
        <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 text-sm">
          <dt>{t.achievements.weightChange}</dt>
          <dd className="font-semibold tabular-nums">
            {report.weightChangeKg === null
              ? noData
              : `${formatSigned(report.weightChangeKg, 2)} kg`}
          </dd>
          {report.measurements.map((m) => (
            <div key={m.field} className="contents">
              <dt>{tProgress.field[m.field]}</dt>
              <dd className="font-semibold tabular-nums">{formatSigned(m.changeCm)} cm</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.achievements.habitsTitle}</h2>
        <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 text-sm">
          <dt>{t.achievements.avgProtein}</dt>
          <dd className="font-semibold tabular-nums">
            {report.averageProteinG === null
              ? noData
              : `${formatNumber(report.averageProteinG, 0)} g`}
          </dd>
          <dt>{t.achievements.avgSleep}</dt>
          <dd className="font-semibold tabular-nums">
            {report.averageSleepHours === null
              ? noData
              : `${formatNumber(report.averageSleepHours)} jam`}
          </dd>
        </dl>
      </Card>

      <Card tone="gold">
        <h2 className="font-sans label-caps text-gold">{t.achievements.focusTitle}</h2>
        {report.focus.length === 0 ? (
          <p className="text-sm">{t.achievements.focusEmpty}</p>
        ) : (
          <FocusList drafts={report.focus} />
        )}
      </Card>
    </div>
  );
}

/** Saran fokus; teks lengkap & tombol terapkan ada di layar Program. */
function FocusList({ drafts }: { drafts: readonly SuggestionDraft[] }) {
  const { catalog } = useServices();
  const { data: items = [] } = useQuery({ queryKey: queryKeys.catalog, queryFn: catalog.list });
  const nameOf = (id: string) => items.find((i) => i.exercise.id === id)?.exercise.name ?? id;
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
      {drafts.map((d) => (
        <li key={`${d.ruleId}-${d.targetKey}`}>{describeSuggestion(d, nameOf).message}</li>
      ))}
    </ul>
  );
}
