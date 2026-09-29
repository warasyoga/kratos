import type { AppDeps } from '@/application/deps';
import { createServices, type Services } from '@/application/services';
import { systemClock } from '@/infrastructure/clock';
import { KratosDatabase } from '@/infrastructure/db/database';
import { ensureCatalog } from '@/infrastructure/db/seed';
import { requestPersistentStorage } from '@/infrastructure/platform';
import {
  DexieActivityRepository,
  DexieBodyMetricRepository,
  DexieCheckInRepository,
  DexieExerciseRepository,
  DexieGymRepository,
  DexieHealthConditionRepository,
  DexieProfileRepository,
  DexieProgramRepository,
  DexieSessionRepository,
  DexieSuggestionRepository,
  DexieTransactionRunner,
} from '@/infrastructure/repositories/dexieRepositories';

/**
 * Composition root: satu-satunya tempat yang merakit infrastructure + application.
 * Membuka database dan memastikan perpustakaan gerakan terpasang sebelum UI tampil.
 */
export async function createAppServices(): Promise<Services> {
  const db = new KratosDatabase();
  await ensureCatalog(db);

  const deps: AppDeps = {
    clock: systemClock,
    newId: () => crypto.randomUUID(),
    profiles: new DexieProfileRepository(db),
    conditions: new DexieHealthConditionRepository(db),
    gym: new DexieGymRepository(db),
    exercises: new DexieExerciseRepository(db),
    programs: new DexieProgramRepository(db),
    bodyMetrics: new DexieBodyMetricRepository(db),
    suggestions: new DexieSuggestionRepository(db),
    checkIns: new DexieCheckInRepository(db),
    sessions: new DexieSessionRepository(db),
    activities: new DexieActivityRepository(db),
    tx: new DexieTransactionRunner(db),
    platform: { requestPersistentStorage },
  };
  return createServices(deps);
}
