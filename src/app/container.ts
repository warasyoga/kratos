import type { Services } from '@/application/services';
import { systemClock } from '@/infrastructure/clock';

/**
 * Composition root: satu-satunya tempat yang merakit infrastructure + application.
 * Repository Dexie dan use case ditambahkan di sini mulai Tahap 3.
 */
export function createServices(): Services {
  return {
    clock: systemClock,
  };
}
