import type { BodyArea, Equipment } from '../profile/types';

export const MOVEMENT_PATTERNS = [
  'horizontal_push',
  'vertical_push',
  'horizontal_pull',
  'vertical_pull',
  'squat',
  'hinge',
  'lunge',
  'knee_flexion',
  'knee_extension',
  'elbow_flexion',
  'elbow_extension',
  'shoulder_abduction',
  'calf',
  'core',
] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export type Muscle =
  | 'chest'
  | 'back_lats'
  | 'back_upper'
  | 'shoulder_front'
  | 'shoulder_side'
  | 'shoulder_rear'
  | 'biceps'
  | 'triceps'
  | 'forearm'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs';

export type LoadType = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';

export interface Exercise {
  /** Slug stabil, mis. 'barbell-bench-press'. */
  id: string;
  name: string;
  pattern: MovementPattern;
  mechanics: 'compound' | 'isolation';
  /** Semua alat ini harus tersedia. */
  equipment: Equipment[];
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  loadType: LoadType;
  /** 'seconds' untuk gerakan tahan seperti plank. */
  measure: 'reps' | 'seconds';
  /** 1 = ramah pemula, 3 = butuh teknik matang. */
  difficulty: 1 | 2 | 3;
  /** Area tubuh yang terbebani, untuk menyesuaikan dengan kondisi kesehatan. */
  stressedAreas: BodyArea[];
  isCustom: boolean;
}

/** Panduan gerakan untuk pengguna (bahasa Indonesia). Disimpan terpisah dari data latihan. */
export interface ExerciseGuide {
  exerciseId: string;
  /** Langkah melakukan gerakan, berurutan. */
  instructions: string[];
  commonMistakes: string[];
}

const LOWER_BODY_PATTERNS: readonly MovementPattern[] = ['squat', 'hinge', 'lunge'];

/** Gerakan kaki berat mendapat langkah beban lebih besar. */
export function isLowerBodyCompound(exercise: Exercise): boolean {
  return exercise.mechanics === 'compound' && LOWER_BODY_PATTERNS.includes(exercise.pattern);
}

/** Beban eksternal dicatat (dan 1RM bisa diestimasi). */
export function isLoaded(exercise: Exercise): boolean {
  return exercise.loadType !== 'bodyweight' && exercise.measure === 'reps';
}
