/**
 * Sumber waktu yang disuntikkan. Domain dan use case tidak memanggil Date.now() langsung,
 * sehingga test bisa memakai waktu tetap.
 */
export interface Clock {
  /** Waktu saat ini dalam epoch ms. */
  now(): number;
}

/** Jam dengan waktu tetap, untuk test dan pratinjau. */
export function createFixedClock(at: string | number): Clock {
  const ms = typeof at === 'number' ? at : new Date(at).getTime();
  if (Number.isNaN(ms)) throw new RangeError(`Waktu tidak valid: ${String(at)}`);
  return { now: () => ms };
}

/** Tanggal kalender lokal `YYYY-MM-DD` dari epoch ms. */
export function toLocalDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
