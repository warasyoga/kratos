import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { errorMessage, errorText, t } from '@/shared/i18n/id';
import { cn } from '@/shared/lib/cn';
import {
  downloadTextFile,
  notificationPermission,
  requestNotificationPermission,
  type NotifyPermission,
} from '@/shared/lib/notifications';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { TextField } from '@/shared/ui/TextField';
import { useToast } from '@/shared/ui/toastContext';

type Toggle = 'restTimerNotify' | 'waterNotify';

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-12 w-full items-center gap-3 text-left"
    >
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs leading-snug text-muted">{hint}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-1 size-5 rounded-full bg-surface transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </span>
    </button>
  );
}

/** Profil → Pengingat: kalender HP (.ics) dan notifikasi dalam aplikasi. docs/fitur/10-pengingat.md */
export function ReminderCard() {
  const { reminders } = useServices();
  const client = useQueryClient();
  const toast = useToast();
  const { data } = useQuery({ queryKey: queryKeys.reminders, queryFn: reminders.get });
  const [permission, setPermission] = useState<NotifyPermission>(notificationPermission);
  const [timeError, setTimeError] = useState<string>();
  if (!data) return null;
  const { settings, calendarOutdated } = data;

  const refresh = () => client.invalidateQueries({ queryKey: queryKeys.reminders });

  const setTime = async (workoutTime: string) => {
    const result = await reminders.update({ workoutTime });
    setTimeError(result.ok ? undefined : result.error.fields?.workoutTime);
    await refresh();
  };

  const toggle = async (key: Toggle, on: boolean) => {
    // Izin diminta hanya saat pengguna menyalakan (bukan saat aplikasi dibuka).
    if (on) {
      const granted = await requestNotificationPermission();
      setPermission(granted);
      if (granted !== 'granted') return;
    }
    await reminders.update({ [key]: on });
    await refresh();
  };

  const exportCalendar = async () => {
    const result = await reminders.calendarFile({
      calendarName: t.reminders.calendarName,
      summary: t.reminders.calendarSummary,
      alarm: t.reminders.calendarAlarm,
    });
    if (!result.ok) {
      toast(errorMessage(result.error.code));
      return;
    }
    downloadTextFile(result.value.fileName, 'text/calendar;charset=utf-8', result.value.content);
    toast(t.reminders.calendarSaved);
    await refresh();
  };

  return (
    <Card>
      <h2 className="font-sans label-caps">{t.reminders.title}</h2>
      <TextField
        id="reminder-time"
        type="time"
        label={t.reminders.workoutTime}
        value={settings.workoutTime}
        onChange={(e) => void setTime(e.target.value)}
        error={errorText(timeError)}
      />
      {calendarOutdated && (
        <p className="rounded-[14px] bg-warn-bg px-3.5 py-2.5 text-[13px] text-warn">
          {t.reminders.calendarOutdated}
        </p>
      )}
      <Button variant="ghost" onClick={() => void exportCalendar()}>
        <CalendarPlus className="size-5" aria-hidden />
        {t.reminders.addToCalendar}
      </Button>
      <p className="text-xs text-muted">{t.reminders.calendarHint}</p>

      <div className="flex flex-col divide-y divide-line border-t border-line">
        <Switch
          label={t.reminders.restTimer}
          hint={t.reminders.restTimerHint}
          checked={settings.restTimerNotify && permission === 'granted'}
          onChange={(on) => void toggle('restTimerNotify', on)}
        />
        <Switch
          label={t.reminders.water}
          hint={t.reminders.waterHint}
          checked={settings.waterNotify && permission === 'granted'}
          onChange={(on) => void toggle('waterNotify', on)}
        />
      </div>
      {permission === 'denied' && <p className="text-xs text-warn">{t.reminders.denied}</p>}
      {permission === 'unsupported' && (
        <p className="text-xs text-muted">{t.reminders.unsupported}</p>
      )}
      <p className="text-xs text-muted">{t.reminders.limitation}</p>
    </Card>
  );
}
