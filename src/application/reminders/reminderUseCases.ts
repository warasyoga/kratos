import { z } from 'zod/mini';
import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import {
  buildWorkoutCalendar,
  calendarSignature,
  type CalendarWorkout,
  type ReminderSettings,
} from '@/domain/reminders/reminders';
import type { AppDeps } from '../deps';
import { makeGetActiveProgram } from '../program/getActiveProgram';
import { validate } from '../validation';

const CALENDAR_UID_DOMAIN = 'kratos-aris.netlify.app';
const CALENDAR_FILE_NAME = 'kratos-jadwal-latihan.ics';

const patchSchema = z.partial(
  z.object({
    workoutTime: z.string().check(z.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'time_invalid' })),
    restTimerNotify: z.boolean(),
    waterNotify: z.boolean(),
  }),
);

export interface ReminderView {
  settings: ReminderSettings;
  /** File kalender pernah dibuat tetapi jadwal/jam sudah berubah sejak itu. */
  calendarOutdated: boolean;
}

export interface CalendarText {
  calendarName: string;
  summary: (label: string) => string;
  alarm: string;
}

/** Pengaturan pengingat dan file kalender jadwal latihan. docs/fitur/10-pengingat.md */
export function makeReminderUseCases(deps: AppDeps) {
  const getProgram = makeGetActiveProgram(deps);

  async function workouts(): Promise<CalendarWorkout[]> {
    const program = await getProgram();
    return (program?.days ?? []).map((d) => ({
      id: d.day.id,
      label: d.day.label,
      weekday: d.day.weekday,
      durationMinutes: d.estimatedMinutes,
    }));
  }

  return {
    async get(): Promise<ReminderView> {
      const [settings, list] = await Promise.all([deps.reminders.get(), workouts()]);
      const current = calendarSignature(list, settings.workoutTime);
      return {
        settings,
        calendarOutdated:
          settings.calendarSignature !== undefined && settings.calendarSignature !== current,
      };
    },

    async update(raw: unknown): Promise<Result<void>> {
      const parsed = validate(patchSchema, raw);
      if (!parsed.ok) return parsed;
      const current = await deps.reminders.get();
      const patch = Object.fromEntries(
        Object.entries(parsed.value).filter(([, v]) => v !== undefined),
      );
      await deps.reminders.save({ ...current, ...patch });
      return ok(undefined);
    },

    /** Buat file .ics dan catat jadwal saat ini sebagai sudah diekspor. */
    async calendarFile(text: CalendarText): Promise<Result<{ fileName: string; content: string }>> {
      const [settings, list] = await Promise.all([deps.reminders.get(), workouts()]);
      if (list.length === 0) return err({ code: 'not_found', message: 'Program belum ada' });
      const now = deps.clock.now();
      const content = buildWorkoutCalendar({
        workouts: list,
        time: settings.workoutTime,
        today: toLocalDate(now),
        now,
        uidDomain: CALENDAR_UID_DOMAIN,
        text,
      });
      await deps.reminders.save({
        ...settings,
        calendarSignature: calendarSignature(list, settings.workoutTime),
      });
      return ok({ fileName: CALENDAR_FILE_NAME, content });
    },
  };
}
