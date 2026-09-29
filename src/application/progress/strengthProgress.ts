import { toLocalDate } from '@/domain/common/clock';
import { isLoaded, type Exercise } from '@/domain/exercise/types';
import { rangeStart, type ProgressRange } from '@/domain/progress/range';
import {
  exerciseTrend,
  e1rmSeries,
  prTimeline,
  sessionBests,
  type E1rmPoint,
  type ExerciseTrend,
  type PrEvent,
  type SessionBest,
} from '@/domain/progress/strength';
import type { WorkingSetRecord } from '@/domain/workout/types';
import type { AppDeps } from '../deps';

/** Tanggal paling awal untuk membaca seluruh riwayat. */
export const ALL_TIME = '0000-01-01';
const RECENT_PR_LIMIT = 5;

export interface PrView extends PrEvent {
  exercise: Exercise;
}

export interface StrengthProgress {
  fromDate: string;
  /** Rekor pribadi di rentang, terbaru lebih dulu. */
  recentPrs: PrView[];
  /** Gerakan berbeban yang dikerjakan di rentang, paling sering lebih dulu. */
  exercises: (ExerciseTrend & { exercise: Exercise })[];
}

export interface ExerciseProgress {
  exercise: Exercise;
  points: E1rmPoint[];
  bestE1rmKg: number | null;
  prs: PrEvent[];
  /** Sesi terbaru lebih dulu. */
  sessions: SessionBest[];
}

function groupByExercise(records: readonly WorkingSetRecord[]) {
  const groups = new Map<string, WorkingSetRecord[]>();
  for (const r of records) groups.set(r.exerciseId, [...(groups.get(r.exerciseId) ?? []), r]);
  return groups;
}

/** Progres kekuatan: 1RM estimasi dan rekor pribadi. docs/fitur/07-progres.md "Kekuatan" */
export function makeStrengthProgress(deps: AppDeps) {
  async function loadedRecords() {
    const [records, library] = await Promise.all([
      deps.sessions.workingSetsSince(ALL_TIME),
      deps.exercises.list(),
    ]);
    const loaded = new Map(library.filter(isLoaded).map((e) => [e.id, e]));
    return { records: records.filter((r) => loaded.has(r.exerciseId)), loaded };
  }

  return {
    async strength(range: ProgressRange): Promise<StrengthProgress> {
      const { records, loaded } = await loadedRecords();
      const today = toLocalDate(deps.clock.now());
      const earliest = records.reduce<string | undefined>(
        (min, r) => (min === undefined || r.logDate < min ? r.logDate : min),
        undefined,
      );
      const fromDate = rangeStart(range, today, earliest);

      const withExercise = <T extends { exerciseId: string }>(item: T) => {
        const exercise = loaded.get(item.exerciseId);
        return exercise ? [{ ...item, exercise }] : [];
      };
      const recentPrs = prTimeline(records)
        .filter((pr) => pr.logDate >= fromDate)
        .reverse()
        .slice(0, RECENT_PR_LIMIT)
        .flatMap(withExercise);
      const exercises = [...groupByExercise(records)]
        .map(([id, list]) => exerciseTrend(id, list, fromDate))
        .filter((trend) => trend.sessionCount > 0)
        .flatMap(withExercise)
        .sort(
          (a, b) =>
            b.sessionCount - a.sessionCount || a.exercise.name.localeCompare(b.exercise.name),
        );
      return { fromDate, recentPrs, exercises };
    },

    async exercise(exerciseId: string): Promise<ExerciseProgress | null> {
      const exercise = await deps.exercises.get(exerciseId);
      if (!exercise) return null;
      const records = (await deps.sessions.workingSetsSince(ALL_TIME)).filter(
        (r) => r.exerciseId === exerciseId,
      );
      const points = e1rmSeries(records);
      return {
        exercise,
        points,
        bestE1rmKg: points.length > 0 ? Math.max(...points.map((p) => p.e1rmKg)) : null,
        prs: prTimeline(records).reverse(),
        sessions: sessionBests(records).reverse(),
      };
    },
  };
}
