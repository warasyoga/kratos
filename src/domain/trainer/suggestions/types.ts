import type { Weekday } from '../../common/weekday';
import type { Exercise } from '../../exercise/types';
import type { CalorieAdjustment } from '../../nutrition/recalibration';
import type { ProgramDay, ProgramExercise } from '../../program/types';
import type { SelectionContext } from '../substitution';

export type SuggestionCategory = 'safety' | 'program' | 'nutrition' | 'other';

export type SuggestionAction =
  | { kind: 'add_sets'; programExerciseId: string; sets: number }
  | { kind: 'remove_sets'; programExerciseId: string; sets: number }
  | {
      kind: 'add_exercise';
      programDayId: string;
      exerciseId: string;
      sets: number;
      repMin: number;
      repMax: number;
    }
  | { kind: 'swap_exercise'; programExerciseId: string; exerciseId: string }
  | { kind: 'move_day'; programDayId: string; weekday: Weekday }
  | { kind: 'start_deload' }
  | { kind: 'regenerate_program'; trainingDays: Weekday[] }
  | { kind: 'set_calorie_offset'; deltaKcal: number }
  | { kind: 'open_screen'; screen: 'parq' | 'backup' };

/**
 * Saran yang dihasilkan aturan. Teks untuk pengguna disusun UI dari `ruleId` + `params`
 * (lihat i18n), sehingga domain tidak menyimpan kalimat.
 */
export interface SuggestionDraft {
  ruleId: string;
  /** Sasaran saran, mis. nama otot atau ID gerakan program. Kunci untuk jeda setelah diabaikan. */
  targetKey: string;
  category: SuggestionCategory;
  params: Record<string, string | number>;
  action?: SuggestionAction;
}

export type ProgramExerciseWithDetail = ProgramExercise & { exercise: Exercise };

/** Semua data yang dibutuhkan aturan. Data opsional yang kosong membuat aturan terkait dilewati. */
export interface SuggestionContext {
  now: number;
  days: readonly ProgramDay[];
  exercises: readonly ProgramExerciseWithDetail[];
  selection: Omit<SelectionContext, 'excludeIds'>;
  trainingDays: readonly Weekday[];
  isDeloadWeek: boolean;
  /** Per ProgramExercise.id: 1RM estimasi terbaik tiap sesi, urut kronologis. */
  e1rmHistory?: Readonly<Record<string, readonly number[]>>;
  earlyDeloadSuggested?: boolean;
  attendance?: { scheduled: number; completed: number };
  protein?: { targetG: number; dailyG: readonly number[] };
  sleepHours?: readonly number[];
  calorieAdjustment?: CalorieAdjustment;
  aerobicMinutesLastWeek?: number;
  parqCompletedAt?: number | null;
  /** Waktu backup terakhir, atau waktu profil dibuat jika belum pernah backup. */
  backupReferenceAt?: number;
}

export interface SuggestionRule {
  id: string;
  category: SuggestionCategory;
  evaluate(ctx: SuggestionContext): SuggestionDraft[];
}
