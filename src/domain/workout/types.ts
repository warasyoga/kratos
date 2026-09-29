import type { BodyArea } from '../profile/types';
import type { PrKind } from '../strength/personalRecord';
import type { LoadDecision, LoadDecisionReason } from '../strength/progression';

/** Hasil satu set yang sudah dikerjakan. Untuk dumbbell, weightKg = berat per tangan. */
export interface SetResult {
  weightKg: number;
  /** Repetisi, atau detik untuk gerakan tahan (plank). */
  reps: number;
  /** Sisa repetisi sebelum gagal (0–5, 5 = "5+"). Kosong jika tidak diisi. */
  rir?: number | undefined;
}

/** Set kerja yang selesai dari sesi selesai, untuk grafik progres. */
export interface WorkingSetRecord extends SetResult {
  sessionId: string;
  logDate: string;
  exerciseId: string;
  /** Waktu set dicentang (untuk pemulihan otot). */
  completedAt?: number;
}

export type Readiness = 'green' | 'yellow' | 'red';

/** Set kerja satu gerakan dalam satu sesi. */
export interface ExerciseSessionResult {
  logDate: string;
  sets: SetResult[];
  readiness?: Readiness | undefined;
}

/** Check-in hari gym (docs/fitur/03-check-in.md). */
export interface CheckIn {
  id: string;
  logDate: string;
  sleepHours: number;
  soreness: number;
  energy: number;
  painAreas: BodyArea[];
  bodyWeightKg?: number;
  readiness: Readiness;
  createdAt: number;
}

/** Satu set dalam sesi. Set yang belum dicentang (completedAt kosong) adalah rencana. */
export interface SetLog extends SetResult {
  id: string;
  sessionId: string;
  exerciseId: string;
  programExerciseId: string;
  setNumber: number;
  kind: 'warmup' | 'working';
  completedAt?: number;
  restEndsAt?: number;
}

/**
 * Rencana satu gerakan untuk sesi ini, disalin saat sesi dimulai
 * agar edit program di tengah sesi baru berlaku di sesi berikutnya.
 */
export interface SessionExercisePlan {
  programExerciseId: string;
  exerciseId: string;
  order: number;
  sets: number;
  repMin: number;
  repMax: number;
  targetReps: number;
  targetRir: number;
  restSec: number;
  /** Beban sesi sebelumnya (null = gerakan baru, sesi ini kalibrasi). */
  previousWeightKg: number | null;
  decision: LoadDecisionReason | 'calibration';
  decisionKind: LoadDecision['kind'] | 'calibration';
  painFlag: boolean;
}

export type SessionAdjustment = 'none' | 'reduced' | 'light' | 'deload';

export interface WorkoutSession {
  id: string;
  programDayId: string;
  dayLabel: string;
  checkInId?: string;
  readiness: Readiness;
  logDate: string;
  startedAt: number;
  finishedAt?: number;
  status: 'active' | 'finished' | 'abandoned';
  adjustment: SessionAdjustment;
  isDeloadWeek: boolean;
  plan: SessionExercisePlan[];
  summary?: SessionSummary;
}

/** Keputusan beban sesi berikutnya untuk satu gerakan (ditampilkan di ringkasan). */
export interface NextLoad {
  exerciseId: string;
  fromKg: number | null;
  toKg: number;
  targetReps: number;
  kind: LoadDecision['kind'];
  reason: LoadDecisionReason;
}

export interface SessionPr {
  exerciseId: string;
  weightKg: number;
  reps: number;
  kinds: PrKind[];
}

export interface SessionSummary {
  durationMin: number;
  workingSets: number;
  /** Σ beban × repetisi set kerja (kg); dumbbell dihitung per tangan. */
  tonnageKg: number;
  prs: SessionPr[];
  next: NextLoad[];
}
