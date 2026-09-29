import { estimateOneRepMax } from '../strength/oneRepMax';
import { bestSet, detectPersonalRecord, type PrKind } from '../strength/personalRecord';
import type { SetResult, WorkingSetRecord } from '../workout/types';

/** Set kerja satu gerakan dalam satu sesi beserta set terbaiknya. */
export interface SessionBest {
  sessionId: string;
  logDate: string;
  sets: SetResult[];
  best: SetResult;
  /** null jika set terbaik > 10 repetisi (Epley tidak akurat). */
  e1rmKg: number | null;
}

export interface E1rmPoint {
  logDate: string;
  e1rmKg: number;
}

export interface PrEvent {
  exerciseId: string;
  sessionId: string;
  logDate: string;
  weightKg: number;
  reps: number;
  e1rmKg: number | null;
  kinds: PrKind[];
}

export interface ExerciseTrend {
  exerciseId: string;
  /** Jumlah sesi di rentang. */
  sessionCount: number;
  /** 1RM estimasi per tanggal di rentang, urut waktu. */
  points: E1rmPoint[];
  /** 1RM estimasi terakhir (sepanjang riwayat). */
  currentE1rmKg: number | null;
  /** Titik terakhir − titik pertama di rentang; null jika < 2 titik. */
  changeKg: number | null;
}

const e1rmOf = (s: SetResult) =>
  s.weightKg > 0 && s.reps >= 1 ? estimateOneRepMax(s.weightKg, s.reps) : null;

function groupBy<K>(records: readonly WorkingSetRecord[], key: (r: WorkingSetRecord) => K) {
  const groups = new Map<K, WorkingSetRecord[]>();
  for (const r of records) {
    const list = groups.get(key(r));
    if (list) list.push(r);
    else groups.set(key(r), [r]);
  }
  return groups;
}

/** Set kerja satu gerakan dikelompokkan per sesi, urut tanggal. */
export function sessionBests(records: readonly WorkingSetRecord[]): SessionBest[] {
  const result: SessionBest[] = [];
  for (const [sessionId, list] of groupBy(records, (r) => r.sessionId)) {
    const sets = list.map(({ weightKg, reps, rir }) => ({ weightKg, reps, rir }));
    const best = bestSet(sets);
    const first = list[0];
    if (!best || !first) continue;
    result.push({ sessionId, logDate: first.logDate, sets, best, e1rmKg: e1rmOf(best) });
  }
  return result.sort((a, b) => a.logDate.localeCompare(b.logDate));
}

/** 1RM estimasi terbaik per tanggal (docs/sains-latihan/02-kekuatan-dan-progresi.md §1). */
export function e1rmSeries(records: readonly WorkingSetRecord[]): E1rmPoint[] {
  const byDate = new Map<string, number>();
  for (const s of sessionBests(records)) {
    if (s.e1rmKg === null) continue;
    byDate.set(s.logDate, Math.max(byDate.get(s.logDate) ?? 0, s.e1rmKg));
  }
  return [...byDate].map(([logDate, e1rmKg]) => ({ logDate, e1rmKg }));
}

/**
 * Semua rekor pribadi sepanjang riwayat, urut waktu.
 * Aturannya sama dengan ringkasan sesi: set terbaik sesi dibanding semua sesi sebelumnya.
 */
export function prTimeline(records: readonly WorkingSetRecord[]): PrEvent[] {
  const events: PrEvent[] = [];
  for (const [exerciseId, list] of groupBy(records, (r) => r.exerciseId)) {
    const history: SetResult[] = [];
    for (const session of sessionBests(list)) {
      const kinds = detectPersonalRecord(history, session.best);
      if (kinds.length > 0) {
        events.push({
          exerciseId,
          sessionId: session.sessionId,
          logDate: session.logDate,
          weightKg: session.best.weightKg,
          reps: session.best.reps,
          e1rmKg: session.e1rmKg,
          kinds,
        });
      }
      history.push(...session.sets);
    }
  }
  return events.sort((a, b) => a.logDate.localeCompare(b.logDate));
}

/** Tren 1RM estimasi satu gerakan sejak `fromDate`. */
export function exerciseTrend(
  exerciseId: string,
  records: readonly WorkingSetRecord[],
  fromDate: string,
): ExerciseTrend {
  const all = e1rmSeries(records);
  const points = all.filter((p) => p.logDate >= fromDate);
  const first = points[0];
  const last = points.at(-1);
  const sessionsInRange = records.filter((r) => r.logDate >= fromDate).map((r) => r.sessionId);
  return {
    exerciseId,
    sessionCount: new Set(sessionsInRange).size,
    points,
    currentE1rmKg: all.at(-1)?.e1rmKg ?? null,
    changeKg: first && last && points.length >= 2 ? last.e1rmKg - first.e1rmKg : null,
  };
}
