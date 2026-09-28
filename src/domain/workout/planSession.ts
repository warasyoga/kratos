import { isLoaded, type Exercise } from '../exercise/types';
import type { BodyArea, PlateInventory } from '../profile/types';
import type { ProgramExercise } from '../program/types';
import { scaleLoad } from '../strength/loads';
import type { LoadDecision } from '../strength/progression';
import { DELOAD, READINESS_ADJUSTMENT } from '../standards';
import type { Readiness } from './types';
import { generateWarmupSets, needsWarmup, type WarmupSet } from './warmup';

export type SessionAdjustment = 'none' | 'reduced' | 'light' | 'deload';

export interface PlannedExercise {
  programExerciseId: string;
  exercise: Exercise;
  sets: number;
  targetReps: number;
  repMin: number;
  repMax: number;
  targetRir: number;
  restSec: number;
  /** null = belum dikalibrasi; sesi ini menentukan beban. */
  weightKg: number | null;
  warmupSets: WarmupSet[];
  /** Gerakan membebani area yang terasa nyeri hari ini; tawarkan pengganti. */
  painFlag: boolean;
}

export interface PlanSessionInput {
  items: readonly {
    programExercise: ProgramExercise;
    exercise: Exercise;
    /** Keputusan progresi dari sesi sebelumnya; kosong jika belum ada riwayat. */
    decision?: LoadDecision;
  }[];
  readiness: Readiness;
  isDeloadWeek: boolean;
  painAreas: readonly BodyArea[];
  inventory: PlateInventory;
}

export interface SessionPlan {
  adjustment: SessionAdjustment;
  exercises: PlannedExercise[];
}

const reducedSets = (sets: number) =>
  Math.max(
    Math.min(sets, READINESS_ADJUSTMENT.yellow.minSets),
    sets - READINESS_ADJUSTMENT.yellow.setsReduction,
  );
const halvedSets = (sets: number, factor: number) => Math.max(1, Math.ceil(sets * factor));

/**
 * Rencana sesi hari ini: beban dari progresi, lalu penyesuaian deload atau readiness,
 * set pemanasan, dan tanda nyeri. docs/mesin-trainer/03-autoregulasi-checkin.md, 06-deload.md
 */
export function planSession(input: PlanSessionInput): SessionPlan {
  const adjustment: SessionAdjustment = input.isDeloadWeek
    ? 'deload'
    : input.readiness === 'red'
      ? 'light'
      : input.readiness === 'yellow'
        ? 'reduced'
        : 'none';

  const earlier: Exercise[] = [];
  const exercises = input.items.map(({ programExercise: pe, exercise, decision }) => {
    let weightKg = decision?.weightKg ?? pe.currentWeightKg;
    let sets = pe.sets;
    let targetRir = pe.targetRir;

    if (adjustment === 'deload') {
      // Beban deload sudah dihitung oleh decideNextLoad; set dan RIR disesuaikan di sini.
      sets = halvedSets(pe.sets, DELOAD.setsFactor);
      targetRir = DELOAD.targetRir;
    } else if (adjustment === 'reduced') {
      sets = reducedSets(pe.sets);
      targetRir = pe.targetRir + READINESS_ADJUSTMENT.yellow.rirIncrease;
    } else if (adjustment === 'light') {
      const red = READINESS_ADJUSTMENT.red;
      sets = halvedSets(pe.sets, red.setsFactor);
      targetRir = red.targetRir;
      if (weightKg !== null && isLoaded(exercise)) {
        weightKg = scaleLoad(exercise, weightKg, red.loadFactor, input.inventory, 'down');
      }
    }

    const warmupSets =
      weightKg !== null && needsWarmup(exercise, earlier)
        ? generateWarmupSets(exercise, weightKg, input.inventory)
        : [];
    earlier.push(exercise);

    return {
      programExerciseId: pe.id,
      exercise,
      sets,
      targetReps: decision?.targetReps ?? pe.repMin,
      repMin: pe.repMin,
      repMax: pe.repMax,
      targetRir,
      restSec: pe.restSec,
      weightKg,
      warmupSets,
      painFlag: exercise.stressedAreas.some((a) => input.painAreas.includes(a)),
    };
  });

  return { adjustment, exercises };
}
