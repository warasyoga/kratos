import Dexie, { type EntityTable, type Table } from 'dexie';
import type { Exercise, ExerciseGuide } from '@/domain/exercise/types';
import type {
  Equipment,
  HealthCondition,
  PlateInventory,
  UserProfile,
} from '@/domain/profile/types';
import type { Program, ProgramDay, ProgramExercise } from '@/domain/program/types';
import type { BodyMetric, ResolvedSuggestion } from '@/domain/repositories';
import type { CheckIn, SetLog, WorkoutSession } from '@/domain/workout/types';

/** Satu baris per jenis alat. */
export interface EquipmentRow {
  equipment: Equipment;
  available: boolean;
}

/** Gerakan beserta panduannya. */
export interface ExerciseRow extends Exercise {
  guide?: Omit<ExerciseGuide, 'exerciseId'>;
}

export interface SettingsRow {
  id: 'settings';
  catalogVersion?: number;
  inventory?: PlateInventory;
  lastBackupAt?: number;
}

/**
 * Skema IndexedDB (docs/05-model-data.md). Hanya kolom yang dicari/diurutkan yang diindeks;
 * nilai boolean tidak bisa diindeks IndexedDB sehingga disaring di memori.
 * Setiap perubahan skema = versi baru + migrasi; versi lama tidak pernah diubah.
 */
export const SCHEMA_V1 = {
  profile: 'id',
  healthConditions: 'id',
  equipment: 'equipment',
  exercises: 'id, pattern',
  programs: 'id',
  programDays: 'id, programId',
  programExercises: 'id, programDayId, exerciseId',
  checkIns: 'id, &logDate',
  sessions: 'id, logDate, status, programDayId',
  setLogs: 'id, sessionId, exerciseId, completedAt, [exerciseId+completedAt]',
  bodyMetrics: 'id, logDate',
  photos: 'id, logDate, pose',
  nutritionLogs: 'id, logDate',
  waterLogs: 'id, logDate',
  savedMeals: 'id',
  suggestions: 'id, programId, status, ruleId',
  achievements: 'id, &achievementId',
  settings: 'id',
} as const;

export class KratosDatabase extends Dexie {
  profile!: EntityTable<UserProfile, 'id'>;
  healthConditions!: EntityTable<HealthCondition, 'id'>;
  equipment!: Table<EquipmentRow, Equipment>;
  exercises!: EntityTable<ExerciseRow, 'id'>;
  programs!: EntityTable<Program, 'id'>;
  programDays!: EntityTable<ProgramDay, 'id'>;
  programExercises!: EntityTable<ProgramExercise, 'id'>;
  bodyMetrics!: EntityTable<BodyMetric, 'id'>;
  suggestions!: EntityTable<ResolvedSuggestion, 'id'>;
  checkIns!: EntityTable<CheckIn, 'id'>;
  sessions!: EntityTable<WorkoutSession, 'id'>;
  setLogs!: EntityTable<SetLog, 'id'>;
  settings!: EntityTable<SettingsRow, 'id'>;

  constructor(name = 'kratos') {
    super(name);
    this.version(1).stores(SCHEMA_V1);
  }
}
