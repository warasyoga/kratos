import type { UnlockedAchievement } from '../achievements/rules';
import type { BodyMetric } from '../body/types';
import type { Exercise, ExerciseGuide } from '../exercise/types';
import type { NutritionLog, SavedMeal, WaterLog } from '../nutrition/intake';
import type { Equipment, HealthCondition, PlateInventory, UserProfile } from '../profile/types';
import type { Program, ProgramDay, ProgramExercise } from '../program/types';
import type { ProgressPhoto } from '../progress/photo';
import type { ReminderSettings } from '../reminders/reminders';
import type { ActivityLog } from '../today/activity';
import type { CheckIn, SetLog, WorkoutSession } from '../workout/types';

/**
 * Format backup .zip (docs/fitur/13-backup.md). Versi = versi skema database.
 * Backup versi lebih lama dimigrasikan saat impor; versi lebih baru ditolak.
 */
export const BACKUP_APP = 'kratos';
export const BACKUP_SCHEMA_VERSION = 2;

export type PhotoMeta = Omit<ProgressPhoto, 'blob' | 'thumb'>;

/** Gerakan buatan pengguna beserta panduannya (gerakan bawaan tidak ikut: berasal dari katalog). */
export type CustomExerciseRow = Exercise & { guide?: Omit<ExerciseGuide, 'exerciseId'> };

export interface ResolvedSuggestionRow {
  id: string;
  programId: string;
  ruleId: string;
  targetKey: string;
  status: 'applied' | 'dismissed';
  resolvedAt: number;
}

/** Semua data pengguna kecuali isi foto (foto disimpan sebagai file terpisah di zip). */
export interface BackupData {
  profile: UserProfile[];
  healthConditions: HealthCondition[];
  equipment: { equipment: Equipment; available: boolean }[];
  exercises: CustomExerciseRow[];
  programs: Program[];
  programDays: ProgramDay[];
  programExercises: ProgramExercise[];
  bodyMetrics: BodyMetric[];
  photos: PhotoMeta[];
  nutritionLogs: NutritionLog[];
  waterLogs: WaterLog[];
  savedMeals: SavedMeal[];
  suggestions: ResolvedSuggestionRow[];
  achievements: UnlockedAchievement[];
  checkIns: CheckIn[];
  sessions: WorkoutSession[];
  setLogs: SetLog[];
  activityLogs: ActivityLog[];
  settings: { inventory?: PlateInventory; reminders?: ReminderSettings; lastBackupAt?: number };
}

export type BackupTable = Exclude<keyof BackupData, 'settings'>;

export const BACKUP_TABLES: readonly BackupTable[] = [
  'profile',
  'healthConditions',
  'equipment',
  'exercises',
  'programs',
  'programDays',
  'programExercises',
  'bodyMetrics',
  'photos',
  'nutritionLogs',
  'waterLogs',
  'savedMeals',
  'suggestions',
  'achievements',
  'checkIns',
  'sessions',
  'setLogs',
  'activityLogs',
];

export interface BackupManifest {
  app: typeof BACKUP_APP;
  schemaVersion: number;
  exportedAt: number;
  counts: Record<BackupTable, number>;
}

export const backupFileName = (date: string) => `kratos-backup-${date}.zip`;
export const photoPath = (id: string, kind: 'full' | 'thumb') =>
  `photos/${id}${kind === 'thumb' ? '-thumb' : ''}.jpg`;

export function countRows(data: BackupData): Record<BackupTable, number> {
  return Object.fromEntries(BACKUP_TABLES.map((t) => [t, data[t].length])) as Record<
    BackupTable,
    number
  >;
}

/** Ringkasan untuk pratinjau impor: jumlah sesi, rentang tanggal, jumlah foto. */
export function summarizeBackup(data: BackupData): {
  sessions: number;
  firstDate: string | null;
  lastDate: string | null;
  photos: number;
  profileName: string | null;
} {
  const finished = data.sessions.filter((s) => s.status === 'finished').map((s) => s.logDate);
  const dates = [...finished, ...data.bodyMetrics.map((m) => m.logDate)].sort();
  return {
    sessions: finished.length,
    firstDate: dates[0] ?? null,
    lastDate: dates.at(-1) ?? null,
    photos: data.photos.length,
    profileName: data.profile[0]?.name ?? null,
  };
}

/**
 * CSV untuk Excel/Sheets berlocale Indonesia: pemisah titik koma, BOM UTF-8,
 * kolom berisi ; " atau baris baru diberi tanda kutip (RFC 4180).
 */
/** Penanda UTF-8 agar Excel membaca huruf dengan benar. */
const BOM = String.fromCharCode(0xfeff);

export function toCsv(rows: readonly (readonly string[])[]): string {
  const cell = (value: string) =>
    /[;"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  return `${BOM}${rows.map((r) => r.map(cell).join(';')).join('\r\n')}\r\n`;
}
