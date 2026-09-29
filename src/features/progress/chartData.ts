import { formatNumber, formatShortDate, parseLocalDate } from '@/shared/lib/format';

/** Sumbu x grafik progres = waktu (epoch ms dari tanggal kalender lokal). */
export const dayX = (isoDate: string) => parseLocalDate(isoDate).getTime();

export const formatDayX = (x: number) => formatShortDate(x);

/** "70 kg" / "66,7 kg" untuk 1RM dan berat. */
export const formatKg1 = (kg: number) => `${formatNumber(kg, 1)} kg`;

/** Label sumbu y ringkas: 1.250 → "1,3 rb". */
export function formatCompact(value: number): string {
  return value >= 1000 ? `${formatNumber(value / 1000, 1)} rb` : formatNumber(value, 0);
}
