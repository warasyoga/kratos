/**
 * Port penyimpanan. Domain dan application hanya mengenal interface ini;
 * implementasinya (Dexie/IndexedDB) ada di src/infrastructure/repositories.
 * Lihat docs/03-arsitektur.md dan ADR-002.
 */
import type { UnlockedAchievement } from './achievements/rules';
import type { BodyMetric } from './body/types';
import type { Exercise, ExerciseGuide } from './exercise/types';
import type { NutritionLog, SavedMeal, WaterLog } from './nutrition/intake';
import type { Equipment, HealthCondition, PlateInventory, UserProfile } from './profile/types';
import type { ProgramBundle, ProgramExercise } from './program/types';
import type { ProgressPhoto } from './progress/photo';
import type { ReminderSettings } from './reminders/reminders';
import type { ActivityLog } from './today/activity';
import type {
  CheckIn,
  Readiness,
  SetLog,
  SetResult,
  WorkingSetRecord,
  WorkoutSession,
} from './workout/types';

export type { BodyMetric, ProgramBundle };

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
  /** Simpan gerakan buatan pengguna; catatan (opsional) jadi langkah panduannya. */
  saveCustom(exercise: Exercise, note?: string): Promise<void>;
  removeCustom(id: string): Promise<void>;
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

export interface BodyMetricRepository {
  add(metric: BodyMetric): Promise<void>;
  remove(id: string): Promise<void>;
  /** Semua catatan, urut tanggal lalu waktu dicatat. */
  list(): Promise<BodyMetric[]>;
  latestWeightKg(): Promise<number | null>;
}

export interface CheckInRepository {
  getByDate(logDate: string): Promise<CheckIn | null>;
  /** Check-in sejak tanggal tertentu (rata-rata tidur untuk saran). */
  listSince(fromDate: string): Promise<CheckIn[]>;
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
  /** Semua set kerja yang selesai dari sesi selesai sejak tanggal tertentu (grafik progres). */
  workingSetsSince(fromDate: string): Promise<WorkingSetRecord[]>;
}

export interface ActivityRepository {
  listSince(fromDate: string): Promise<ActivityLog[]>;
  add(log: ActivityLog): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface NutritionRepository {
  /** Catatan makan sejak tanggal tertentu, urut waktu dicatat. */
  listFoodsSince(fromDate: string): Promise<NutritionLog[]>;
  saveFood(log: NutritionLog): Promise<void>;
  removeFood(id: string): Promise<void>;
  listWaterSince(fromDate: string): Promise<WaterLog[]>;
  addWater(log: WaterLog): Promise<void>;
  removeWater(id: string): Promise<void>;
  listMeals(): Promise<SavedMeal[]>;
  saveMeal(meal: SavedMeal): Promise<void>;
  removeMeal(id: string): Promise<void>;
}

export interface ReminderRepository {
  get(): Promise<ReminderSettings>;
  save(settings: ReminderSettings): Promise<void>;
}

export interface AchievementRepository {
  list(): Promise<UnlockedAchievement[]>;
  add(record: UnlockedAchievement): Promise<void>;
}

export interface PhotoRepository {
  /** Semua foto, terbaru lebih dulu. */
  list(): Promise<ProgressPhoto[]>;
  add(photo: ProgressPhoto): Promise<void>;
  remove(id: string): Promise<void>;
}

/** Jalankan beberapa operasi repository sebagai satu transaksi (semua berhasil atau semua batal). */
export interface TransactionRunner {
  run<T>(work: () => Promise<T>): Promise<T>;
}
