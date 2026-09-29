import type { Circumference } from '@/domain/body/types';
import { computeWeightTrend } from '@/domain/body/weightTrend';
import { toLocalDate } from '@/domain/common/clock';
import { addDays, daysBetween } from '@/domain/common/weekday';
import type { Exercise } from '@/domain/exercise/types';
import { isLoaded } from '@/domain/exercise/types';
import { intakeByDay } from '@/domain/nutrition/intake';
import { weighInsOf } from '@/domain/progress/body';
import { weekStarts } from '@/domain/progress/range';
import { e1rmSeries } from '@/domain/progress/strength';
import { weeklyAttendance } from '@/domain/progress/volume';
import { MESOCYCLE_WEEKS } from '@/domain/standards';
import type { SuggestionDraft } from '@/domain/trainer/suggestions';
import { tonnageOf } from '@/domain/workout/sessionMath';
import type { AppDeps } from '../deps';
import { ALL_TIME } from '../progress/strengthProgress';

const TOP_LIFTS = 3;
const FOCUS_LIMIT = 3;
/** Kartu evaluasi tampil di Hari Ini selama 3 hari setelah periode selesai. */
const DUE_DAYS = 3;
const TRACKED_MEASUREMENTS: readonly Circumference[] = ['armCm', 'chestCm', 'waistCm'];

export type EvaluationKind = 'month' | 'block';

export interface EvaluationPeriod {
  /** 'bulan-2026-09' atau 'blok-1' (dipakai di URL). */
  key: string;
  kind: EvaluationKind;
  /** 'YYYY-MM' untuk bulan, nomor blok untuk blok. */
  label: string;
  from: string;
  /** Tanggal sesudah hari terakhir (eksklusif). */
  to: string;
}

export interface EvaluationReport extends EvaluationPeriod {
  sessions: number;
  attendance: { done: number; scheduled: number };
  tonnageKg: number;
  lifts: { exercise: Exercise; fromKg: number; toKg: number }[];
  weightChangeKg: number | null;
  measurements: { field: Circumference; changeCm: number }[];
  averageProteinG: number | null;
  averageSleepHours: number | null;
  focus: SuggestionDraft[];
}

const monthStart = (date: string) => `${date.slice(0, 7)}-01`;
const nextMonth = (date: string) => {
  const [y, m] = date.split('-').map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
};
const average = (xs: readonly number[]) =>
  xs.length > 0 ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

/**
 * Evaluasi bulanan (tanggal 1) dan akhir blok (setelah minggu deload).
 * docs/fitur/11-pencapaian.md "Evaluasi bulanan & akhir blok"
 */
export function makeEvaluation(deps: AppDeps, listSuggestions: () => Promise<SuggestionDraft[]>) {
  const today = () => toLocalDate(deps.clock.now());

  /** Periode yang sudah selesai, terbaru lebih dulu. */
  async function periods(): Promise<EvaluationPeriod[]> {
    const [profile, bundle] = await Promise.all([deps.profiles.get(), deps.programs.getActive()]);
    if (!profile) return [];
    const now = today();
    const result: EvaluationPeriod[] = [];

    for (let from = monthStart(toLocalDate(profile.createdAt)); nextMonth(from) <= now;) {
      const to = nextMonth(from);
      result.push({
        key: `bulan-${from.slice(0, 7)}`,
        kind: 'month',
        label: from.slice(0, 7),
        from,
        to,
      });
      from = to;
    }
    if (bundle) {
      for (let block = 1; ; block++) {
        const from = addDays(bundle.program.startDate, 7 * MESOCYCLE_WEEKS * (block - 1));
        const to = addDays(from, 7 * MESOCYCLE_WEEKS);
        if (to > now) break;
        result.push({ key: `blok-${block}`, kind: 'block', label: String(block), from, to });
      }
    }
    return result.sort((a, b) => b.to.localeCompare(a.to) || a.kind.localeCompare(b.kind));
  }

  async function report(key: string): Promise<EvaluationReport | null> {
    const period = (await periods()).find((p) => p.key === key);
    if (!period) return null;
    const { from, to } = period;
    const inPeriod = (d: string) => d >= from && d < to;
    const [bundle, finished, records, library, metrics, foods, checkIns, suggestions] =
      await Promise.all([
        deps.programs.getActive(),
        deps.sessions.listFinishedSince(from),
        deps.sessions.workingSetsSince(ALL_TIME),
        deps.exercises.list(),
        deps.bodyMetrics.list(),
        deps.nutrition.listFoodsSince(from),
        deps.checkIns.listSince(from),
        listSuggestions(),
      ]);

    const sessions = finished.filter((s) => inPeriod(s.logDate));
    const periodRecords = records.filter((r) => inPeriod(r.logDate));
    const lastDay = addDays(to, -1);
    const attendance = bundle
      ? weeklyAttendance(
          sessions.map((s) => s.logDate),
          bundle.days.map((d) => d.weekday),
          weekStarts(from, lastDay),
          lastDay,
          // Hari sebelum awal periode / awal program tidak dihitung terjadwal.
          from > bundle.program.startDate ? from : bundle.program.startDate,
        ).reduce(
          (sum, w) => ({ done: sum.done + w.done, scheduled: sum.scheduled + w.scheduled }),
          { done: 0, scheduled: 0 },
        )
      : { done: sessions.length, scheduled: 0 };

    // 3 gerakan berbeban yang paling sering dilatih: 1RM awal → akhir periode.
    const byId = new Map(library.filter(isLoaded).map((e) => [e.id, e]));
    const sessionCount = new Map<string, Set<string>>();
    for (const r of periodRecords) {
      if (!byId.has(r.exerciseId)) continue;
      sessionCount.set(
        r.exerciseId,
        (sessionCount.get(r.exerciseId) ?? new Set()).add(r.sessionId),
      );
    }
    const lifts = [...sessionCount]
      .sort((a, b) => b[1].size - a[1].size)
      .flatMap(([id]) => {
        const points = e1rmSeries(periodRecords.filter((r) => r.exerciseId === id));
        const first = points[0];
        const last = points.at(-1);
        const exercise = byId.get(id);
        return exercise && first && last && points.length >= 2
          ? [{ exercise, fromKg: first.e1rmKg, toKg: last.e1rmKg }]
          : [];
      })
      .slice(0, TOP_LIFTS);

    const trend = computeWeightTrend(weighInsOf(metrics)).filter((p) => inPeriod(p.logDate));
    const firstTrend = trend[0];
    const lastTrend = trend.at(-1);

    const periodMetrics = metrics.filter((m) => inPeriod(m.logDate));
    const measurements = TRACKED_MEASUREMENTS.flatMap((field) => {
      const values = periodMetrics.flatMap((m) => (m[field] === undefined ? [] : [m[field]]));
      const first = values[0];
      const last = values.at(-1);
      return first !== undefined && last !== undefined && values.length >= 2
        ? [{ field, changeCm: last - first }]
        : [];
    });

    const dates = Array.from({ length: daysBetween(from, to) }, (_, i) => addDays(from, i));
    return {
      ...period,
      sessions: sessions.length,
      attendance,
      tonnageKg: tonnageOf(periodRecords),
      lifts,
      weightChangeKg:
        firstTrend && lastTrend && trend.length >= 2
          ? lastTrend.trendKg - firstTrend.trendKg
          : null,
      measurements,
      averageProteinG: average(intakeByDay(foods, dates).map((d) => d.intake.proteinG)),
      averageSleepHours: average(
        checkIns.filter((c) => inPeriod(c.logDate)).map((c) => c.sleepHours),
      ),
      focus: suggestions.slice(0, FOCUS_LIMIT),
    };
  }

  return {
    periods,
    report,
    /** Evaluasi yang baru selesai (≤ 3 hari lalu) untuk kartu di Hari Ini. */
    async due(): Promise<EvaluationPeriod | null> {
      const now = today();
      return (
        (await periods()).find((p) => p.to <= now && daysBetween(p.to, now) < DUE_DAYS) ?? null
      );
    },
  };
}
