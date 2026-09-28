import { PARQ_REPEAT_MONTHS, SUGGESTION, WHO_AEROBIC_MIN_PER_WEEK } from '../../standards';
import { DAY_MS } from './helpers';
import type { SuggestionRule } from './types';

const average = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Protein < 80% target pada ≥ 4 dari 7 hari terakhir (ISSN 2017). */
export const lowProtein: SuggestionRule = {
  id: 'low_protein',
  category: 'nutrition',
  evaluate(ctx) {
    const p = ctx.protein;
    if (!p || p.dailyG.length === 0) return [];
    const lowDays = p.dailyG.filter((g) => g < p.targetG * SUGGESTION.lowProteinRatio).length;
    if (lowDays < SUGGESTION.lowProteinMinDays) return [];
    return [
      {
        ruleId: this.id,
        targetKey: 'protein',
        category: this.category,
        params: { averageG: Math.round(average(p.dailyG)), targetG: p.targetG },
      },
    ];
  },
};

/** Rata-rata tidur di check-in < 7 jam (aturan internal). */
export const lowSleep: SuggestionRule = {
  id: 'low_sleep',
  category: 'other',
  evaluate(ctx) {
    const hours = ctx.sleepHours;
    if (!hours || hours.length < 3) return [];
    const avg = average(hours);
    if (avg >= SUGGESTION.lowSleepHours) return [];
    return [
      {
        ruleId: this.id,
        targetKey: 'sleep',
        category: this.category,
        params: { averageHours: Math.round(avg * 10) / 10 },
      },
    ];
  },
};

/** Laju naik berat di luar 0,25–0,5%/minggu (Iraki et al. 2019). */
export const calorieRecalibration: SuggestionRule = {
  id: 'calorie_recalibration',
  category: 'nutrition',
  evaluate(ctx) {
    const adj = ctx.calorieAdjustment;
    if (!adj || (adj.kind !== 'increase' && adj.kind !== 'decrease')) return [];
    return [
      {
        ruleId: this.id,
        targetKey: 'calories',
        category: this.category,
        params: { deltaKcal: adj.deltaKcal },
        action: { kind: 'set_calorie_offset', deltaKcal: adj.deltaKcal },
      },
    ];
  },
};

/** Aktivitas aerobik minggu lalu < 150 menit (WHO 2020). */
export const aerobicBelowWho: SuggestionRule = {
  id: 'aerobic_below_who',
  category: 'other',
  evaluate(ctx) {
    const minutes = ctx.aerobicMinutesLastWeek;
    if (minutes === undefined || minutes >= WHO_AEROBIC_MIN_PER_WEEK.min) return [];
    return [
      {
        ruleId: this.id,
        targetKey: 'aerobic',
        category: this.category,
        params: { minutes, targetMinutes: WHO_AEROBIC_MIN_PER_WEEK.min },
      },
    ];
  },
};

/** PAR-Q+ belum diisi atau sudah > 12 bulan. */
export const parqExpired: SuggestionRule = {
  id: 'parq_expired',
  category: 'safety',
  evaluate(ctx) {
    if (ctx.parqCompletedAt === undefined) return [];
    const expiry = PARQ_REPEAT_MONTHS * 30.44 * DAY_MS;
    if (ctx.parqCompletedAt !== null && ctx.now - ctx.parqCompletedAt < expiry) return [];
    return [
      {
        ruleId: this.id,
        targetKey: 'parq',
        category: this.category,
        params: {},
        action: { kind: 'open_screen', screen: 'parq' },
      },
    ];
  },
};

/** Data belum di-backup > 14 hari (aturan internal). */
export const backupReminder: SuggestionRule = {
  id: 'backup_reminder',
  category: 'other',
  evaluate(ctx) {
    const ref = ctx.backupReferenceAt;
    if (ref === undefined) return [];
    const days = Math.floor((ctx.now - ref) / DAY_MS);
    if (days <= SUGGESTION.backupReminderDays) return [];
    return [
      {
        ruleId: this.id,
        targetKey: 'backup',
        category: this.category,
        params: { days },
        action: { kind: 'open_screen', screen: 'backup' },
      },
    ];
  },
};
