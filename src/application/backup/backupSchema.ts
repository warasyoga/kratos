import { z } from 'zod/mini';
import { BACKUP_APP } from '@/domain/backup/backup';

/**
 * Validasi file backup saat impor (docs/fitur/13-backup.md). Setiap baris wajib punya kolom
 * kunci dengan tipe yang benar; kolom lain dibiarkan (looseObject) agar backup dari versi skema
 * yang sama tetap terbaca utuh. File asing/rusak ditolak sebelum data apa pun diubah.
 */
const id = z.string().check(z.minLength(1));
const date = z.iso.date();
const row = <S extends z.core.$ZodLooseShape>(shape: S) => z.array(z.looseObject(shape));

export const manifestSchema = z.looseObject({
  app: z.literal(BACKUP_APP),
  schemaVersion: z.int().check(z.minimum(1)),
  exportedAt: z.number(),
});

export const dataSchema = z.object({
  profile: row({
    id: z.literal('me'),
    name: z.string(),
    sex: z.enum(['male', 'female']),
    birthDate: date,
    heightCm: z.number(),
    trainingDays: z.array(z.string()),
  }).check(z.maxLength(1)),
  healthConditions: row({ id }),
  equipment: row({ equipment: z.string(), available: z.boolean() }),
  exercises: row({
    id: z.string().check(z.startsWith('custom-')),
    name: z.string(),
    isCustom: z.literal(true),
  }),
  programs: row({ id, startDate: date }),
  programDays: row({ id, programId: id }),
  programExercises: row({ id, programDayId: id, exerciseId: id }),
  bodyMetrics: row({ id, logDate: date }),
  photos: row({ id, logDate: date, pose: z.enum(['front', 'side', 'back']) }),
  nutritionLogs: row({ id, logDate: date, kcal: z.number(), proteinG: z.number() }),
  waterLogs: row({ id, logDate: date, ml: z.number() }),
  savedMeals: row({ id, label: z.string() }),
  suggestions: row({ id }),
  achievements: row({ id, achievementId: z.string() }),
  checkIns: row({ id, logDate: date }),
  sessions: row({ id, logDate: date, status: z.enum(['active', 'finished', 'abandoned']) }),
  setLogs: row({ id, sessionId: id, exerciseId: id, weightKg: z.number(), reps: z.number() }),
  /** Ditambahkan di skema v2; backup v1 dimigrasikan dengan daftar kosong. */
  activityLogs: z._default(row({ id, logDate: date }), []),
  settings: z._default(z.looseObject({}), {}),
});
