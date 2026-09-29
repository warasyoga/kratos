import { addDays, startOfWeek } from '../common/weekday';

export const PROGRESS_RANGES = ['4w', '12w', 'all'] as const;
export type ProgressRange = (typeof PROGRESS_RANGES)[number];

const RANGE_WEEKS = { '4w': 4, '12w': 12 } as const;

/**
 * Tanggal awal rentang grafik: Senin (n − 1) minggu sebelum minggu ini,
 * atau Senin minggu data pertama untuk 'all'.
 */
export function rangeStart(range: ProgressRange, today: string, earliest?: string): string {
  const thisWeek = startOfWeek(today);
  if (range === 'all') return earliest && earliest < today ? startOfWeek(earliest) : thisWeek;
  return addDays(thisWeek, -7 * (RANGE_WEEKS[range] - 1));
}

/** Senin setiap minggu dari minggu `from` sampai minggu `today`. */
export function weekStarts(from: string, today: string): string[] {
  const last = startOfWeek(today);
  const weeks: string[] = [];
  for (let week = startOfWeek(from); week <= last; week = addDays(week, 7)) weeks.push(week);
  return weeks;
}
