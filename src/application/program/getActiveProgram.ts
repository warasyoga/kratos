import type { Exercise } from '@/domain/exercise/types';
import type { Program, ProgramDay, ProgramExercise } from '@/domain/program/types';
import { estimateSessionMinutes } from '@/domain/workout/rest';
import type { AppDeps } from '../deps';

export interface ProgramDayView {
  day: ProgramDay;
  estimatedMinutes: number;
  totalSets: number;
  exercises: { programExercise: ProgramExercise; exercise: Exercise }[];
}

export interface ActiveProgramView {
  program: Program;
  days: ProgramDayView[];
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
    return { program: bundle.program, days };
  };
}
