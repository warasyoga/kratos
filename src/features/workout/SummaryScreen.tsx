import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { tSummary } from '@/shared/i18n/workout';
import { formatKg, formatNumber } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { Chip, type ChipTone } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Stat } from '@/shared/ui/Stat';

const KIND_TONE: Record<'increase' | 'hold' | 'decrease' | 'deload', ChipTone> = {
  increase: 'good',
  hold: 'neutral',
  decrease: 'warn',
  deload: 'neutral',
};

/** Ringkasan setelah sesi: durasi, set, tonase, rekor, dan beban sesi berikutnya. */
export function SummaryScreen() {
  const { sessionId = '' } = useParams();
  const { workout, catalog } = useServices();
  const { data: session, isPending } = useQuery({
    queryKey: queryKeys.session(sessionId),
    queryFn: () => workout.get(sessionId),
  });
  const { data: library = [] } = useQuery({
    queryKey: queryKeys.exercises,
    queryFn: catalog.exercises,
  });
  const nameOf = (id: string) => library.find((e) => e.id === id)?.name ?? id;

  if (isPending) return null;
  const summary = session?.summary;
  if (!session || !summary) return <p className="text-muted">{tSummary.notFound}</p>;

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader eyebrow={session.dayLabel} title={tSummary.title} />
      <div className="grid grid-cols-3 gap-2">
        <Stat value={String(summary.durationMin)} label={tSummary.duration} />
        <Stat value={String(summary.workingSets)} label={tSummary.sets} />
        <Stat value={formatNumber(summary.tonnageKg, 0)} label={tSummary.tonnage} />
      </div>

      {summary.prs.length > 0 && (
        <section
          aria-label={tSummary.prs}
          className="flex flex-col gap-1.5 rounded-[18px] bg-ink p-4 text-ground"
        >
          <h2 className="font-sans label-caps text-plate-yellow">{tSummary.prs}</h2>
          {summary.prs.map((pr) => (
            <p key={pr.exerciseId} className="font-semibold">
              {tSummary.prLine(nameOf(pr.exerciseId), formatKg(pr.weightKg), pr.reps)}
            </p>
          ))}
        </section>
      )}

      {summary.next.length > 0 && (
        <Card>
          <h2 className="font-sans label-caps">{tSummary.next}</h2>
          <ul className="flex flex-col divide-y divide-line">
            {summary.next.map((n) => (
              <li key={n.exerciseId} className="flex items-center justify-between gap-2 py-2.5">
                <span>
                  <span className="block font-semibold">{nameOf(n.exerciseId)}</span>
                  <span className="text-[13px] text-muted tabular-nums">
                    {tSummary.nextLine[n.kind](
                      n.fromKg === null ? '—' : formatKg(n.fromKg),
                      formatKg(n.toKg),
                      n.targetReps,
                    )}
                  </span>
                </span>
                <Chip tone={KIND_TONE[n.kind]}>{tSummary.nextKind[n.kind]}</Chip>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Link
        to="/"
        className="grid min-h-12 place-items-center rounded-[14px] bg-accent font-bold text-accent-ink"
      >
        {tSummary.done}
      </Link>
    </div>
  );
}
