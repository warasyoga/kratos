import type { z } from 'zod';
import { err, ok, type Result } from '@/domain/common/result';

/**
 * Validasi input dari luar (form, file impor) dengan Zod.
 * Pesan error berupa kode i18n per kolom, mis. { heightCm: 'height_range' }.
 */
export function validate<S extends z.ZodType>(schema: S, input: unknown): Result<z.infer<S>> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return ok(parsed.data);

  const fields: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path.join('.') || '_';
    fields[path] ??= issue.message;
  }
  return err({ code: 'validation_failed', message: 'Input tidak valid', fields });
}
