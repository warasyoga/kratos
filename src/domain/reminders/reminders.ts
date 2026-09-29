import { addDays, WEEKDAYS, weekdayOf, type Weekday } from '../common/weekday';
import { REMINDER } from '../standards';

export interface ReminderSettings {
  /** Jam latihan 'HH:MM' (waktu lokal). */
  workoutTime: string;
  restTimerNotify: boolean;
  waterNotify: boolean;
  /** Tanda jadwal saat file kalender terakhir dibuat, untuk mendeteksi jadwal berubah. */
  calendarSignature?: string;
}

export const DEFAULT_REMINDERS: ReminderSettings = {
  workoutTime: REMINDER.defaultWorkoutTime,
  restTimerNotify: false,
  waterNotify: false,
};

export interface CalendarWorkout {
  /** ID stabil (ID hari program) agar impor ulang memperbarui, bukan menggandakan. */
  id: string;
  label: string;
  weekday: Weekday;
  durationMinutes: number;
}

const BYDAY: Record<Weekday, string> = {
  mon: 'MO',
  tue: 'TU',
  wed: 'WE',
  thu: 'TH',
  fri: 'FR',
  sat: 'SA',
  sun: 'SU',
};

/** Tanda jadwal: hari + jam. Berubah → file kalender perlu diperbarui. */
export function calendarSignature(workouts: readonly CalendarWorkout[], time: string): string {
  const days = [...workouts]
    .sort((a, b) => WEEKDAYS.indexOf(a.weekday) - WEEKDAYS.indexOf(b.weekday))
    .map((w) => `${w.weekday}:${w.id}`);
  return `${days.join(',')}@${time}`;
}

/** Teks RFC 5545: escape \\ ; , dan baris baru. */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** Lipat baris > 75 oktet (RFC 5545 §3.1): lanjutan diawali satu spasi. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const charSize = new TextEncoder().encode(char).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (size + charSize > limit) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += charSize;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const compactDate = (iso: string) => iso.replace(/-/g, '');

/** Tanggal pertama ≥ `today` yang jatuh di `weekday`. */
export function firstOccurrence(today: string, weekday: Weekday): string {
  const offset = (WEEKDAYS.indexOf(weekday) - WEEKDAYS.indexOf(weekdayOf(today)) + 7) % 7;
  return addDays(today, offset);
}

/**
 * File kalender (.ics) jadwal latihan berulang mingguan + alarm 30 menit sebelumnya.
 * Waktu "floating" (tanpa zona waktu) sehingga mengikuti zona waktu kalender HP.
 * docs/fitur/10-pengingat.md, ADR-005
 */
export function buildWorkoutCalendar(input: {
  workouts: readonly CalendarWorkout[];
  time: string;
  today: string;
  /** Epoch ms untuk DTSTAMP. */
  now: number;
  uidDomain: string;
  text: { calendarName: string; summary: (label: string) => string; alarm: string };
}): string {
  const { workouts, time, today, now, uidDomain, text } = input;
  const [hh, mm] = time.split(':');
  const stamp = new Date(now)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kratos//Pengingat Latihan//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(text.calendarName)}`,
  ];
  for (const w of workouts) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:kratos-${w.id}@${uidDomain}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${compactDate(firstOccurrence(today, w.weekday))}T${hh}${mm}00`,
      `DURATION:PT${w.durationMinutes}M`,
      `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[w.weekday]}`,
      `SUMMARY:${escapeText(text.summary(w.label))}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(text.alarm)}`,
      `TRIGGER:-PT${REMINDER.alarmMinutesBefore}M`,
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/**
 * Pengingat air saat aplikasi terbuka: jam 08.00–20.00, tiap 2 jam sejak minum/pengingat
 * terakhir, dan hanya jika target hari ini belum tercapai.
 */
export function waterReminderDue(input: {
  now: number;
  hour: number;
  lastWaterAt: number | null;
  lastNotifiedAt: number | null;
  intakeMl: number;
  targetMl: number;
}): boolean {
  const { now, hour, lastWaterAt, lastNotifiedAt, intakeMl, targetMl } = input;
  if (hour < REMINDER.waterStartHour || hour >= REMINDER.waterEndHour) return false;
  if (intakeMl >= targetMl) return false;
  const interval = REMINDER.waterEveryHours * 3_600_000;
  const last = Math.max(lastWaterAt ?? 0, lastNotifiedAt ?? 0);
  return last === 0 ? lastNotifiedAt === null : now - last >= interval;
}
