import { SUGGESTION } from '../../standards';
import { DAY_MS } from './helpers';
import {
  aerobicBelowWho,
  backupReminder,
  calorieRecalibration,
  lowProtein,
  lowSleep,
  parqExpired,
} from './lifestyleRules';
import { deloadDue, stagnation } from './progressRules';
import { consecutiveSameSplit, lowAttendance } from './scheduleRules';
import type {
  SuggestionCategory,
  SuggestionContext,
  SuggestionDraft,
  SuggestionRule,
} from './types';
import {
  highWeeklyVolume,
  lowFrequency,
  lowWeeklyVolume,
  pushPullImbalance,
  quadHamImbalance,
} from './volumeRules';

export type * from './types';

/**
 * Semua aturan saran. Menambah saran baru: buat SuggestionRule + test, lalu daftarkan di sini.
 * docs/mesin-trainer/04-saran-trainer.md
 */
export const ALL_RULES: readonly SuggestionRule[] = [
  parqExpired,
  deloadDue,
  lowWeeklyVolume,
  highWeeklyVolume,
  lowFrequency,
  pushPullImbalance,
  quadHamImbalance,
  consecutiveSameSplit,
  stagnation,
  lowAttendance,
  lowProtein,
  calorieRecalibration,
  lowSleep,
  aerobicBelowWho,
  backupReminder,
];

const PRIORITY: Record<SuggestionCategory, number> = {
  safety: 0,
  program: 1,
  nutrition: 2,
  other: 3,
};

export interface DismissedSuggestion {
  ruleId: string;
  targetKey: string;
  resolvedAt: number;
}

/**
 * Jalankan semua aturan, buang yang baru diabaikan (< 14 hari), urutkan
 * keamanan → program → nutrisi → lainnya.
 */
export function evaluateSuggestions(
  ctx: SuggestionContext,
  dismissed: readonly DismissedSuggestion[] = [],
  rules: readonly SuggestionRule[] = ALL_RULES,
): SuggestionDraft[] {
  const cooldownMs = SUGGESTION.dismissCooldownDays * DAY_MS;
  const recentlyDismissed = (d: SuggestionDraft) =>
    dismissed.some(
      (x) =>
        x.ruleId === d.ruleId && x.targetKey === d.targetKey && ctx.now - x.resolvedAt < cooldownMs,
    );

  return rules
    .flatMap((rule) => rule.evaluate(ctx))
    .filter((d) => !recentlyDismissed(d))
    .map((d, index) => ({ d, index }))
    .sort((a, b) => PRIORITY[a.d.category] - PRIORITY[b.d.category] || a.index - b.index)
    .map(({ d }) => d);
}
