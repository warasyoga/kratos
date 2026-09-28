/**
 * Format angka dan tanggal untuk tampilan (locale id-ID).
 * Semua angka yang tampil ke pengguna wajib lewat modul ini.
 */
const LOCALE = 'id-ID';

export function formatNumber(value: number, maxFractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: maxFractionDigits }).format(value);
}

export function formatKg(value: number): string {
  return `${formatNumber(value, 2)} kg`;
}

/** Tanggal kalender `YYYY-MM-DD` diurai sebagai tanggal lokal (bukan UTC). */
export function parseLocalDate(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new RangeError(`Format tanggal harus YYYY-MM-DD: ${isoDate}`);
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/** "Senin, 28 September" */
export function formatDayDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseLocalDate(isoDate));
}
