import type { BodyArea, Equipment } from '../profile/types';
import type { Exercise, LoadType, MovementPattern, Muscle } from './types';

export const CUSTOM_ID_PREFIX = 'custom-';

/** Pola gerakan satu sendi (isolasi). Selebihnya dianggap gerakan majemuk. */
const ISOLATION_PATTERNS: readonly MovementPattern[] = [
  'elbow_flexion',
  'elbow_extension',
  'shoulder_abduction',
  'knee_flexion',
  'knee_extension',
  'calf',
  'core',
];

const SHOULDERS: BodyArea[] = ['shoulder_left', 'shoulder_right'];
const KNEES: BodyArea[] = ['knee_left', 'knee_right'];

/**
 * Area tubuh yang terbebani per pola gerakan, agar gerakan buatan pengguna tetap
 * disesuaikan dengan kondisi kesehatan (sama dengan pola di katalog bawaan).
 */
const STRESSED_AREAS: Record<MovementPattern, BodyArea[]> = {
  horizontal_push: [...SHOULDERS, 'wrist'],
  vertical_push: [...SHOULDERS, 'wrist', 'lower_back'],
  horizontal_pull: [...SHOULDERS, 'elbow', 'lower_back'],
  vertical_pull: [...SHOULDERS, 'elbow'],
  squat: [...KNEES, 'hip', 'lower_back'],
  hinge: ['lower_back', 'hip'],
  lunge: [...KNEES, 'hip'],
  knee_flexion: KNEES,
  knee_extension: KNEES,
  elbow_flexion: ['elbow', 'wrist'],
  elbow_extension: ['elbow'],
  shoulder_abduction: SHOULDERS,
  calf: ['ankle'],
  core: ['lower_back'],
};

export interface CustomExerciseInput {
  name: string;
  pattern: MovementPattern;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipment: Equipment[];
  loadType: LoadType;
  measure: Exercise['measure'];
}

/** Gerakan buatan pengguna: tingkat kesulitan 1, mekanik & area tubuh dari pola gerakan. */
export function buildCustomExercise(id: string, input: CustomExerciseInput): Exercise {
  const primary = [...new Set(input.primaryMuscles)];
  return {
    id,
    name: input.name,
    pattern: input.pattern,
    mechanics: ISOLATION_PATTERNS.includes(input.pattern) ? 'isolation' : 'compound',
    equipment: [...new Set(input.equipment)],
    primaryMuscles: primary,
    secondaryMuscles: [...new Set(input.secondaryMuscles)].filter((m) => !primary.includes(m)),
    loadType: input.loadType,
    measure: input.measure,
    difficulty: 1,
    stressedAreas: STRESSED_AREAS[input.pattern],
    isCustom: true,
  };
}
