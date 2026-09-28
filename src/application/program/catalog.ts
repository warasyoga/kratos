import type { Exercise, ExerciseGuide } from '@/domain/exercise/types';
import { assessHealth } from '@/domain/trainer/health';
import {
  findSubstitutes,
  whyUnavailable,
  type RejectionReason,
  type SelectionContext,
} from '@/domain/trainer/substitution';
import type { AppDeps } from '../deps';

export interface CatalogItem {
  exercise: Exercise;
  /** Kenapa tidak cocok untuk pengguna ini (alat/kesehatan/kesulitan), atau null. */
  unavailable: RejectionReason | null;
  progressionLocked: boolean;
}

export interface ExerciseDetail extends CatalogItem {
  guide: ExerciseGuide | null;
  alternatives: Exercise[];
}

export interface SubstituteOption {
  exercise: Exercise;
  progressionLocked: boolean;
}

/** Perpustakaan gerakan dengan status ketersediaan untuk pengguna ini. docs/fitur/06-perpustakaan-gerakan.md */
export function makeCatalogUseCases(deps: AppDeps) {
  async function selection(): Promise<SelectionContext> {
    const [library, equipment, conditions, profile] = await Promise.all([
      deps.exercises.list(),
      deps.gym.getEquipment(),
      deps.conditions.list(),
      deps.profiles.get(),
    ]);
    return {
      library,
      availableEquipment: equipment,
      conditions,
      experience: profile?.experience ?? 'beginner',
    };
  }

  const toItem = (exercise: Exercise, ctx: SelectionContext): CatalogItem => ({
    exercise,
    unavailable: whyUnavailable(exercise, ctx),
    progressionLocked: assessHealth(exercise, ctx.conditions) === 'locked',
  });

  return {
    exercises: () => deps.exercises.list(),

    async list(): Promise<CatalogItem[]> {
      const ctx = await selection();
      return ctx.library
        .map((e) => toItem(e, ctx))
        .sort((a, b) => a.exercise.name.localeCompare(b.exercise.name));
    },

    async detail(exerciseId: string): Promise<ExerciseDetail | null> {
      const ctx = await selection();
      const exercise = ctx.library.find((e) => e.id === exerciseId);
      if (!exercise) return null;
      return {
        ...toItem(exercise, ctx),
        guide: await deps.exercises.getGuide(exerciseId),
        alternatives: findSubstitutes(exercise, ctx).results.map((r) => r.exercise),
      };
    },

    /** Pengganti untuk satu gerakan program (tidak termasuk gerakan lain di hari yang sama). */
    async substitutesFor(programExerciseId: string): Promise<SubstituteOption[]> {
      const [ctx, bundle] = await Promise.all([selection(), deps.programs.getActive()]);
      const pe = bundle?.exercises.find((e) => e.id === programExerciseId);
      const current = pe && ctx.library.find((e) => e.id === pe.exerciseId);
      if (!bundle || !pe || !current) return [];
      const excludeIds = bundle.exercises
        .filter((e) => e.programDayId === pe.programDayId)
        .map((e) => e.exerciseId);
      return findSubstitutes(current, { ...ctx, excludeIds }).results.map((r) => ({
        exercise: r.exercise,
        progressionLocked: r.progressionLocked,
      }));
    },
  };
}
