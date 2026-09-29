import type { BackupData } from '@/domain/backup/backup';
import type { ProgressPhoto } from '@/domain/progress/photo';
import type { BackupRepository } from '@/domain/repositories';
import type { KratosDatabase } from '../db/database';

/**
 * Backup & pemulihan seluruh data pengguna. Gerakan bawaan dan versi katalog tidak ikut:
 * keduanya berasal dari katalog aplikasi. docs/fitur/13-backup.md
 */
export class DexieBackupRepository implements BackupRepository {
  constructor(private readonly db: KratosDatabase) {}

  async dump(): Promise<{ data: BackupData; photos: ProgressPhoto[] }> {
    const { db } = this;
    const photos = await db.photos.toArray();
    const settings = await db.settings.get('settings');
    const data: BackupData = {
      profile: await db.profile.toArray(),
      healthConditions: await db.healthConditions.toArray(),
      equipment: await db.equipment.toArray(),
      exercises: (await db.exercises.toArray()).filter((e) => e.isCustom),
      programs: await db.programs.toArray(),
      programDays: await db.programDays.toArray(),
      programExercises: await db.programExercises.toArray(),
      bodyMetrics: await db.bodyMetrics.toArray(),
      photos: photos.map(({ blob: _blob, thumb: _thumb, ...meta }) => meta),
      nutritionLogs: await db.nutritionLogs.toArray(),
      waterLogs: await db.waterLogs.toArray(),
      savedMeals: await db.savedMeals.toArray(),
      suggestions: await db.suggestions.toArray(),
      achievements: await db.achievements.toArray(),
      checkIns: await db.checkIns.toArray(),
      sessions: await db.sessions.toArray(),
      setLogs: await db.setLogs.toArray(),
      activityLogs: await db.activityLogs.toArray(),
      settings: {
        ...(settings?.inventory && { inventory: settings.inventory }),
        ...(settings?.reminders && { reminders: settings.reminders }),
        ...(settings?.lastBackupAt !== undefined && { lastBackupAt: settings.lastBackupAt }),
      },
    };
    return { data, photos };
  }

  /** Ganti semua data dalam satu transaksi: gagal di tengah → data lama utuh. */
  async restore(data: BackupData, photos: readonly ProgressPhoto[]): Promise<void> {
    const { db } = this;
    await db.transaction('rw', db.tables, async () => {
      const replace = async <T>(
        table: { clear(): Promise<void>; bulkPut(rows: T[]): Promise<unknown> },
        rows: readonly T[],
      ) => {
        await table.clear();
        await table.bulkPut([...rows]);
      };
      await replace(db.profile, data.profile);
      await replace(db.healthConditions, data.healthConditions);
      await replace(db.equipment, data.equipment);
      await replace(db.programs, data.programs);
      await replace(db.programDays, data.programDays);
      await replace(db.programExercises, data.programExercises);
      await replace(db.bodyMetrics, data.bodyMetrics);
      await replace(db.photos, photos);
      await replace(db.nutritionLogs, data.nutritionLogs);
      await replace(db.waterLogs, data.waterLogs);
      await replace(db.savedMeals, data.savedMeals);
      await replace(db.suggestions, data.suggestions);
      await replace(db.achievements, data.achievements);
      await replace(db.checkIns, data.checkIns);
      await replace(db.sessions, data.sessions);
      await replace(db.setLogs, data.setLogs);
      await replace(db.activityLogs, data.activityLogs);

      // Gerakan bawaan tetap; gerakan buatan pengguna diganti.
      const custom = (await db.exercises.toArray()).filter((e) => e.isCustom).map((e) => e.id);
      await db.exercises.bulkDelete(custom);
      await db.exercises.bulkPut([...data.exercises]);

      const current = (await db.settings.get('settings')) ?? { id: 'settings' as const };
      await db.settings.put({
        id: 'settings',
        ...(current.catalogVersion !== undefined && { catalogVersion: current.catalogVersion }),
        ...data.settings,
      });
    });
  }

  async lastBackupAt(): Promise<number | null> {
    return (await this.db.settings.get('settings'))?.lastBackupAt ?? null;
  }

  async markBackedUp(at: number): Promise<void> {
    const settings = (await this.db.settings.get('settings')) ?? { id: 'settings' as const };
    await this.db.settings.put({ ...settings, lastBackupAt: at });
  }
}
