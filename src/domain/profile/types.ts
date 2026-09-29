import type { Weekday } from '../common/weekday';
import type { MovementPattern } from '../exercise/types';

export const SEXES = ['male', 'female'] as const;
export type Sex = (typeof SEXES)[number];
export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'very', 'extra'] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
/** beginner = pengalaman 0–6 bulan. */
export const EXPERIENCES = ['beginner', 'intermediate'] as const;
export type Experience = (typeof EXPERIENCES)[number];
export type Goal = 'hypertrophy';

export const BODY_AREAS = [
  'shoulder_left',
  'shoulder_right',
  'elbow',
  'wrist',
  'lower_back',
  'upper_back',
  'neck',
  'hip',
  'knee_left',
  'knee_right',
  'ankle',
  'other',
] as const;
export type BodyArea = (typeof BODY_AREAS)[number];

export const SEVERITIES = ['mild', 'moderate', 'severe'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'squat_rack',
  'bench',
  'cable',
  'leg_press',
  'smith',
  'pullup_bar',
  'kettlebell',
  'hack_squat',
  'leg_curl',
  'leg_extension',
  'chest_press_machine',
  'lat_pulldown',
  'ez_bar',
  'landmine',
  'trap_bar',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

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
  /** Koreksi target kalori dari kalibrasi tren berat (kkal, ± CALORIE_ADJUSTMENT_MAX_KCAL). */
  calorieAdjustmentKcal?: number;
  /** Waktu koreksi kalori terakhir diterapkan (kalibrasi berikutnya ≥ 14 hari setelahnya). */
  calorieAdjustedAt?: number;
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
