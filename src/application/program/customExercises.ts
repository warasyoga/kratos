import { z } from 'zod/mini';
import { err, ok, type Result } from '@/domain/common/result';
import { buildCustomExercise, CUSTOM_ID_PREFIX } from '@/domain/exercise/custom';
import { LOAD_TYPES, MOVEMENT_PATTERNS, MUSCLES, type Exercise } from '@/domain/exercise/types';
import { EQUIPMENT } from '@/domain/profile/types';
import type { AppDeps } from '../deps';
import { validate } from '../validation';

/** Wajib: nama, pola, otot utama, alat, jenis beban (docs/fitur/06-perpustakaan-gerakan.md). */
export const customExerciseSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(2, { error: 'exercise_name_required' }),
      z.maxLength(40, { error: 'exercise_name_too_long' }),
    ),
  pattern: z.enum(MOVEMENT_PATTERNS, { error: 'choose_one' }),
  primaryMuscles: z
    .array(z.enum(MUSCLES))
    .check(z.minLength(1, { error: 'primary_muscle_required' })),
  secondaryMuscles: z.array(z.enum(MUSCLES)),
  equipment: z.array(z.enum(EQUIPMENT)),
  loadType: z.enum(LOAD_TYPES, { error: 'choose_one' }),
  measure: z.enum(['reps', 'seconds'], { error: 'choose_one' }),
  note: z.optional(z.string().check(z.trim(), z.maxLength(300, { error: 'note_too_long' }))),
});

export interface CustomExerciseDraft {
  exercise: Exercise;
  note: string;
}

/** Tambah, ubah, hapus gerakan buatan pengguna. Gerakan bawaan tidak bisa diubah/dihapus. */
export function makeCustomExerciseUseCases(deps: AppDeps) {
  async function nameTaken(name: string, exceptId?: string) {
    const key = name.trim().toLocaleLowerCase('id');
    return (await deps.exercises.list()).some(
      (e) => e.id !== exceptId && e.name.toLocaleLowerCase('id') === key,
    );
  }

  async function save(id: string, raw: unknown): Promise<Result<{ id: string }>> {
    const parsed = validate(customExerciseSchema, raw);
    if (!parsed.ok) return parsed;
    const { note, ...input } = parsed.value;
    if (await nameTaken(input.name, id))
      return err({
        code: 'validation_failed',
        message: 'Nama sudah dipakai',
        fields: { name: 'exercise_name_taken' },
      });
    await deps.exercises.saveCustom(buildCustomExercise(id, input), note || undefined);
    return ok({ id });
  }

  async function ownExercise(id: string): Promise<Result<Exercise>> {
    const exercise = await deps.exercises.get(id);
    if (!exercise) return err({ code: 'not_found', message: 'Gerakan tidak ditemukan' });
    if (!exercise.isCustom) return err({ code: 'not_custom', message: 'Gerakan bawaan' });
    return ok(exercise);
  }

  return {
    create: (raw: unknown) => save(`${CUSTOM_ID_PREFIX}${deps.newId()}`, raw),

    async update(id: string, raw: unknown): Promise<Result<{ id: string }>> {
      const own = await ownExercise(id);
      return own.ok ? save(id, raw) : own;
    },

    /** Data untuk form ubah. */
    async draft(id: string): Promise<CustomExerciseDraft | null> {
      const own = await ownExercise(id);
      if (!own.ok) return null;
      const guide = await deps.exercises.getGuide(id);
      return { exercise: own.value, note: guide?.instructions[0] ?? '' };
    },

    /** Hapus; ditolak jika masih dipakai program aktif (riwayat latihan tetap aman). */
    async remove(id: string): Promise<Result<void>> {
      const own = await ownExercise(id);
      if (!own.ok) return own;
      const bundle = await deps.programs.getActive();
      if (bundle?.exercises.some((pe) => pe.exerciseId === id))
        return err({ code: 'exercise_in_use', message: 'Masih dipakai program' });
      await deps.exercises.removeCustom(id);
      return ok(undefined);
    },
  };
}
