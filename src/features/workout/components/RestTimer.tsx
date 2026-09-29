import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import type { SetLog } from '@/domain/workout/types';
import { t } from '@/shared/i18n/id';
import { formatClock, useNow, vibrate } from '@/shared/lib/device';
import { showNotification } from '@/shared/lib/notifications';
import { useWorkoutAction } from '../hooks/useWorkout';

/**
 * Timer istirahat dari `restEndsAt` (waktu absolut), sehingga tetap tepat setelah layar mati
 * atau aplikasi di latar. HP bergetar saat habis (Android); jika aplikasi di latar dan
 * notifikasi timer dinyalakan (Profil → Pengingat), muncul notifikasi.
 */
export function RestTimer({ set, totalSec }: { set: SetLog; totalSec: number }) {
  const { workout, clock, reminders } = useServices();
  const { data: reminderView } = useQuery({
    queryKey: queryKeys.reminders,
    queryFn: reminders.get,
  });
  const notify = reminderView?.settings.restTimerNotify ?? false;
  const { run } = useWorkoutAction();
  const now = useNow(clock.now);
  const endsAt = set.restEndsAt ?? now;
  const remainingSec = (endsAt - now) / 1000;
  const running = remainingSec > 0;
  const buzzed = useRef<string | null>(null);

  useEffect(() => {
    if (!running && buzzed.current !== `${set.id}:${endsAt}` && now - endsAt < 5000) {
      buzzed.current = `${set.id}:${endsAt}`;
      vibrate([200, 100, 200]);
      if (notify && document.visibilityState === 'hidden')
        void showNotification(t.reminders.restDoneTitle, t.reminders.restDoneBody, 'kratos-rest');
    }
  }, [running, now, endsAt, set.id, notify]);

  // Tampil selama istirahat dan 5 detik setelahnya.
  if (!running && now - endsAt > 5000) return null;
  const progress = Math.min(1, Math.max(0, 1 - remainingSec / totalSec));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-20 flex justify-center px-4">
      <div
        role="timer"
        aria-label={t.workout.rest}
        className="pointer-events-auto flex w-full max-w-[528px] items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-ground shadow-float"
      >
        <span className="font-display text-[40px] leading-none font-bold tabular-nums">
          {running ? formatClock(remainingSec) : '0:00'}
        </span>
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs opacity-80">
            {running ? t.workout.rest : t.workout.restDone}
          </span>
          <span className="h-1.5 overflow-hidden rounded-full bg-muted/40">
            <span
              className="block h-full rounded-full bg-plate-yellow"
              style={{ width: `${progress * 100}%` }}
            />
          </span>
          {running && (
            <span className="flex gap-1.5">
              {(
                [
                  [t.workout.restMinus, { deltaSec: -15 }],
                  [t.workout.restPlus, { deltaSec: 15 }],
                  [t.workout.restSkip, { skip: true }],
                ] as const
              ).map(([label, change]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => void run(() => workout.sets.adjustRest(set.id, change))}
                  className="min-h-9 rounded-lg bg-muted/30 px-2.5 text-xs font-bold"
                >
                  {label}
                </button>
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
