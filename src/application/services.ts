import type { Clock } from '@/domain/common/clock';

/**
 * Semua use case dan query yang tersedia untuk UI.
 * Implementasinya dirakit di src/app/container.ts; test bisa menyuntikkan versi palsu.
 */
export interface Services {
  clock: Clock;
}
