import { isLoaded, type Exercise } from '../exercise/types';
import type { PlateInventory } from '../profile/types';
import type { Prescription } from '../program/types';
import type { ExerciseSessionResult, SetResult } from '../workout/types';
import { BIG_STEP_EXTRA_REPS, DECREASE_FACTOR, DELOAD, PROGRESSION_PCT } from '../standards';
import { nextHeavierLoad, scaleLoad } from './loads';

export type LoadDecisionReason =
  | 'no_history'
  | 'deload_week'
  | 'all_sets_hit_top'
  | 'building_reps'
  | 'big_step_building_reps'
  | 'no_heavier_load'
  | 'missed_min_twice'
  | 'locked';

export interface LoadDecision {
  kind: 'increase' | 'hold' | 'decrease' | 'deload';
  weightKg: number;
  targetReps: number;
  reason: LoadDecisionReason;
}

export interface DecideNextLoadInput {
  exercise: Exercise;
  prescription: Prescription;
  currentWeightKg: number;
  /** Set kerja sesi-sesi terakhir gerakan ini, terbaru lebih dulu. */
  recentSessions: readonly ExerciseSessionResult[];
  inventory: PlateInventory;
  isDeloadWeek: boolean;
  /** Kondisi kesehatan tingkat sedang: beban tidak naik otomatis. */
  progressionLocked?: boolean;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

function averageRir(sets: readonly SetResult[], fallback: number): number {
  return sets.reduce((sum, s) => sum + (s.rir ?? fallback), 0) / sets.length;
}

function missedMinimum(session: ExerciseSessionResult, repMin: number): boolean {
  return session.sets.filter((s) => s.reps < repMin).length >= 2;
}

/**
 * Beban dan target repetisi sesi berikutnya (double progression).
 * Aturan dan tabel kasus uji: docs/mesin-trainer/02-progresi-beban.md
 */
export function decideNextLoad(input: DecideNextLoadInput): LoadDecision {
  const { exercise, prescription, currentWeightKg, inventory } = input;
  const { repMin, repMax, targetRir } = prescription;
  const hold = (targetReps: number, reason: LoadDecisionReason): LoadDecision => ({
    kind: 'hold',
    weightKg: currentWeightKg,
    targetReps,
    reason,
  });

  if (input.isDeloadWeek) {
    const weightKg = isLoaded(exercise)
      ? scaleLoad(exercise, currentWeightKg, DELOAD.loadFactor, inventory, 'down')
      : currentWeightKg;
    return { kind: 'deload', weightKg, targetReps: repMin, reason: 'deload_week' };
  }

  // Sesi ringan karena readiness merah tidak dipakai untuk menilai progres.
  const sessions = input.recentSessions.filter((s) => s.readiness !== 'red' && s.sets.length > 0);
  const last = sessions[0];
  if (!last) return hold(repMin, 'no_history');

  const previous = sessions[1];
  if (
    previous &&
    isLoaded(exercise) &&
    missedMinimum(last, repMin) &&
    missedMinimum(previous, repMin)
  ) {
    const weightKg = scaleLoad(exercise, currentWeightKg, DECREASE_FACTOR, inventory, 'down');
    if (weightKg < currentWeightKg) {
      return { kind: 'decrease', weightKg, targetReps: repMin, reason: 'missed_min_twice' };
    }
  }

  const lowestReps = Math.min(...last.sets.map((s) => s.reps));
  const buildingTarget = clamp(lowestReps + 1, repMin, repMax);
  if (input.progressionLocked) return hold(buildingTarget, 'locked');

  const completedAllSets = last.sets.length >= prescription.sets;
  const hitTop = completedAllSets && lowestReps >= repMax && averageRir(last.sets, targetRir) >= 1;
  if (!hitTop) return hold(buildingTarget, 'building_reps');

  const heavier = isLoaded(exercise) ? nextHeavierLoad(exercise, currentWeightKg, inventory) : null;
  if (!heavier) return hold(repMax, 'no_heavier_load');

  if (heavier.stepPct <= PROGRESSION_PCT.max + 1e-9) {
    return {
      kind: 'increase',
      weightKg: heavier.weightKg,
      targetReps: repMin,
      reason: 'all_sets_hit_top',
    };
  }

  // Langkah > 10% (mis. dumbbell ringan): kejar repetisi ekstra dulu sebelum naik.
  const bigStepTarget = repMax + BIG_STEP_EXTRA_REPS;
  if (lowestReps >= bigStepTarget) {
    return {
      kind: 'increase',
      weightKg: heavier.weightKg,
      targetReps: repMin,
      reason: 'all_sets_hit_top',
    };
  }
  return hold(bigStepTarget, 'big_step_building_reps');
}
