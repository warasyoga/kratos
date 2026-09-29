import {
  addDays,
  daysBetween,
  startOfWeek,
  WEEKDAYS,
  weekdayOf,
  type Weekday,
} from '../common/weekday';

export type DayStatus = 'done' | 'missed' | 'today' | 'upcoming' | 'recovery';

export interface WeekDayView {
  weekday: Weekday;
  date: string;
  /** Label hari latihan (mis. "Upper A"); kosong = hari pemulihan. */
  label?: string;
  status: DayStatus;
}

export interface ScheduledDay {
  programDayId: string;
  label: string;
  weekday: Weekday;
}

export interface FinishedSessionRef {
  programDayId: string;
  logDate: string;
}

/**
 * Status tujuh hari minggu berjalan. Hari latihan dianggap selesai jika sesinya selesai
 * kapan pun dalam minggu yang sama (latihan yang dipindah hari tetap dihitung).
 * docs/fitur/02-hari-ini.md
 */
export function weekOverview(
  schedule: readonly ScheduledDay[],
  finished: readonly FinishedSessionRef[],
  today: string,
): WeekDayView[] {
  const monday = startOfWeek(today);
  const sunday = addDays(monday, 6);
  const doneThisWeek = new Set(
    finished.filter((s) => s.logDate >= monday && s.logDate <= sunday).map((s) => s.programDayId),
  );

  return WEEKDAYS.map((weekday, i) => {
    const date = addDays(monday, i);
    const day = schedule.find((d) => d.weekday === weekday);
    if (!day) return { weekday, date, status: 'recovery' };
    const status: DayStatus = doneThisWeek.has(day.programDayId)
      ? 'done'
      : date === today
        ? 'today'
        : date < today
          ? 'missed'
          : 'upcoming';
    return { weekday, date, label: day.label, status };
  });
}

/**
 * Latihan terjadwal minggu ini yang terlewat dan belum dikerjakan (paling awal lebih dulu),
 * untuk ditawarkan dikerjakan hari ini.
 */
export function missedDays(
  schedule: readonly ScheduledDay[],
  finished: readonly FinishedSessionRef[],
  today: string,
) {
  const byWeekday = new Map(schedule.map((d) => [d.weekday, d]));
  return weekOverview(schedule, finished, today)
    .filter((d) => d.status === 'missed')
    .flatMap((d) => {
      const day = byWeekday.get(d.weekday);
      return day ? [day] : [];
    });
}

/**
 * Streak: jumlah minggu berturut-turut dengan semua sesi terjadwal selesai.
 * Minggu berjalan dihitung jika sudah lengkap; jika belum, hitung mundur dari minggu lalu.
 * Tidak menghitung minggu sebelum sesi pertama.
 */
export function streakWeeks(
  finished: readonly FinishedSessionRef[],
  sessionsPerWeek: number,
  today: string,
): number {
  if (finished.length === 0 || sessionsPerWeek <= 0) return 0;
  const firstWeek = startOfWeek([...finished].map((s) => s.logDate).sort()[0] as string);
  const countIn = (monday: string) => {
    const sunday = addDays(monday, 6);
    return finished.filter((s) => s.logDate >= monday && s.logDate <= sunday).length;
  };

  let monday = startOfWeek(today);
  if (countIn(monday) < sessionsPerWeek) monday = addDays(monday, -7);
  let streak = 0;
  while (daysBetween(firstWeek, monday) >= 0 && countIn(monday) >= sessionsPerWeek) {
    streak++;
    monday = addDays(monday, -7);
  }
  return streak;
}

/** Hari latihan berikutnya setelah hari ini (berputar ke minggu depan). */
export function nextScheduledDay(
  schedule: readonly ScheduledDay[],
  today: string,
): ScheduledDay | undefined {
  const order = WEEKDAYS.indexOf(weekdayOf(today));
  return [...schedule]
    .map((d) => ({ d, distance: (WEEKDAYS.indexOf(d.weekday) - order + 7) % 7 }))
    .filter((x) => x.distance > 0)
    .sort((a, b) => a.distance - b.distance)[0]?.d;
}
