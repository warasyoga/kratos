import { z } from 'zod/mini';
import { err, ok, type Result } from '@/domain/common/result';
import { WEEKDAYS, type Weekday } from '@/domain/common/weekday';
import type { Exercise } from '@/domain/exercise/types';
import { applyProgramEdit, trainingDaysOf, type ProgramEdit } from '@/domain/program/editProgram';
import type { ProgramBundle, SubstitutionReason } from '@/domain/program/types';
import type { AppDeps } from '../deps';
import { validate } from '../validation';

const prescriptionPatchSchema = z.partial(
  z.object({
    sets: z.number({ error: 'number_required' }),
    repMin: z.number({ error: 'number_required' }),
    repMax: z.number({ error: 'number_required' }),
    targetRir: z.number({ error: 'number_required' }),
    restSec: z.number({ error: 'number_required' }),
  }),
);

const weekdaySchema = z.enum(WEEKDAYS);

interface EditInputs {
  bundle: ProgramBundle;
  exerciseById: (id: string) => Exercise | undefined;
}

const missing = (what: string) => err({ code: 'not_found', message: `${what} tidak ditemukan` });

/**
 * Semua edit program oleh pengguna (dan saran trainer), dengan satu langkah undo.
 * Undo disimpan di memori selama aplikasi terbuka; cukup untuk toast "Urungkan".
 * docs/fitur/04-program.md
 */
export function createProgramEditor(deps: AppDeps) {
  let undoSnapshot: ProgramBundle | null = null;

  async function saveBundle(bundle: ProgramBundle, syncDays: boolean) {
    const profile = await deps.profiles.get();
    await deps.tx.run(async () => {
      await deps.programs.update(bundle);
      if (syncDays && profile) {
        await deps.profiles.save({
          ...profile,
          trainingDays: trainingDaysOf(bundle),
          updatedAt: deps.clock.now(),
        });
      }
    });
  }

  /** Muat program + katalog, bangun edit, terapkan, simpan, dan siapkan undo. */
  async function run(build: (inputs: EditInputs) => Result<ProgramEdit>): Promise<Result<void>> {
    const [bundle, library, conditions] = await Promise.all([
      deps.programs.getActive(),
      deps.exercises.list(),
      deps.conditions.list(),
    ]);
    if (!bundle) return missing('Program');
    const byId = new Map(library.map((e) => [e.id, e]));

    const edit = build({ bundle, exerciseById: (id) => byId.get(id) });
    if (!edit.ok) return edit;
    const result = applyProgramEdit(bundle, edit.value, { newId: deps.newId, conditions });
    if (!result.ok) return result;

    await saveBundle(result.value, edit.value.kind === 'move_day');
    undoSnapshot = bundle;
    return ok(undefined);
  }

  const withExercise =
    (exerciseId: string, make: (exercise: Exercise) => ProgramEdit) =>
    ({ exerciseById }: EditInputs): Result<ProgramEdit> => {
      const exercise = exerciseById(exerciseId);
      return exercise ? ok(make(exercise)) : missing('Gerakan');
    };

  return {
    updatePrescription(programExerciseId: string, raw: unknown) {
      const patch = validate(prescriptionPatchSchema, raw);
      if (!patch.ok) return Promise.resolve(patch);
      return run(() => ok({ kind: 'update_prescription', programExerciseId, patch: patch.value }));
    },

    changeSets(programExerciseId: string, delta: number) {
      return run(() => ok({ kind: 'change_sets', programExerciseId, delta }));
    },

    reorderDay(programDayId: string, orderedIds: readonly string[]) {
      return run(() => ok({ kind: 'reorder', programDayId, orderedIds }));
    },

    addExercise(
      programDayId: string,
      exerciseId: string,
      prescription?: { sets: number; repMin: number; repMax: number },
    ) {
      return run(
        withExercise(exerciseId, (exercise) => ({
          kind: 'add_exercise',
          programDayId,
          exercise,
          ...(prescription && { prescription }),
        })),
      );
    },

    removeExercise(programExerciseId: string) {
      return run(() => ok({ kind: 'remove_exercise', programExerciseId }));
    },

    swapExercise(
      programExerciseId: string,
      exerciseId: string,
      reason: SubstitutionReason = 'user',
    ) {
      return run(
        withExercise(exerciseId, (exercise) => ({
          kind: 'swap_exercise',
          programExerciseId,
          exercise,
          reason,
        })),
      );
    },

    moveDay(programDayId: string, raw: unknown) {
      const weekday = validate(weekdaySchema, raw);
      if (!weekday.ok) return Promise.resolve(weekday);
      return run(() => ok({ kind: 'move_day', programDayId, weekday: weekday.value as Weekday }));
    },

    /** Kembalikan program ke keadaan sebelum edit terakhir. */
    async undo(): Promise<Result<void>> {
      if (!undoSnapshot)
        return err({ code: 'nothing_to_undo', message: 'Tidak ada perubahan untuk diurungkan' });
      const snapshot = undoSnapshot;
      undoSnapshot = null;
      await saveBundle(snapshot, true);
      return ok(undefined);
    },
  };
}

export type ProgramEditor = ReturnType<typeof createProgramEditor>;
