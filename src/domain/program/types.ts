import type { Weekday } from '../common/weekday';

export interface Program {
  id: string;
  name: string;
  templateId: string;
  startDate: string;
  mesocycleWeeks: number;
  active: boolean;
  createdAt: number;
}

export interface ProgramDay {
  id: string;
  programId: string;
  label: string;
  weekday: Weekday;
  order: number;
}

export type SubstitutionReason = 'health' | 'equipment' | 'user' | 'stagnation';

export interface ProgramExercise {
  id: string;
  programDayId: string;
  exerciseId: string;
  order: number;
  sets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
  restSec: number;
  /** null = belum dikalibrasi (sesi pertama menentukan beban). */
  currentWeightKg: number | null;
  substitutedFrom?: string;
  substitutionReason?: SubstitutionReason;
  /** true = beban tidak naik otomatis (kondisi kesehatan tingkat sedang). */
  progressionLocked: boolean;
}

/** Target set & repetisi satu gerakan. */
export interface Prescription {
  sets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
}
