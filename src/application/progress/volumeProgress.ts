import { toLocalDate } from '@/domain/common/clock';
import { startOfWeek } from '@/domain/common/weekday';
import type { Muscle } from '@/domain/exercise/types';
import { classifyVolume, MAJOR_MUSCLES, type VolumeStatus } from '@/domain/program/volume';
import { rangeStart, weekStarts, type ProgressRange } from '@/domain/progress/range';
import {
  completedSetsPerMuscle,
  weeklyAttendance,
  weeklyTonnage,
  type WeekAttendance,
  type WeekTonnage,
} from '@/domain/progress/volume';
import type { AppDeps } from '../deps';
import { makeGetActiveProgram } from '../program/getActiveProgram';

export interface MuscleWeekVolume {
  muscle: Muscle;
  doneSets: number;
  plannedSets: number;
  status: VolumeStatus;
}

export interface VolumeProgress {
  fromDate: string;
  /** Set kerja per otot besar minggu ini vs rencana program. */
  thisWeek: MuscleWeekVolume[];
  tonnage: WeekTonnage[];
  attendance: WeekAttendance[];
  attendanceTotal: { done: number; scheduled: number };
}

/** Volume per otot, tonase, dan kehadiran. docs/fitur/07-progres.md "Volume" */
export function makeVolumeProgress(deps: AppDeps) {
  const getProgram = makeGetActiveProgram(deps);

  return async function volume(range: ProgressRange): Promise<VolumeProgress | null> {
    const program = await getProgram();
    if (!program) return null;
    const today = toLocalDate(deps.clock.now());
    const programStart = program.program.startDate;
    const fromDate = rangeStart(range, today, programStart);

    const [records, finished, library] = await Promise.all([
      deps.sessions.workingSetsSince(fromDate),
      deps.sessions.listFinishedSince(fromDate),
      deps.exercises.list(),
    ]);
    const byId = new Map(library.map((e) => [e.id, e]));
    const monday = startOfWeek(today);
    const done = completedSetsPerMuscle(
      records.filter((r) => r.logDate >= monday),
      (id) => byId.get(id),
    );
    const weeks = weekStarts(fromDate, today);
    const attendance = weeklyAttendance(
      finished.map((s) => s.logDate),
      program.days.map((d) => d.day.weekday),
      weeks,
      today,
      programStart,
    );

    return {
      fromDate,
      thisWeek: MAJOR_MUSCLES.map((muscle) => {
        const doneSets = done.get(muscle) ?? 0;
        return {
          muscle,
          doneSets,
          plannedSets: program.weeklyVolume.find((v) => v.muscle === muscle)?.sets ?? 0,
          status: classifyVolume(doneSets),
        };
      }),
      tonnage: weeklyTonnage(records, weeks),
      attendance,
      attendanceTotal: attendance.reduce(
        (sum, w) => ({ done: sum.done + w.done, scheduled: sum.scheduled + w.scheduled }),
        { done: 0, scheduled: 0 },
      ),
    };
  };
}
