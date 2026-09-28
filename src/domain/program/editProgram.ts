import type { IdGenerator } from '../common/id';
import { err, ok, type Result } from '../common/result';
import { sortWeekdays, type Weekday } from '../common/weekday';
import type { Exercise } from '../exercise/types';
import type { HealthCondition } from '../profile/types';
import { PROGRAM_EDIT_LIMITS, TARGET_RIR } from '../standards';
import { assessHealth } from '../trainer/health';
import { defaultRestSec } from '../workout/rest';
import type { ProgramBundle, ProgramExercise, SubstitutionReason } from './types';

export interface PrescriptionPatch {
  sets?: number | undefined;
  repMin?: number | undefined;
  repMax?: number | undefined;
  targetRir?: number | undefined;
  restSec?: number | undefined;
}

/** Hanya kolom yang benar-benar diisi (undefined tidak menimpa nilai lama). */
function definedOnly(patch: PrescriptionPatch) {
  return Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as {
    [K in keyof PrescriptionPatch]?: number;
  };
}

/** Perubahan program yang bisa dilakukan pengguna atau lewat saran trainer. docs/fitur/04-program.md */
export type ProgramEdit =
  | { kind: 'update_prescription'; programExerciseId: string; patch: PrescriptionPatch }
  | { kind: 'change_sets'; programExerciseId: string; delta: number }
  | { kind: 'reorder'; programDayId: string; orderedIds: readonly string[] }
  | {
      kind: 'add_exercise';
      programDayId: string;
      exercise: Exercise;
      prescription?: PrescriptionPatch;
    }
  | { kind: 'remove_exercise'; programExerciseId: string }
  | {
      kind: 'swap_exercise';
      programExerciseId: string;
      exercise: Exercise;
      reason: SubstitutionReason;
    }
  | { kind: 'move_day'; programDayId: string; weekday: Weekday };

export interface EditContext {
  newId: IdGenerator;
  conditions: readonly HealthCondition[];
}

const fail = (code: string, message: string, fields?: Record<string, string>) =>
  err({ code, message, ...(fields && { fields }) });

/** Resep bawaan untuk gerakan yang baru ditambahkan (ACSM 2009, docs/sains-latihan/02). */
export function defaultPrescription(exercise: Exercise) {
  if (exercise.measure === 'seconds') return { sets: 2, repMin: 30, repMax: 45 };
  return exercise.mechanics === 'compound'
    ? { sets: 3, repMin: 8, repMax: 12 }
    : { sets: 2, repMin: 12, repMax: 15 };
}

/** Validasi batas edit (docs/mesin-trainer/01-pembuatan-program.md "Validasi keras"). */
export function validatePrescription(p: {
  sets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
  restSec: number;
}) {
  const L = PROGRAM_EDIT_LIMITS;
  const fields: Record<string, string> = {};
  if (!Number.isInteger(p.sets) || p.sets < L.setsMin || p.sets > L.setsMax)
    fields.sets = 'sets_range';
  if (!Number.isInteger(p.repMin) || p.repMin < 1) fields.repMin = 'reps_range';
  if (!Number.isInteger(p.repMax) || p.repMax > L.repMaxLimit) fields.repMax = 'reps_range';
  if (p.repMin > p.repMax) fields.repMax = 'rep_order';
  if (p.restSec < L.restSecMin || p.restSec > L.restSecMax) fields.restSec = 'rest_range';
  if (p.targetRir < TARGET_RIR.min || p.targetRir > TARGET_RIR.max) fields.targetRir = 'rir_range';
  return Object.keys(fields).length > 0 ? fields : null;
}

function renumber(exercises: ProgramExercise[], dayId: string, orderedIds: readonly string[]) {
  const position = new Map(orderedIds.map((id, i) => [id, i]));
  return exercises.map((e) =>
    e.programDayId === dayId && position.has(e.id)
      ? { ...e, order: position.get(e.id) as number }
      : e,
  );
}

/**
 * Terapkan satu perubahan pada program. Fungsi murni: mengembalikan program baru atau error.
 */
export function applyProgramEdit(
  bundle: ProgramBundle,
  edit: ProgramEdit,
  ctx: EditContext,
): Result<ProgramBundle> {
  const findPe = (id: string) => bundle.exercises.find((e) => e.id === id);
  const onDay = (dayId: string) =>
    bundle.exercises.filter((e) => e.programDayId === dayId).sort((a, b) => a.order - b.order);
  const withExercises = (exercises: ProgramExercise[]) => ok({ ...bundle, exercises });

  switch (edit.kind) {
    case 'update_prescription':
    case 'change_sets': {
      const pe = findPe(edit.programExerciseId);
      if (!pe) return fail('not_found', 'Gerakan program tidak ditemukan');
      const patch =
        edit.kind === 'change_sets' ? { sets: pe.sets + edit.delta } : definedOnly(edit.patch);
      const next = { ...pe, ...patch };
      const fields = validatePrescription(next);
      if (fields) return fail('invalid_prescription', 'Resep tidak valid', fields);
      return withExercises(bundle.exercises.map((e) => (e.id === pe.id ? next : e)));
    }

    case 'reorder': {
      const current = onDay(edit.programDayId).map((e) => e.id);
      const same =
        current.length === edit.orderedIds.length &&
        current.every((id) => edit.orderedIds.includes(id));
      if (!same) return fail('invalid_order', 'Urutan harus memuat semua gerakan hari itu');
      return withExercises(renumber(bundle.exercises, edit.programDayId, edit.orderedIds));
    }

    case 'add_exercise': {
      if (!bundle.days.some((d) => d.id === edit.programDayId))
        return fail('not_found', 'Hari tidak ditemukan');
      const day = onDay(edit.programDayId);
      if (day.some((e) => e.exerciseId === edit.exercise.id)) {
        return fail('duplicate_exercise', 'Gerakan sudah ada di hari ini');
      }
      const prescription = {
        ...defaultPrescription(edit.exercise),
        ...definedOnly(edit.prescription ?? {}),
      };
      const added: ProgramExercise = {
        id: ctx.newId(),
        programDayId: edit.programDayId,
        exerciseId: edit.exercise.id,
        order: day.length,
        sets: prescription.sets,
        repMin: prescription.repMin,
        repMax: prescription.repMax,
        targetRir: prescription.targetRir ?? TARGET_RIR.default,
        restSec: prescription.restSec ?? defaultRestSec(edit.exercise),
        currentWeightKg: null,
        progressionLocked: assessHealth(edit.exercise, ctx.conditions) === 'locked',
      };
      const fields = validatePrescription(added);
      if (fields) return fail('invalid_prescription', 'Resep tidak valid', fields);
      return withExercises([...bundle.exercises, added]);
    }

    case 'remove_exercise': {
      const pe = findPe(edit.programExerciseId);
      if (!pe) return fail('not_found', 'Gerakan program tidak ditemukan');
      const remaining = onDay(pe.programDayId).filter((e) => e.id !== pe.id);
      if (remaining.length === 0) {
        return fail('last_exercise', 'Hari latihan minimal punya satu gerakan');
      }
      const without = bundle.exercises.filter((e) => e.id !== pe.id);
      return withExercises(
        renumber(
          without,
          pe.programDayId,
          remaining.map((e) => e.id),
        ),
      );
    }

    case 'swap_exercise': {
      const pe = findPe(edit.programExerciseId);
      if (!pe) return fail('not_found', 'Gerakan program tidak ditemukan');
      if (onDay(pe.programDayId).some((e) => e.exerciseId === edit.exercise.id && e.id !== pe.id)) {
        return fail('duplicate_exercise', 'Gerakan sudah ada di hari ini');
      }
      const swapped: ProgramExercise = {
        ...pe,
        exerciseId: edit.exercise.id,
        // Beban lama tidak berlaku untuk gerakan lain: kalibrasi ulang di sesi berikutnya.
        currentWeightKg: null,
        substitutedFrom: pe.substitutedFrom ?? pe.exerciseId,
        substitutionReason: edit.reason,
        progressionLocked: assessHealth(edit.exercise, ctx.conditions) === 'locked',
      };
      if (swapped.substitutedFrom === swapped.exerciseId) {
        delete swapped.substitutedFrom;
        delete swapped.substitutionReason;
      }
      return withExercises(bundle.exercises.map((e) => (e.id === pe.id ? swapped : e)));
    }

    case 'move_day': {
      const day = bundle.days.find((d) => d.id === edit.programDayId);
      if (!day) return fail('not_found', 'Hari tidak ditemukan');
      // Hari tujuan sudah dipakai → tukar jadwal kedua hari.
      const days = bundle.days.map((d) => {
        if (d.id === day.id) return { ...d, weekday: edit.weekday };
        if (d.weekday === edit.weekday) return { ...d, weekday: day.weekday };
        return d;
      });
      return ok({ ...bundle, days });
    }
  }
}

/** Hari latihan pada program (untuk menyelaraskan profil setelah pindah hari). */
export function trainingDaysOf(bundle: ProgramBundle): Weekday[] {
  return sortWeekdays(bundle.days.map((d) => d.weekday));
}
