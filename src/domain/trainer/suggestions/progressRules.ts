import { SUGGESTION } from '../../standards';
import { findSubstitutes } from '../substitution';
import { exercisesOn } from './helpers';
import type { SuggestionDraft, SuggestionRule } from './types';

/** 1RM estimasi tidak naik dalam 3 sesi terakhir (aturan internal). */
export const stagnation: SuggestionRule = {
  id: 'stagnation',
  category: 'program',
  evaluate(ctx) {
    if (ctx.isDeloadWeek || !ctx.e1rmHistory) return [];
    const drafts: SuggestionDraft[] = [];
    for (const pe of ctx.exercises) {
      const history = ctx.e1rmHistory[pe.id] ?? [];
      const recent = history.slice(-SUGGESTION.stagnationSessions);
      const before = history.slice(0, -SUGGESTION.stagnationSessions);
      if (recent.length < SUGGESTION.stagnationSessions || before.length === 0) continue;
      if (Math.max(...recent) > Math.max(...before)) continue;

      const excludeIds = exercisesOn(ctx, pe.programDayId).map((e) => e.exerciseId);
      const substitute = findSubstitutes(pe.exercise, { ...ctx.selection, excludeIds }).results[0];
      drafts.push({
        ruleId: this.id,
        targetKey: pe.id,
        category: this.category,
        params: {
          exerciseId: pe.exerciseId,
          sessions: SUGGESTION.stagnationSessions,
          ...(substitute && { substituteId: substitute.exercise.id }),
        },
        ...(substitute && {
          action: {
            kind: 'swap_exercise',
            programExerciseId: pe.id,
            exerciseId: substitute.exercise.id,
          },
        }),
      });
    }
    return drafts;
  },
};

/** Sinyal kelelahan menumpuk sebelum deload terjadwal (Bell et al. 2023). */
export const deloadDue: SuggestionRule = {
  id: 'deload_due',
  category: 'safety',
  evaluate(ctx) {
    if (!ctx.earlyDeloadSuggested || ctx.isDeloadWeek) return [];
    return [
      {
        ruleId: this.id,
        targetKey: 'program',
        category: this.category,
        params: {},
        action: { kind: 'start_deload' },
      },
    ];
  },
};
