import { nextWeekday, WEEKDAYS, type Weekday } from '../../common/weekday';
import type { Muscle } from '../../exercise/types';
import type { ProgramDay } from '../../program/types';
import { SUGGESTION } from '../../standards';
import { MAJOR_MUSCLES, exercisesOn } from './helpers';
import type { SuggestionContext, SuggestionDraft, SuggestionRule } from './types';

const THREE_DAY_SCHEDULE: Weekday[] = ['mon', 'wed', 'fri'];

/** Kehadiran 2 minggu < 75%: tawarkan program 3 hari (aturan internal). */
export const lowAttendance: SuggestionRule = {
  id: 'low_attendance',
  category: 'program',
  evaluate(ctx) {
    const a = ctx.attendance;
    if (!a || a.scheduled === 0 || ctx.trainingDays.length <= THREE_DAY_SCHEDULE.length) return [];
    if (a.completed / a.scheduled >= SUGGESTION.lowAttendanceRatio) return [];
    return [
      {
        ruleId: this.id,
        targetKey: 'program',
        category: this.category,
        params: { completed: a.completed, scheduled: a.scheduled },
        action: { kind: 'regenerate_program', trainingDays: THREE_DAY_SCHEDULE },
      },
    ];
  },
};

function majorMusclesOf(ctx: SuggestionContext, day: ProgramDay): Set<Muscle> {
  return new Set(
    exercisesOn(ctx, day.id).flatMap((e) =>
      e.exercise.primaryMuscles.filter((m) => MAJOR_MUSCLES.includes(m)),
    ),
  );
}

function overlaps(a: Set<Muscle>, b: Set<Muscle>): boolean {
  return [...a].some((m) => b.has(m));
}

/** Otot yang sama dilatih berat di dua hari berurutan (ACSM: jeda ≥ 48 jam). */
export const consecutiveSameSplit: SuggestionRule = {
  id: 'consecutive_same_split',
  category: 'program',
  evaluate(ctx) {
    const byWeekday = new Map(ctx.days.map((d) => [d.weekday, d]));
    const drafts: SuggestionDraft[] = [];

    for (const day of ctx.days) {
      const next = byWeekday.get(nextWeekday(day.weekday));
      if (!next || !overlaps(majorMusclesOf(ctx, day), majorMusclesOf(ctx, next))) continue;

      // Cari hari kosong yang tidak bersebelahan dengan hari berotot sama.
      const muscles = majorMusclesOf(ctx, next);
      const occupied = new Set(ctx.days.map((d) => d.weekday));
      const neighbourClash = (w: Weekday) =>
        [WEEKDAYS[(WEEKDAYS.indexOf(w) + 6) % 7] as Weekday, nextWeekday(w)].some((n) => {
          const d = byWeekday.get(n);
          return d !== undefined && d.id !== next.id && overlaps(majorMusclesOf(ctx, d), muscles);
        });
      const target = WEEKDAYS.find((w) => !occupied.has(w) && !neighbourClash(w));

      drafts.push({
        ruleId: this.id,
        targetKey: next.id,
        category: this.category,
        params: { firstDay: day.label, secondDay: next.label, ...(target && { weekday: target }) },
        ...(target && { action: { kind: 'move_day', programDayId: next.id, weekday: target } }),
      });
    }
    return drafts;
  },
};
