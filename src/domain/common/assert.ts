/**
 * Validasi argumen fungsi domain. Input pengguna sudah divalidasi Zod di tepi aplikasi,
 * jadi pelanggaran di sini berarti bug dan dilempar sebagai RangeError.
 */
export function assertPositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} harus > 0, diterima ${value}`);
  }
}

export function assertInRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} harus ${min}–${max}, diterima ${value}`);
  }
}

/** Pembulatan ke kelipatan terdekat, mis. roundTo(2877.3, 10) = 2880. */
export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
