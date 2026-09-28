import type { Weekday } from '../common/weekday';
import type { MovementPattern } from '../exercise/types';

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
/** beginner = pengalaman 0–6 bulan. */
export type Experience = 'beginner' | 'intermediate';
export type Goal = 'hypertrophy';

export type BodyArea =
  | 'shoulder_left'
  | 'shoulder_right'
  | 'elbow'
  | 'wrist'
  | 'lower_back'
  | 'upper_back'
  | 'neck'
  | 'hip'
  | 'knee_left'
  | 'knee_right'
  | 'ankle'
  | 'other';

export type Severity = 'mild' | 'moderate' | 'severe';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'squat_rack'
  | 'bench'
  | 'cable'
  | 'leg_press'
  | 'smith'
  | 'pullup_bar'
  | 'kettlebell'
  | 'hack_squat'
  | 'leg_curl'
  | 'leg_extension'
  | 'chest_press_machine'
  | 'lat_pulldown'
  | 'ez_bar'
  | 'landmine'
  | 'trap_bar';

export interface UserProfile {
  id: 'me';
  name: string;
  sex: Sex;
  birthDate: string;
  heightCm: number;
  goal: Goal;
  experience: Experience;
  activityLevel: ActivityLevel;
  trainingDays: Weekday[];
  proteinGPerKg: number;
  parqCompletedAt?: number;
  parqAllNo?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface HealthCondition {
  id: string;
  area: BodyArea;
  severity: Severity;
  /** Pola gerakan yang terasa sakit, mis. ['vertical_push']. */
  painfulMovements: MovementPattern[];
  note: string;
  active: boolean;
  createdAt: number;
}

/** Berat bar, pelat, dan dumbbell yang tersedia. Berat dumbbell = per tangan. */
export interface PlateInventory {
  barKg: number;
  platesKg: number[];
  dumbbellsKg: number[];
  machineStepKg: number;
}

/** Umur dalam tahun penuh pada tanggal tertentu. */
export function ageOn(birthDate: string, onDate: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number) as [number, number, number];
  const [y, m, d] = onDate.split('-').map(Number) as [number, number, number];
  const hadBirthday = m > bm || (m === bm && d >= bd);
  return y - by - (hadBirthday ? 0 : 1);
}
