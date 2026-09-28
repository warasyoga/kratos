import { useQuery } from '@tanstack/react-query';
import type { ProgramDayView } from '@/application/program/getActiveProgram';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { WEEKDAYS } from '@/domain/common/weekday';
import { t } from '@/shared/i18n/id';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

function useActiveProgram() {
  const { program } = useServices();
  return useQuery({ queryKey: queryKeys.activeProgram, queryFn: program.getActive });
}

function DayCard({ view, names }: { view: ProgramDayView; names: Map<string, string> }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[22px] leading-none uppercase">{view.day.label}</h2>
          <p className="text-[13px] text-muted">{t.weekdayLong[view.day.weekday]}</p>
        </div>
        <Chip>{t.program.daySets(view.totalSets, view.estimatedMinutes)}</Chip>
      </div>
      <ol className="flex flex-col divide-y divide-line">
        {view.exercises.map(({ programExercise: pe, exercise }) => (
          <li key={pe.id} className="flex flex-col py-2.5">
            <span className="font-semibold">{exercise.name}</span>
            <span className="text-[13px] text-muted tabular-nums">
              {t.program.prescription(
                pe.sets,
                pe.repMin,
                pe.repMax,
                exercise.measure === 'seconds',
              )}{' '}
              · {t.program.rest(pe.restSec)}
            </span>
            {pe.substitutedFrom && pe.substitutionReason && (
              <span className="text-[13px] font-semibold text-warn">
                {t.program.substituted(
                  names.get(pe.substitutedFrom) ?? pe.substitutedFrom,
                  t.substitutionReason[pe.substitutionReason],
                )}
              </span>
            )}
            {pe.progressionLocked && (
              <span className="text-[13px] text-warn">{t.program.locked}</span>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** Tahap 3: tampilan program. Edit dan saran trainer: Tahap 4 (docs/fitur/04-program.md). */
export function ProgramScreen() {
  const { data: program } = useActiveProgram();
  const { exercises } = useServices().catalog;
  const { data: library = [] } = useQuery({ queryKey: queryKeys.exercises, queryFn: exercises });
  const names = new Map(library.map((e) => [e.id, e.name]));

  if (!program) return <ScreenHeader title={t.program.title} />;
  const byWeekday = new Map(program.days.map((d) => [d.day.weekday, d.day.label]));

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader eyebrow={program.program.name} title={t.program.title} />
      <ul className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((day) => {
          const label = byWeekday.get(day);
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
      {program.days.map((view) => (
        <DayCard key={view.day.id} view={view} names={names} />
      ))}
      <p className="text-center text-[13px] text-muted">{t.program.editComingSoon}</p>
    </div>
  );
}
