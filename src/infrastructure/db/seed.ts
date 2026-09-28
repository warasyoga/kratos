import { CATALOG_VERSION } from '../seed/catalogVersion';
import type { ExerciseRow, KratosDatabase } from './database';

/**
 * Pastikan perpustakaan gerakan bawaan terpasang dan terbaru.
 * Katalog (teks panduan) dimuat terpisah hanya saat perlu dipasang, agar pembukaan aplikasi tetap ringan.
 * Gerakan buatan pengguna (isCustom) tidak disentuh.
 */
export async function ensureCatalog(db: KratosDatabase): Promise<void> {
  const settings = await db.settings.get('settings');
  if (settings?.catalogVersion === CATALOG_VERSION) return;

  const { EXERCISE_CATALOG } = await import('../seed/exerciseCatalog');
  const rows: ExerciseRow[] = EXERCISE_CATALOG.map(({ exercise, guide }) => ({
    ...exercise,
    guide: { instructions: guide.instructions, commonMistakes: guide.commonMistakes },
  }));

  await db.transaction('rw', db.exercises, db.settings, async () => {
    await db.exercises.bulkPut(rows);
    await db.settings.put({ ...(settings ?? { id: 'settings' }), catalogVersion: CATALOG_VERSION });
  });
}
