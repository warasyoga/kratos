import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { toLocalDate } from '@/domain/common/clock';
import { WEEKDAYS, weekdayOf } from '@/domain/common/weekday';
import { t } from '@/shared/i18n/id';
import { formatDayDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

const PREVIEW_COUNT = 3;

/** Tahap 3: latihan hari ini dari program. Check-in, nutrisi, dan streak: Tahap 5–6. */
export function TodayScreen() {
  const services = useServices();
  const { data: program } = useQuery({
    queryKey: queryKeys.activeProgram,
    queryFn: services.program.getActive,
  });
  const today = toLocalDate(services.clock.now());
  const weekday = weekdayOf(today);
  const todayView = program?.days.find((d) => d.day.weekday === weekday);

  // Latihan berikutnya: hari gym pertama setelah hari ini (berputar ke minggu depan).
  const order = WEEKDAYS.indexOf(weekday);
  const next = program?.days
    .map((d) => ({ d, distance: (WEEKDAYS.indexOf(d.day.weekday) - order + 7) % 7 }))
    .filter((x) => x.distance > 0)
    .sort((a, b) => a.distance - b.distance)[0]?.d;

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader
        eyebrow={formatDayDate(today)}
        title={todayView ? t.today.gymDay : t.today.recoveryDay}
      />

      {todayView ? (
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-sans label-caps">{t.today.title}</h2>
            <Chip>
              {t.today.workoutMeta(todayView.exercises.length, todayView.estimatedMinutes)}
            </Chip>
          </div>
          <p className="font-display text-[40px] leading-[0.9] font-bold uppercase">
            {todayView.day.label}
          </p>
          <ul className="flex flex-col divide-y divide-line">
            {todayView.exercises
              .slice(0, PREVIEW_COUNT)
              .map(({ programExercise: pe, exercise }) => (
                <li key={pe.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
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
            {todayView.exercises.length > PREVIEW_COUNT && (
              <li className="py-2.5 text-[13px] text-muted">
                {t.today.moreExercises(todayView.exercises.length - PREVIEW_COUNT)}
              </li>
            )}
          </ul>
          <Button fullWidth disabled>
            {t.nav.workout}
          </Button>
          <p className="text-center text-xs text-muted">{t.today.workoutComingSoon}</p>
        </Card>
      ) : (
        <Card>
          <p>{t.today.recoveryBody}</p>
          {next && (
            <p className="text-[13px] font-semibold text-accent">
              {t.today.nextWorkout(next.day.label, t.weekdayLong[next.day.weekday])}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
