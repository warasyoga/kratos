/**
 * Port penyimpanan. Domain dan application hanya mengenal interface ini;
 * implementasinya (Dexie/IndexedDB) ada di src/infrastructure/repositories.
 * Lihat docs/03-arsitektur.md dan ADR-002.
 */
import type { Exercise, ExerciseGuide } from './exercise/types';
import type { Equipment, HealthCondition, PlateInventory, UserProfile } from './profile/types';
import type { Program, ProgramDay, ProgramExercise } from './program/types';

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

export interface ProgramBundle {
  program: Program;
  days: ProgramDay[];
  exercises: ProgramExercise[];
}

export interface ProgramRepository {
  getActive(): Promise<ProgramBundle | null>;
  /** Simpan program baru sebagai program aktif; program lama dinonaktifkan (riwayat tetap). */
  saveAsActive(bundle: ProgramBundle): Promise<void>;
  saveExercises(exercises: readonly ProgramExercise[]): Promise<void>;
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

/** Jalankan beberapa operasi repository sebagai satu transaksi (semua berhasil atau semua batal). */
export interface TransactionRunner {
  run<T>(work: () => Promise<T>): Promise<T>;
}
