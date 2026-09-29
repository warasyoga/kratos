import { Link, useNavigate } from 'react-router';
import { useServices } from '@/application/ServicesContext';
import { MESOCYCLE_WEEKS } from '@/domain/standards';
import { t } from '@/shared/i18n/id';
import { formatDayDate, formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Stat } from '@/shared/ui/Stat';
import { RecoveryCard } from './components/RecoveryCard';
import { WeekCard } from './components/WeekCard';
import { useTodayAction, useTodayPlan, useTopSuggestion } from './hooks/useToday';

const PREVIEW_COUNT = 3;
const primaryLink =
  'grid min-h-12 place-items-center rounded-[14px] bg-accent font-bold text-accent-ink';

/** Layar pertama setiap hari: apa yang harus dilakukan hari ini. docs/fitur/02-hari-ini.md */
export function TodayScreen() {
  const { workout } = useServices();
  const navigate = useNavigate();
  const { data: plan } = useTodayPlan();
  const { data: suggestions = [] } = useTopSuggestion();
  const { run, pending } = useTodayAction();

  if (!plan) return <ScreenHeader title={t.today.title} />;
  const { day } = plan;
  const missed = plan.kind === 'recovery' && !plan.hasActiveSession ? plan.missed[0] : undefined;

  const trainMissed = async (programDayId: string) => {
    const result = await run(() => workout.start({ programDayId }));
    if (result.ok) navigate('/latihan');
  };

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader
        eyebrow={formatDayDate(plan.date)}
        title={plan.kind === 'gym' ? t.today.gymDay : t.today.recoveryDay}
        aside={
          <Chip tone={plan.isDeloadWeek ? 'warn' : 'accent'}>
            {plan.isDeloadWeek
              ? t.today.deloadChip
              : t.today.weekChip(plan.blockWeek, MESOCYCLE_WEEKS)}
          </Chip>
        }
      />
      {plan.isDeloadWeek && (
        <p className="rounded-[14px] bg-warn-bg px-3.5 py-2.5 text-[13px] text-warn">
          {t.today.deloadBody}
        </p>
      )}

      {day && (
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-sans label-caps">{t.today.title}</h2>
            <Chip>{t.today.workoutMeta(day.exercises.length, day.estimatedMinutes)}</Chip>
          </div>
          <p className="font-display text-[40px] leading-[0.9] font-bold uppercase">
            {day.day.label}
          </p>

          {plan.doneToday ? (
            <>
              <p className="font-semibold text-good">{t.today.doneTitle}</p>
              <Link to={`/latihan/ringkasan/${plan.doneToday.sessionId}`} className={primaryLink}>
                {t.today.seeSummary}
              </Link>
            </>
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-line">
                {day.exercises.slice(0, PREVIEW_COUNT).map(({ programExercise: pe, exercise }) => (
                  <li
                    key={pe.id}
                    className="flex items-center justify-between gap-2 py-2.5 text-sm"
                  >
                    <span className="font-semibold">{exercise.name}</span>
                    <span className="text-muted tabular-nums">
                      {t.program.prescription(
                        pe.sets,
                        pe.repMin,
                        pe.repMax,
                        exercise.measure === 'seconds',
                      )}
                    </span>
                  </li>
                ))}
                {day.exercises.length > PREVIEW_COUNT && (
                  <li className="py-2.5 text-[13px] text-muted">
                    {t.today.moreExercises(day.exercises.length - PREVIEW_COUNT)}
                  </li>
                )}
              </ul>
              {!plan.checkIn && !plan.hasActiveSession && (
                <p className="text-[13px] text-muted">{t.today.checkInPending}</p>
              )}
              <Link to="/latihan" className={primaryLink}>
                {plan.hasActiveSession
                  ? t.workout.resume
                  : plan.checkIn
                    ? t.workout.start
                    : t.today.checkInDo}
              </Link>
            </>
          )}
        </Card>
      )}

      {missed && (
        <Card>
          <h2 className="font-sans label-caps">{t.today.missedTitle}</h2>
          <p className="text-sm">
            {t.today.missedBody(missed.label, t.weekdayLong[missed.weekday])}
          </p>
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => void trainMissed(missed.programDayId)}
          >
            {t.today.trainNow(missed.label)}
          </Button>
        </Card>
      )}

      {plan.kind === 'recovery' && (
        <>
          <RecoveryCard
            activities={plan.activitiesToday}
            aerobicMinutes={plan.aerobicMinutesThisWeek}
          />
          {plan.next && (
            <p className="text-[13px] font-semibold text-accent">
              {t.today.nextWorkout(plan.next.label, t.weekdayLong[plan.next.weekday])}
            </p>
          )}
        </>
      )}

      <WeekCard week={plan.week} streakWeeks={plan.streakWeeks} />

      {plan.targets && (
        <Card>
          <h2 className="font-sans label-caps">{t.today.targetsTitle}</h2>
          <div className="grid grid-cols-3 gap-2">
            <Stat value={formatNumber(plan.targets.kcal, 0)} label={t.profile.kcal} />
            <Stat value={`${plan.targets.proteinG} g`} label={t.profile.protein} />
            <Stat value={`${formatNumber(plan.targets.waterL)} L`} label={t.profile.water} />
          </div>
          <p className="text-xs text-muted">{t.today.targetsSoon}</p>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Link
          to="/program"
          className="flex min-h-12 items-center justify-center rounded-[14px] border border-gold-line bg-gold-bg text-sm font-bold text-gold"
        >
          {t.today.suggestionLink}
        </Link>
      )}
    </div>
  );
}
