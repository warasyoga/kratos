/**
 * Port penyimpanan. Domain dan application hanya mengenal interface ini;
 * implementasinya (Dexie/IndexedDB) ada di src/infrastructure/repositories.
 * Lihat docs/03-arsitektur.md dan ADR-002.
 */
import type { Exercise, ExerciseGuide } from './exercise/types';
import type { Equipment, HealthCondition, PlateInventory, UserProfile } from './profile/types';
import type { ProgramBundle, ProgramExercise } from './program/types';
import type { ActivityLog } from './today/activity';
import type { CheckIn, Readiness, SetLog, SetResult, WorkoutSession } from './workout/types';

export type { ProgramBundle };

export interface ProfileRepository {
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}

export interface HealthConditionRepository {
  list(): Promise<HealthCondition[]>;
  save(condition: HealthCondition): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface GymRepository {
  /** Alat yang tersedia di gym pengguna. */
  getEquipment(): Promise<Equipment[]>;
  setEquipment(equipment: readonly Equipment[]): Promise<void>;
  getInventory(): Promise<PlateInventory>;
  setInventory(inventory: PlateInventory): Promise<void>;
}

export interface ExerciseRepository {
  list(): Promise<Exercise[]>;
  get(id: string): Promise<Exercise | null>;
  getGuide(id: string): Promise<ExerciseGuide | null>;
}

export interface ProgramRepository {
  getActive(): Promise<ProgramBundle | null>;
  /** Simpan program baru sebagai program aktif; program lama dinonaktifkan (riwayat tetap). */
  saveAsActive(bundle: ProgramBundle): Promise<void>;
  saveExercises(exercises: readonly ProgramExercise[]): Promise<void>;
  /** Simpan perubahan hari & gerakan program yang sudah ada; gerakan yang tidak ada lagi dihapus. */
  update(bundle: ProgramBundle): Promise<void>;
}

/** Saran yang sudah diterapkan atau diabaikan (untuk jeda 14 hari). */
export interface ResolvedSuggestion {
  id: string;
  programId: string;
  ruleId: string;
  targetKey: string;
  status: 'applied' | 'dismissed';
  resolvedAt: number;
}

export interface SuggestionRepository {
  listResolved(): Promise<ResolvedSuggestion[]>;
  save(record: ResolvedSuggestion): Promise<void>;
}

export interface BodyMetric {
  id: string;
  logDate: string;
  weightKg?: number;
  neckCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
  createdAt: number;
}

export interface BodyMetricRepository {
  add(metric: BodyMetric): Promise<void>;
  latestWeightKg(): Promise<number | null>;
}

export interface CheckInRepository {
  getByDate(logDate: string): Promise<CheckIn | null>;
  /** Satu check-in per tanggal: menyimpan ulang menimpa. */
  save(checkIn: CheckIn): Promise<void>;
}

/** Set kerja yang selesai dari satu sesi selesai, untuk progresi dan kolom "Sebelumnya". */
export interface ExerciseHistoryEntry {
  sessionId: string;
  logDate: string;
  readiness: Readiness;
  sets: SetResult[];
}

export interface SessionRepository {
  getActive(): Promise<WorkoutSession | null>;
  get(id: string): Promise<WorkoutSession | null>;
  save(session: WorkoutSession): Promise<void>;
  /** Hapus sesi beserta semua setnya. */
  delete(id: string): Promise<void>;
  listSets(sessionId: string): Promise<SetLog[]>;
  saveSets(sets: readonly SetLog[]): Promise<void>;
  deleteSets(ids: readonly string[]): Promise<void>;
  /** Sesi selesai sejak tanggal tertentu (untuk kalender minggu dan streak). */
  listFinishedSince(fromDate: string): Promise<WorkoutSession[]>;
  /** Riwayat gerakan dari sesi yang selesai, terbaru lebih dulu. */
  exerciseHistory(exerciseId: string, limit: number): Promise<ExerciseHistoryEntry[]>;
}

export interface ActivityRepository {
  listSince(fromDate: string): Promise<ActivityLog[]>;
  add(log: ActivityLog): Promise<void>;
  remove(id: string): Promise<void>;
}

/** Jalankan beberapa operasi repository sebagai satu transaksi (semua berhasil atau semua batal). */
export interface TransactionRunner {
  run<T>(work: () => Promise<T>): Promise<T>;
}
