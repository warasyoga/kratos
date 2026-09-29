import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import { addDays, startOfWeek, weekdayOf, type Weekday } from '@/domain/common/weekday';
import {
  aerobicMinutes,
  RECOVERY_PLAN,
  type ActivityKind,
  type ActivityLog,
} from '@/domain/today/activity';
import {
  missedDays,
  nextScheduledDay,
  streakWeeks,
  weekOverview,
  type ScheduledDay,
  type WeekDayView,
} from '@/domain/today/week';
import { blockWeek, programWeek } from '@/domain/trainer/deload';
import { MESOCYCLE_WEEKS } from '@/domain/standards';
import type { CheckIn } from '@/domain/workout/types';
import type { Muscle } from '@/domain/exercise/types';
import type { AppDeps } from '../deps';
import { makeMuscleMap } from '../progress/muscleMap';
import { measurementDue } from '@/domain/progress/body';
import { makeGetProfileOverview } from '../profile/getProfileOverview';
import { makeGetActiveProgram, type ProgramDayView } from '../program/getActiveProgram';

/** Riwayat yang dibaca untuk streak (minggu). */
const STREAK_LOOKBACK_WEEKS = 26;

export interface TodayPlan {
  date: string;
  weekday: Weekday;
  kind: 'gym' | 'recovery';
  day?: ProgramDayView;
  /** Sesi hari ini yang sudah selesai. */
  doneToday?: { sessionId: string; dayLabel: string };
  hasActiveSession: boolean;
  checkIn: CheckIn | null;
  programWeek: number;
  blockWeek: number;
  isDeloadWeek: boolean;
  week: WeekDayView[];
  streakWeeks: number;
  /** Latihan terlewat minggu ini + otot utamanya yang baru dilatih (< 50% waktu pulih). */
  missed: (ScheduledDay & { recovering: Muscle[] })[];
  /** Otot yang belum pulih penuh (baru dilatih / pulih sebagian). */
  recoveringMuscles: { muscle: Muscle; status: 'partial' | 'recent' }[];
  /** Hari pemulihan dan lingkar tubuh belum diukur ≥ 14 hari (banner). */
  measurementDue: boolean;
  next?: ScheduledDay;
  activitiesToday: ActivityLog[];
  aerobicMinutesThisWeek: number;
}

/** Isi layar Hari Ini dan pencatatan aktivitas pemulihan. docs/fitur/02-hari-ini.md */
export function makeTodayUseCases(deps: AppDeps) {
  const getProgram = makeGetActiveProgram(deps);
  const getOverview = makeGetProfileOverview(deps);
  const getMuscles = makeMuscleMap(deps);

  async function plan(): Promise<TodayPlan | null> {
    const today = toLocalDate(deps.clock.now());
    const monday = startOfWeek(today);
    const [program, overview, active, checkIn, finished, activities, muscles, metrics] =
      await Promise.all([
        getProgram(),
        getOverview(),
        deps.sessions.getActive(),
        deps.checkIns.getByDate(today),
        deps.sessions.listFinishedSince(addDays(monday, -7 * STREAK_LOOKBACK_WEEKS)),
        deps.activities.listSince(monday),
        getMuscles(),
        deps.bodyMetrics.list(),
      ]);
    if (!program || !overview) return null;

    const schedule: ScheduledDay[] = program.days.map((d) => ({
      programDayId: d.day.id,
      label: d.day.label,
      weekday: d.day.weekday,
    }));
    const weekday = weekdayOf(today);
    const day = program.days.find((d) => d.day.weekday === weekday);
    const refs = finished.map((s) => ({ programDayId: s.programDayId, logDate: s.logDate }));
    const done = finished.find((s) => s.logDate === today);
    const week = programWeek(program.program.startDate, today);
    const next = nextScheduledDay(schedule, today);

    return {
      date: today,
      weekday,
      kind: day ? 'gym' : 'recovery',
      ...(day && { day }),
      ...(done && { doneToday: { sessionId: done.id, dayLabel: done.dayLabel } }),
      hasActiveSession: active !== null,
      checkIn,
      programWeek: week,
      blockWeek: blockWeek(week),
      isDeloadWeek: blockWeek(week) === MESOCYCLE_WEEKS,
      week: weekOverview(schedule, refs, today),
      streakWeeks: streakWeeks(refs, schedule.length, today),
      missed: missedDays(schedule, refs, today).map((d) => ({
        ...d,
        recovering: [
          ...new Set(
            (program.days.find((p) => p.day.id === d.programDayId)?.exercises ?? []).flatMap(
              (e) => e.exercise.primaryMuscles,
            ),
          ),
        ].filter((m) => muscles.find((x) => x.muscle === m)?.status === 'recent'),
      })),
      measurementDue: !day && measurementDue(metrics, today),
      recoveringMuscles: muscles.flatMap((m) =>
        m.status === 'fresh' ? [] : [{ muscle: m.muscle, status: m.status }],
      ),
      ...(next && { next }),
      activitiesToday: activities.filter((a) => a.logDate === today),
      aerobicMinutesThisWeek: aerobicMinutes(activities),
    };
  }

  return {
    plan,

    /** Catat aktivitas pemulihan sesuai rencana (jalan kaki 35 mnt, mobilitas 10 mnt). */
    async logActivity(kind: ActivityKind): Promise<Result<void>> {
      const planned = RECOVERY_PLAN.find((p) => p.kind === kind);
      if (!planned) return err({ code: 'not_found', message: 'Aktivitas tidak dikenal' });
      const now = deps.clock.now();
      await deps.activities.add({
        id: deps.newId(),
        logDate: toLocalDate(now),
        kind,
        minutes: planned.minutes,
        createdAt: now,
      });
      return ok(undefined);
    },

    async removeActivity(id: string): Promise<Result<void>> {
      await deps.activities.remove(id);
      return ok(undefined);
    },
  };
}
