import { useEffect, useRef } from 'react';
import { useServices } from '@/application/ServicesContext';
import { waterReminderDue } from '@/domain/reminders/reminders';
import { t } from '@/shared/i18n/id';
import { formatNumber } from '@/shared/lib/format';
import { showNotification } from '@/shared/lib/notifications';

const CHECK_EVERY_MS = 60_000;

/**
 * Pengingat minum air selama aplikasi terbuka (docs/fitur/10-pengingat.md):
 * dicek tiap menit, hanya jika dinyalakan dan izin notifikasi diberikan.
 */
export function ReminderWatcher() {
  const { reminders, nutrition, clock } = useServices();
  const lastNotifiedAt = useRef<number | null>(null);

  useEffect(() => {
    const check = async () => {
      const { settings } = await reminders.get();
      if (!settings.waterNotify) return;
      const day = await nutrition.day();
      if (!day) return;
      const now = clock.now();
      const due = waterReminderDue({
        now,
        hour: new Date(now).getHours(),
        lastWaterAt: day.water.at(-1)?.createdAt ?? null,
        lastNotifiedAt: lastNotifiedAt.current,
        intakeMl: day.intake.waterMl,
        targetMl: day.targets.waterMl,
      });
      if (!due) return;
      const shown = await showNotification(
        t.reminders.waterTitle,
        t.reminders.waterBody(
          formatNumber(day.intake.waterMl, 0),
          formatNumber(day.targets.waterMl, 0),
        ),
        'kratos-water',
      );
      if (shown) lastNotifiedAt.current = now;
    };
    const timer = setInterval(() => void check(), CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [reminders, nutrition, clock]);

  return null;
}
