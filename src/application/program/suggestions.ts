import { toLocalDate } from '@/domain/common/clock';
import { addDays, startOfWeek } from '@/domain/common/weekday';
import { aerobicMinutes } from '@/domain/today/activity';
import { err, ok, type Result } from '@/domain/common/result';
import { isScheduledDeloadWeek } from '@/domain/trainer/deload';
import {
  evaluateSuggestions,
  type SuggestionContext,
  type SuggestionDraft,
} from '@/domain/trainer/suggestions';
import type { AppDeps } from '../deps';
import { makeChangeTrainingDays } from '../profile/updateProfile';
import type { ProgramEditor } from './programEditor';

/**
 * Saran trainer untuk program aktif: daftar, terapkan, abaikan.
 * Data yang belum ada (riwayat latihan, nutrisi, tidur) membuat aturan terkait dilewati
 * sampai tahapnya dibangun. docs/mesin-trainer/04-saran-trainer.md
 */
export function makeSuggestionUseCases(deps: AppDeps, editor: ProgramEditor) {
  async function loadContext(): Promise<{ ctx: SuggestionContext; programId: string } | null> {
    const [bundle, profile, library, equipment, conditions] = await Promise.all([
      deps.programs.getActive(),
      deps.profiles.get(),
      deps.exercises.list(),
      deps.gym.getEquipment(),
      deps.conditions.list(),
    ]);
    if (!bundle || !profile) return null;
    const byId = new Map(library.map((e) => [e.id, e]));
    const now = deps.clock.now();
    // Aktivitas aerobik minggu lalu, hanya jika program sudah berjalan sepanjang minggu itu (WHO 2020).
    const lastMonday = addDays(startOfWeek(toLocalDate(now)), -7);
    const lastSunday = addDays(lastMonday, 6);
    const aerobic =
      bundle && bundle.program.startDate <= lastMonday
        ? aerobicMinutes(
            (await deps.activities.listSince(lastMonday)).filter((a) => a.logDate <= lastSunday),
          )
        : undefined;

    const ctx: SuggestionContext = {
      now,
      days: bundle.days,
      exercises: bundle.exercises.flatMap((pe) => {
        const exercise = byId.get(pe.exerciseId);
        return exercise ? [{ ...pe, exercise }] : [];
      }),
      selection: {
        library,
        availableEquipment: equipment,
        conditions,
        experience: profile.experience,
      },
      trainingDays: profile.trainingDays,
      isDeloadWeek: isScheduledDeloadWeek(bundle.program.startDate, toLocalDate(now)),
      parqCompletedAt: profile.parqCompletedAt ?? null,
      ...(aerobic !== undefined && { aerobicMinutesLastWeek: aerobic }),
    };
    return { ctx, programId: bundle.program.id };
  }

  async function list(): Promise<SuggestionDraft[]> {
    const loaded = await loadContext();
    if (!loaded) return [];
    const resolved = await deps.suggestions.listResolved();
    const dismissed = resolved.filter((r) => r.status === 'dismissed');
    return evaluateSuggestions(loaded.ctx, dismissed);
  }

  async function record(
    draft: SuggestionDraft,
    status: 'applied' | 'dismissed',
    programId: string,
  ) {
    await deps.suggestions.save({
      id: deps.newId(),
      programId,
      ruleId: draft.ruleId,
      targetKey: draft.targetKey,
      status,
      resolvedAt: deps.clock.now(),
    });
  }

  async function find(ruleId: string, targetKey: string) {
    const loaded = await loadContext();
    const draft =
      loaded &&
      evaluateSuggestions(loaded.ctx).find((d) => d.ruleId === ruleId && d.targetKey === targetKey);
    return loaded && draft ? { draft, programId: loaded.programId } : null;
  }

  return {
    list,

    async apply(ruleId: string, targetKey: string): Promise<Result<{ programChanged: boolean }>> {
      const found = await find(ruleId, targetKey);
      if (!found) return err({ code: 'suggestion_gone', message: 'Saran sudah tidak berlaku' });
      const { draft, programId } = found;
      const action = draft.action;
      if (!action) return err({ code: 'not_actionable', message: 'Saran ini hanya informasi' });

      let result: Result<unknown>;
      switch (action.kind) {
        case 'add_sets':
          result = await editor.changeSets(action.programExerciseId, action.sets);
          break;
        case 'remove_sets':
          result = await editor.changeSets(action.programExerciseId, -action.sets);
          break;
        case 'add_exercise':
          result = await editor.addExercise(action.programDayId, action.exerciseId, {
            sets: action.sets,
            repMin: action.repMin,
            repMax: action.repMax,
          });
          break;
        case 'swap_exercise':
          result = await editor.swapExercise(
            action.programExerciseId,
            action.exerciseId,
            draft.ruleId === 'stagnation' ? 'stagnation' : 'user',
          );
          break;
        case 'move_day':
          result = await editor.moveDay(action.programDayId, action.weekday);
          break;
        case 'regenerate_program':
          result = await makeChangeTrainingDays(deps)(action.trainingDays);
          break;
        default:
          // Deload, kalori, dan layar lain ditangani di tahap masing-masing (atau oleh UI).
          return err({ code: 'not_supported', message: 'Aksi ini belum tersedia' });
      }
      if (!result.ok) return result;
      await record(draft, 'applied', programId);
      return ok({ programChanged: true });
    },

    async dismiss(ruleId: string, targetKey: string): Promise<Result<void>> {
      const found = await find(ruleId, targetKey);
      if (!found) return err({ code: 'suggestion_gone', message: 'Saran sudah tidak berlaku' });
      await record(found.draft, 'dismissed', found.programId);
      return ok(undefined);
    },
  };
}
