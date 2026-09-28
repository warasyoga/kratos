import type { Weekday } from '@/domain/common/weekday';
import type { Muscle } from '@/domain/exercise/types';
import type { SuggestionDraft } from '@/domain/trainer/suggestions';
import { t, type SuggestionArgs } from '@/shared/i18n/id';
import { formatNumber } from '@/shared/lib/format';

export interface SuggestionText {
  message: string;
  /** Dasar ilmiah untuk tombol "Kenapa?". */
  why: string;
}

/** Siapkan nilai saran (nama otot, gerakan, hari, angka) lalu susun kalimat dari i18n. */
export function describeSuggestion(
  draft: SuggestionDraft,
  nameOf: (id: string) => string,
): SuggestionText {
  const p = draft.params;
  const text = (key: string) => (p[key] === undefined ? undefined : String(p[key]));
  const number = (key: string) => (typeof p[key] === 'number' ? formatNumber(p[key]) : undefined);
  const id = (key: string) => (typeof p[key] === 'string' ? nameOf(p[key]) : undefined);

  const args: SuggestionArgs = {
    muscle: p.muscle ? t.muscle[p.muscle as Muscle].toLowerCase() : undefined,
    sets: number('sets'),
    addSets: number('addSets'),
    removeSets: number('removeSets'),
    frequency: number('frequency'),
    push: number('push'),
    pull: number('pull'),
    hamstrings: number('hamstrings'),
    quads: number('quads'),
    sessions: number('sessions'),
    completed: number('completed'),
    scheduled: number('scheduled'),
    dayLabel: text('dayLabel'),
    firstDay: text('firstDay'),
    secondDay: text('secondDay'),
    weekday: p.weekday ? t.weekdayLong[p.weekday as Weekday] : undefined,
    exercise: id('exerciseId'),
    substitute: id('substituteId'),
  };

  const rule = t.suggestionRules[draft.ruleId];
  return rule ? { message: rule.message(args), why: rule.why } : { message: draft.ruleId, why: '' };
}
