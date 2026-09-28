import type { IdGenerator } from '../common/id';
import { isLoaded } from '../exercise/types';
import type { PlateInventory } from '../profile/types';
import { startingLoad } from '../strength/calibration';
import type { LoadDecision } from '../strength/progression';
import { REST_SEC } from '../standards';
import type { SessionPlan } from './planSession';
import type { Readiness, SessionExercisePlan, SetLog, WorkoutSession } from './types';

export interface BuildSessionInput {
  sessionId: string;
  programDayId: string;
  dayLabel: string;
  logDate: string;
  startedAt: number;
  readiness: Readiness;
  checkInId?: string | undefined;
  isDeloadWeek: boolean;
  plan: SessionPlan;
  /** Keputusan progresi per ProgramExercise.id (kosong = belum ada riwayat). */
  decisions: ReadonlyMap<string, LoadDecision>;
  /** Beban tersimpan per ProgramExercise.id sebelum sesi ini (null = belum dikalibrasi). */
  previousWeights: ReadonlyMap<string, number | null>;
  inventory: PlateInventory;
  newId: IdGenerator;
}

/** Istirahat setelah set pemanasan (lebih singkat dari set kerja). */
export const WARMUP_REST_SEC = REST_SEC.isolation;

/**
 * Susun sesi aktif: salinan rencana per gerakan + semua set (pemanasan & kerja) yang siap dicentang.
 * Gerakan tanpa beban tersimpan (kalibrasi) dimulai dari beban awal yang aman.
 */
export function buildSession(input: BuildSessionInput): {
  session: WorkoutSession;
  sets: SetLog[];
} {
  const sets: SetLog[] = [];
  const plan: SessionExercisePlan[] = input.plan.exercises.map((planned, order) => {
    const calibrating = planned.weightKg === null && isLoaded(planned.exercise);
    const workingKg = planned.weightKg ?? startingLoad(planned.exercise, input.inventory);
    const decision = input.decisions.get(planned.programExerciseId);
    const base = {
      sessionId: input.sessionId,
      exerciseId: planned.exercise.id,
      programExerciseId: planned.programExerciseId,
    };

    planned.warmupSets.forEach((w, i) =>
      sets.push({
        ...base,
        id: input.newId(),
        kind: 'warmup',
        setNumber: i + 1,
        weightKg: w.weightKg,
        reps: w.reps,
      }),
    );
    for (let i = 0; i < planned.sets; i++) {
      sets.push({
        ...base,
        id: input.newId(),
        kind: 'working',
        setNumber: i + 1,
        weightKg: workingKg,
        reps: planned.targetReps,
      });
    }

    return {
      programExerciseId: planned.programExerciseId,
      exerciseId: planned.exercise.id,
      order,
      sets: planned.sets,
      repMin: planned.repMin,
      repMax: planned.repMax,
      targetReps: planned.targetReps,
      targetRir: planned.targetRir,
      restSec: planned.restSec,
      previousWeightKg: input.previousWeights.get(planned.programExerciseId) ?? null,
      decision: calibrating ? 'calibration' : (decision?.reason ?? 'no_history'),
      decisionKind: calibrating ? 'calibration' : (decision?.kind ?? 'hold'),
      painFlag: planned.painFlag,
    };
  });

  const session: WorkoutSession = {
    id: input.sessionId,
    programDayId: input.programDayId,
    dayLabel: input.dayLabel,
    ...(input.checkInId && { checkInId: input.checkInId }),
    readiness: input.readiness,
    logDate: input.logDate,
    startedAt: input.startedAt,
    status: 'active',
    adjustment: input.plan.adjustment,
    isDeloadWeek: input.isDeloadWeek,
    plan,
  };
  return { session, sets };
}
