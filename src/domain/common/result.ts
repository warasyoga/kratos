/**
 * Hasil operasi yang bisa gagal secara wajar (input tidak valid, data tidak ditemukan).
 * Kesalahan tak terduga (bug) tetap dilempar sebagai exception.
 */
export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };

export interface AppError {
  /** Kode stabil untuk dicocokkan di kode, mis. 'session_not_found'. */
  code: string;
  /** Penjelasan untuk pengembang; teks untuk pengguna diambil dari i18n berdasarkan `code`. */
  message: string;
  /** Kesalahan per kolom input: path → kode pesan i18n, mis. { heightCm: 'height_range' }. */
  fields?: Record<string, string>;
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}
