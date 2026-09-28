/** Hasil satu set yang sudah dikerjakan. Untuk dumbbell, weightKg = berat per tangan. */
export interface SetResult {
  weightKg: number;
  reps: number;
  /** Sisa repetisi sebelum gagal (0–4, 4 = "4+"). Kosong jika tidak diisi. */
  rir?: number;
}

export type Readiness = 'green' | 'yellow' | 'red';

/** Set kerja satu gerakan dalam satu sesi. */
export interface ExerciseSessionResult {
  logDate: string;
  sets: SetResult[];
  readiness?: Readiness;
}

export interface SetLog extends SetResult {
  id: string;
  sessionId: string;
  exerciseId: string;
  programExerciseId?: string;
  setNumber: number;
  kind: 'warmup' | 'working';
  completedAt?: number;
  restEndsAt?: number;
}

export interface WorkoutSession {
  id: string;
  programDayId: string;
  checkInId?: string;
  logDate: string;
  startedAt: number;
  finishedAt?: number;
  status: 'active' | 'finished' | 'abandoned';
  adjustment: 'none' | 'reduced' | 'light';
  isDeloadWeek: boolean;
  notes?: string;
}
