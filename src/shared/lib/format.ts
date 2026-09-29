/**
 * Format angka dan tanggal untuk tampilan (locale id-ID).
 * Semua angka yang tampil ke pengguna wajib lewat modul ini.
 */
const LOCALE = 'id-ID';

export function formatNumber(value: number, maxFractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: maxFractionDigits }).format(value);
}

/** Jumlah desimal tetap: formatFixed(2, 1) → "2,0". */
export function formatFixed(value: number, digits: number): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
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

/** "28 Sep" untuk label sumbu grafik dan daftar. Menerima `YYYY-MM-DD` atau epoch ms. */
export function formatShortDate(date: string | number): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' }).format(
    typeof date === 'string' ? parseLocalDate(date) : new Date(date),
  );
}

/** Angka bertanda untuk perubahan: "+1,2", "−0,5", "0". */
export function formatSigned(value: number, maxFractionDigits = 1): string {
  const text = formatNumber(Math.abs(value), maxFractionDigits);
  if (text === '0') return '0';
  return `${value > 0 ? '+' : '−'}${text}`;
}

/** Angka dari input pengguna, koma atau titik desimal. Kosong → undefined, tidak valid → NaN. */
export function parseDecimal(text: string): number | undefined {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') return undefined;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : Number.NaN;
}
