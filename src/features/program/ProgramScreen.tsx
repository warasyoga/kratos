import { Link } from 'react-router';
import type { ProgramDayView } from '@/application/program/getActiveProgram';
import { SUGGESTION } from '@/domain/standards';
import { t } from '@/shared/i18n/id';
import { Card } from '@/shared/ui/Card';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { SuggestionCard } from './components/SuggestionCard';
import { VolumeCard } from './components/VolumeCard';
import { WeekStrip } from './components/WeekStrip';
import { useActiveProgram, useExerciseNames, useSuggestions } from './hooks/useProgram';

function DayCard({ view, nameOf }: { view: ProgramDayView; nameOf: (id: string) => string }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[22px] leading-none uppercase">{view.day.label}</h2>
          <p className="text-[13px] text-muted">
            {t.weekdayLong[view.day.weekday]} ·{' '}
            {t.program.daySets(view.totalSets, view.estimatedMinutes)}
          </p>
        </div>
        <Link
          to={`/program/hari/${view.day.id}`}
          aria-label={`${t.program.editDay} ${view.day.label}`}
          className="grid min-h-11 place-items-center rounded-[10px] bg-surface-2 px-3.5 text-[13px] font-bold"
        >
          {t.program.editDay}
        </Link>
      </div>
      <ol className="flex flex-col divide-y divide-line">
        {view.exercises.map(({ programExercise: pe, exercise }) => (
          <li key={pe.id} className="flex flex-col py-2.5">
            <Link to={`/gerakan/${exercise.id}`} className="font-semibold">
              {exercise.name}
            </Link>
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
                  nameOf(pe.substitutedFrom),
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

/** Program minggu ini, saran trainer, dan volume per otot. docs/fitur/04-program.md */
export function ProgramScreen() {
  const { data: program } = useActiveProgram();
  const { data: suggestions = [] } = useSuggestions();
  const nameOf = useExerciseNames();

  if (!program) return <ScreenHeader title={t.program.title} />;
  const labels = new Map(program.days.map((d) => [d.day.weekday, d.day.label]));

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader
        eyebrow={program.program.name}
        title={t.program.title}
        aside={
          <Link
            to="/gerakan"
            className="grid min-h-11 place-items-center text-[13px] font-bold text-accent"
          >
            {t.program.library}
          </Link>
        }
      />
      <WeekStrip labels={labels} />
      {suggestions.slice(0, SUGGESTION.maxOpen).map((s) => (
        <SuggestionCard key={`${s.ruleId}:${s.targetKey}`} draft={s} nameOf={nameOf} />
      ))}
      {program.days.map((view) => (
        <DayCard key={view.day.id} view={view} nameOf={nameOf} />
      ))}
      <VolumeCard volume={program.weeklyVolume} />
    </div>
  );
}
