export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** Urutkan hari Senin → Minggu. */
export function sortWeekdays(days: readonly Weekday[]): Weekday[] {
  return [...days].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
}

/** Hari berikutnya dalam minggu (Minggu → Senin). */
export function nextWeekday(day: Weekday): Weekday {
  return WEEKDAYS[(WEEKDAYS.indexOf(day) + 1) % WEEKDAYS.length] as Weekday;
}

/** Hari dari tanggal kalender `YYYY-MM-DD`. */
export function weekdayOf(isoDate: string): Weekday {
  const [y, m, d] = isoDate.split('-').map(Number) as [number, number, number];
  const jsDay = new Date(y, m - 1, d).getDay(); // 0 = Minggu
  return WEEKDAYS[(jsDay + 6) % 7] as Weekday;
}

/** Selisih hari kalender antara dua tanggal `YYYY-MM-DD` (b − a). */
export function daysBetween(a: string, b: string): number {
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

/** Tambah n hari ke tanggal `YYYY-MM-DD`. */
export function addDays(isoDate: string, n: number): string {
  const [y, m, d] = isoDate.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d + n));
  return date.toISOString().slice(0, 10);
}
