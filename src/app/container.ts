import type { AppDeps } from '@/application/deps';
import { createServices, type Services } from '@/application/services';
import { systemClock } from '@/infrastructure/clock';
import { KratosDatabase } from '@/infrastructure/db/database';
import { ensureCatalog } from '@/infrastructure/db/seed';
import { DexieBackupRepository } from '@/infrastructure/backup/dexieBackupRepository';
import { packZip, unpackZip } from '@/infrastructure/backup/zipArchive';
import { resizeImage } from '@/infrastructure/image';
import { requestPersistentStorage } from '@/infrastructure/platform';
import { CatalogReadyExerciseRepository } from '@/infrastructure/repositories/catalogReadyExerciseRepository';
import {
  DexieAchievementRepository,
  DexieActivityRepository,
  DexieBodyMetricRepository,
  DexieCheckInRepository,
  DexieExerciseRepository,
  DexieGymRepository,
  DexieHealthConditionRepository,
  DexieNutritionRepository,
  DexiePhotoRepository,
  DexieReminderRepository,
  DexieProfileRepository,
  DexieProgramRepository,
  DexieSessionRepository,
  DexieSuggestionRepository,
  DexieTransactionRunner,
} from '@/infrastructure/repositories/dexieRepositories';

/**
 * Composition root: satu-satunya tempat yang merakit infrastructure + application.
 * Membuka database lalu UI langsung tampil; katalog gerakan bawaan dipasang di latar
 * (query gerakan menunggu pemasangan selesai).
 */
export async function createAppServices(): Promise<Services> {
  const db = new KratosDatabase();
  // Gagal membuka (mis. mode privat tanpa IndexedDB) → pesan di main.tsx.
  await db.open();
  const catalogReady = ensureCatalog(db);

  const deps: AppDeps = {
    clock: systemClock,
    newId: () => crypto.randomUUID(),
    profiles: new DexieProfileRepository(db),
    conditions: new DexieHealthConditionRepository(db),
    gym: new DexieGymRepository(db),
    exercises: new CatalogReadyExerciseRepository(new DexieExerciseRepository(db), catalogReady),
    programs: new DexieProgramRepository(db),
    bodyMetrics: new DexieBodyMetricRepository(db),
    suggestions: new DexieSuggestionRepository(db),
    checkIns: new DexieCheckInRepository(db),
    sessions: new DexieSessionRepository(db),
    activities: new DexieActivityRepository(db),
    photos: new DexiePhotoRepository(db),
    nutrition: new DexieNutritionRepository(db),
    achievements: new DexieAchievementRepository(db),
    reminders: new DexieReminderRepository(db),
    backup: new DexieBackupRepository(db),
    archive: { pack: packZip, unpack: unpackZip },
    tx: new DexieTransactionRunner(db),
    platform: { requestPersistentStorage, resizeImage },
  };
  return createServices(deps);
}
