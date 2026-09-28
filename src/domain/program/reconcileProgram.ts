import type { Exercise } from '../exercise/types';
import { assessHealth } from '../trainer/health';
import { findSubstitutes, whyUnavailable, type SelectionContext } from '../trainer/substitution';
import type { ProgramExercise, SubstitutionReason } from './types';

export type ReconcileChange =
  | {
      kind: 'substituted';
      programExerciseId: string;
      fromId: string;
      toId: string;
      reason: SubstitutionReason;
    }
  | { kind: 'restored'; programExerciseId: string; fromId: string; toId: string }
  | { kind: 'unavailable'; programExerciseId: string; exerciseId: string };

export interface ReconcileResult {
  exercises: ProgramExercise[];
  changes: ReconcileChange[];
}

/**
 * Sesuaikan program setelah alat atau kondisi kesehatan berubah:
 * gerakan yang tidak lagi bisa dipakai diganti, dan gerakan asal dikembalikan bila sudah bisa lagi.
 * Pengganti pilihan pengguna ('user') tidak disentuh. docs/fitur/09-profil.md
 */
export function reconcileProgram(
  programExercises: readonly ProgramExercise[],
  ctx: Omit<SelectionContext, 'excludeIds'>,
): ReconcileResult {
  const byId = new Map(ctx.library.map((e) => [e.id, e]));
  const result = programExercises.map((pe) => ({ ...pe }));
  const changes: ReconcileChange[] = [];

  const idsOnDay = (dayId: string, exceptId: string) =>
    result.filter((e) => e.programDayId === dayId && e.id !== exceptId).map((e) => e.exerciseId);

  const assign = (pe: ProgramExercise, from: Exercise, to: Exercise) => {
    pe.exerciseId = to.id;
    if (from.loadType !== to.loadType) pe.currentWeightKg = null;
  };

  for (const pe of result) {
    const current = byId.get(pe.exerciseId);
    if (!current) continue;

    // 1) Kembalikan gerakan asal jika penyebab penggantian sudah tidak ada.
    const originalId = pe.substitutedFrom;
    const original = originalId ? byId.get(originalId) : undefined;
    const autoSubstituted =
      pe.substitutionReason === 'health' || pe.substitutionReason === 'equipment';
    if (
      original &&
      autoSubstituted &&
      !idsOnDay(pe.programDayId, pe.id).includes(original.id) &&
      whyUnavailable(original, ctx) === null
    ) {
      assign(pe, current, original);
      delete pe.substitutedFrom;
      delete pe.substitutionReason;
      changes.push({
        kind: 'restored',
        programExerciseId: pe.id,
        fromId: current.id,
        toId: original.id,
      });
    } else {
      // 2) Ganti gerakan yang sekarang tidak bisa dipakai.
      const reason = whyUnavailable(current, ctx);
      if (reason !== null) {
        const substitute = findSubstitutes(current, {
          ...ctx,
          excludeIds: idsOnDay(pe.programDayId, pe.id),
        }).results[0];
        if (substitute) {
          assign(pe, current, substitute.exercise);
          pe.substitutedFrom = pe.substitutedFrom ?? current.id;
          pe.substitutionReason = reason === 'health' ? 'health' : 'equipment';
          changes.push({
            kind: 'substituted',
            programExerciseId: pe.id,
            fromId: current.id,
            toId: substitute.exercise.id,
            reason: pe.substitutionReason,
          });
        } else {
          changes.push({ kind: 'unavailable', programExerciseId: pe.id, exerciseId: current.id });
        }
      }
    }

    const now = byId.get(pe.exerciseId);
    if (now) pe.progressionLocked = assessHealth(now, ctx.conditions) === 'locked';
  }

  return { exercises: result, changes };
}
