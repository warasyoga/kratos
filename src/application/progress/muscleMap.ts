import { toLocalDate } from '@/domain/common/clock';
import { addDays, startOfWeek } from '@/domain/common/weekday';
import { completedSetsPerMuscle } from '@/domain/progress/volume';
import { muscleRecovery, type MuscleRecovery } from '@/domain/recovery/muscleRecovery';
import type { AppDeps } from '../deps';

/** Riwayat yang cukup untuk waktu pulih terlama (72 jam). */
const RECOVERY_LOOKBACK_DAYS = 4;

export interface MuscleMapEntry extends MuscleRecovery {
  setsThisWeek: number;
}

/** Status pemulihan dan set minggu ini untuk setiap otot. docs/fitur/12-peta-otot.md */
export function makeMuscleMap(deps: AppDeps) {
  return async function muscles(): Promise<MuscleMapEntry[]> {
    const now = deps.clock.now();
    const today = toLocalDate(now);
    const monday = startOfWeek(today);
    const recoveryFrom = addDays(today, -RECOVERY_LOOKBACK_DAYS);
    const from = monday < recoveryFrom ? monday : recoveryFrom;
    const [records, library] = await Promise.all([
      deps.sessions.workingSetsSince(from),
      deps.exercises.list(),
    ]);
    const byId = new Map(library.map((e) => [e.id, e]));
    const exerciseById = (id: string) => byId.get(id);
    const week = completedSetsPerMuscle(
      records.filter((r) => r.logDate >= monday),
      exerciseById,
    );
    return muscleRecovery(records, exerciseById, now).map((m) => ({
      ...m,
      setsThisWeek: week.get(m.muscle) ?? 0,
    }));
  };
}
