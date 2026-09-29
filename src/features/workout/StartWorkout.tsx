import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import { toLocalDate } from '@/domain/common/clock';
import { weekdayOf } from '@/domain/common/weekday';
import { t } from '@/shared/i18n/id';
import { tCheckIn } from '@/shared/i18n/workout';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Chip, type ChipTone } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { ToggleChip } from '@/shared/ui/ToggleChip';
import { CheckInSheet } from './components/CheckInSheet';
import { useCheckInToday, useProgramForWorkout, useWorkoutAction } from './hooks/useWorkout';

const TONE: Record<'green' | 'yellow' | 'red', ChipTone> = {
  green: 'good',
  yellow: 'warn',
  red: 'bad',
};

/** Sebelum latihan: check-in lalu mulai sesi hari ini (atau hari lain). */
export function StartWorkout() {
  const services = useServices();
  const { data: program } = useProgramForWorkout();
  const { data: checkIn } = useCheckInToday();
  const { run, pending } = useWorkoutAction();
  const [checkingIn, setCheckingIn] = useState(false);
  const [ignoreReadiness, setIgnore] = useState(false);

  const weekday = weekdayOf(toLocalDate(services.clock.now()));
  const today = program?.days.find((d) => d.day.weekday === weekday);
  const others = program?.days.filter((d) => d !== today) ?? [];
  const start = (programDayId: string) =>
    void run(() => services.workout.start({ programDayId, ignoreReadiness }));

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader title={t.workout.title} />

      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans label-caps">{tCheckIn.title}</h2>
          {checkIn && (
            <Chip tone={TONE[checkIn.readiness]}>{tCheckIn.readinessChip[checkIn.readiness]}</Chip>
          )}
        </div>
        {checkIn ? (
          <>
            <p className="text-sm">{tCheckIn.readiness[checkIn.readiness]}</p>
            {checkIn.readiness !== 'green' && (
              <ToggleChip
                label={tCheckIn.ignore}
                pressed={ignoreReadiness}
                onToggle={() => setIgnore((v) => !v)}
              />
            )}
          </>
        ) : (
          <Button variant="ghost" onClick={() => setCheckingIn(true)}>
            {tCheckIn.open}
          </Button>
        )}
      </Card>

      {today ? (
        <Card>
          <h2 className="font-sans label-caps">{t.workout.todayWorkout}</h2>
          <p className="font-display text-[40px] leading-[0.9] font-bold uppercase">
            {today.day.label}
          </p>
          <p className="text-[13px] text-muted">
            {t.today.workoutMeta(today.exercises.length, today.estimatedMinutes)}
          </p>
          <Button fullWidth disabled={pending} onClick={() => start(today.day.id)}>
            {t.workout.start}
          </Button>
        </Card>
      ) : (
        <p className="text-muted">{t.workout.noWorkoutToday}</p>
      )}

      {others.length > 0 && (
        <Card>
          <h2 className="font-sans label-caps">{t.workout.otherDays}</h2>
          <div className="grid grid-cols-2 gap-2">
            {others.map((d) => (
              <Button
                key={d.day.id}
                variant="ghost"
                disabled={pending}
                onClick={() => start(d.day.id)}
              >
                {t.workout.startDay(d.day.label)}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {checkingIn && <CheckInSheet onClose={() => setCheckingIn(false)} />}
    </div>
  );
}
