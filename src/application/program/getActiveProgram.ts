import type { Exercise, Muscle } from '@/domain/exercise/types';
import type { Program, ProgramDay, ProgramExercise } from '@/domain/program/types';
import {
  classifyVolume,
  MAJOR_MUSCLES,
  weeklyFrequencyPerMuscle,
  weeklySetsPerMuscle,
  type VolumeStatus,
} from '@/domain/program/volume';
import { estimateSessionMinutes } from '@/domain/workout/rest';
import type { AppDeps } from '../deps';

export interface ProgramDayView {
  day: ProgramDay;
  estimatedMinutes: number;
  totalSets: number;
  exercises: { programExercise: ProgramExercise; exercise: Exercise }[];
}

export interface MuscleVolume {
  muscle: Muscle;
  sets: number;
  frequency: number;
  status: VolumeStatus;
}

export interface ActiveProgramView {
  program: Program;
  days: ProgramDayView[];
  /** Set per minggu untuk otot besar (zona 10–20, docs/sains-latihan/03-desain-program.md). */
  weeklyVolume: MuscleVolume[];
}

/** Program aktif beserta detail gerakan, siap ditampilkan. */
export function makeGetActiveProgram(deps: AppDeps) {
  return async function getActiveProgram(): Promise<ActiveProgramView | null> {
    const [bundle, library] = await Promise.all([deps.programs.getActive(), deps.exercises.list()]);
    if (!bundle) return null;
    const byId = new Map(library.map((e) => [e.id, e]));

    const days = bundle.days.map((day) => {
      const exercises = bundle.exercises
        .filter((pe) => pe.programDayId === day.id)
        .sort((a, b) => a.order - b.order)
        .flatMap((programExercise) => {
          const exercise = byId.get(programExercise.exerciseId);
          return exercise ? [{ programExercise, exercise }] : [];
        });
      const prescriptions = exercises.map((e) => e.programExercise);
      return {
        day,
        exercises,
        totalSets: prescriptions.reduce((n, p) => n + p.sets, 0),
        estimatedMinutes: estimateSessionMinutes(prescriptions),
      };
    });
    const entries = days.flatMap((d) =>
      d.exercises.map((e) => ({
        exercise: e.exercise,
        sets: e.programExercise.sets,
        dayKey: d.day.id,
      })),
    );
    const sets = weeklySetsPerMuscle(entries);
    const frequency = weeklyFrequencyPerMuscle(entries);
    const weeklyVolume = MAJOR_MUSCLES.map((muscle) => {
      const total = sets.get(muscle) ?? 0;
      return {
        muscle,
        sets: total,
        frequency: frequency.get(muscle) ?? 0,
        status: classifyVolume(total),
      };
    });
    return { program: bundle.program, days, weeklyVolume };
  };
}
