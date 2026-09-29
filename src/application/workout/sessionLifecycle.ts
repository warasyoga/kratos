import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import { weekdayOf } from '@/domain/common/weekday';
import type { Exercise } from '@/domain/exercise/types';
import { isLoaded } from '@/domain/exercise/types';
import type { PlateInventory } from '@/domain/profile/types';
import type { ProgramDay, ProgramExercise } from '@/domain/program/types';
import type { ExerciseHistoryEntry } from '@/domain/repositories';
import { bestSet, detectPersonalRecord } from '@/domain/strength/personalRecord';
import { decideNextLoad, type LoadDecision } from '@/domain/strength/progression';
import { isScheduledDeloadWeek } from '@/domain/trainer/deload';
import { buildSession } from '@/domain/workout/buildSession';
import { planSession } from '@/domain/workout/planSession';
import {
  durationMinutes,
  isCompletedWorking,
  tonnageOf,
  workingWeightOf,
} from '@/domain/workout/sessionMath';
import type {
  NextLoad,
  SessionExercisePlan,
  SessionPr,
  SessionSummary,
  SetLog,
  SetResult,
  WorkoutSession,
} from '@/domain/workout/types';
import type { AppDeps } from '../deps';

/** Jumlah sesi terakhir yang dipakai progresi (decideNextLoad butuh 2). */
const PROGRESSION_HISTORY = 2;
/** Riwayat untuk deteksi rekor pribadi. */
const PR_HISTORY = 50;
/** Sesi tanpa aktivitas lebih lama dari ini ditandai terbengkalai (docs/fitur/05-mode-latihan.md). */
const STALE_SESSION_MS = 4 * 60 * 60 * 1000;

export interface ActiveExerciseView {
  plan: SessionExercisePlan;
  exercise: Exercise;
  sets: SetLog[];
  /** Set kerja sesi sebelumnya untuk kolom "Sebelumnya". */
  previous: SetResult[];
}

export interface ActiveSessionView {
  session: WorkoutSession;
  exercises: ActiveExerciseView[];
  inventory: PlateInventory;
}

const toResults = (history: readonly ExerciseHistoryEntry[]) =>
  history.map((h) => ({ logDate: h.logDate, readiness: h.readiness, sets: h.sets }));

/** Urutan set dalam satu gerakan: pemanasan dulu, lalu set kerja. */
export function sortSets(sets: readonly SetLog[]): SetLog[] {
  return [...sets].sort(
    (a, b) => (a.kind === b.kind ? 0 : a.kind === 'warmup' ? -1 : 1) || a.setNumber - b.setNumber,
  );
}

/** Mulai, lihat, selesaikan, dan batalkan sesi latihan. docs/fitur/05-mode-latihan.md */
export function makeSessionLifecycle(deps: AppDeps) {
  async function decide(
    pe: ProgramExercise,
    exercise: Exercise,
    inventory: PlateInventory,
    isDeloadWeek: boolean,
  ): Promise<LoadDecision | undefined> {
    if (pe.currentWeightKg === null) return undefined;
    const history = await deps.sessions.exerciseHistory(exercise.id, PROGRESSION_HISTORY);
    return decideNextLoad({
      exercise,
      prescription: pe,
      currentWeightKg: pe.currentWeightKg,
      recentSessions: toResults(history),
      inventory,
      isDeloadWeek,
      progressionLocked: pe.progressionLocked,
    });
  }

  /** Sesi lama tanpa aktivitas ditutup sebagai terbengkalai; set yang tercatat tetap tersimpan. */
  async function closeIfStale(session: WorkoutSession): Promise<boolean> {
    const sets = await deps.sessions.listSets(session.id);
    const lastActivity = Math.max(session.startedAt, ...sets.map((s) => s.completedAt ?? 0));
    if (deps.clock.now() - lastActivity < STALE_SESSION_MS) return false;
    await deps.sessions.deleteSets(
      sets.filter((s) => s.completedAt === undefined).map((s) => s.id),
    );
    await deps.sessions.save({ ...session, status: 'abandoned', finishedAt: lastActivity });
    return true;
  }

  async function getActive(): Promise<ActiveSessionView | null> {
    const session = await deps.sessions.getActive();
    if (!session || (await closeIfStale(session))) return null;
    const [sets, library, inventory] = await Promise.all([
      deps.sessions.listSets(session.id),
      deps.exercises.list(),
      deps.gym.getInventory(),
    ]);
    const byId = new Map(library.map((e) => [e.id, e]));
    const exercises = await Promise.all(
      session.plan.map(async (plan) => {
        const exercise = byId.get(plan.exerciseId);
        if (!exercise) return null;
        const [last] = await deps.sessions.exerciseHistory(exercise.id, 1);
        return {
          plan,
          exercise,
          sets: sortSets(sets.filter((s) => s.programExerciseId === plan.programExerciseId)),
          previous: last?.sets ?? [],
        };
      }),
    );
    return { session, exercises: exercises.filter((e) => e !== null), inventory };
  }

  async function start(
    options: { programDayId?: string; ignoreReadiness?: boolean } = {},
  ): Promise<Result<{ sessionId: string }>> {
    const current = await getActive();
    if (current) return ok({ sessionId: current.session.id });

    const now = deps.clock.now();
    const today = toLocalDate(now);
    const [bundle, library, inventory, checkIn] = await Promise.all([
      deps.programs.getActive(),
      deps.exercises.list(),
      deps.gym.getInventory(),
      deps.checkIns.getByDate(today),
    ]);
    if (!bundle) return err({ code: 'not_found', message: 'Program tidak ditemukan' });
    const day: ProgramDay | undefined = options.programDayId
      ? bundle.days.find((d) => d.id === options.programDayId)
      : bundle.days.find((d) => d.weekday === weekdayOf(today));
    if (!day)
      return err({ code: 'no_workout_today', message: 'Tidak ada latihan terjadwal hari ini' });

    const byId = new Map(library.map((e) => [e.id, e]));
    const isDeloadWeek = isScheduledDeloadWeek(bundle.program.startDate, today);
    const readiness = options.ignoreReadiness ? 'green' : (checkIn?.readiness ?? 'green');

    const programExercises = bundle.exercises
      .filter((pe) => pe.programDayId === day.id)
      .sort((a, b) => a.order - b.order);
    const decisions = new Map<string, LoadDecision>();
    const items = [];
    for (const pe of programExercises) {
      const exercise = byId.get(pe.exerciseId);
      if (!exercise) continue;
      const decision = await decide(pe, exercise, inventory, isDeloadWeek);
      if (decision) decisions.set(pe.id, decision);
      items.push({ programExercise: pe, exercise, ...(decision && { decision }) });
    }

    const plan = planSession({
      items,
      readiness,
      isDeloadWeek,
      painAreas: checkIn?.painAreas ?? [],
      inventory,
    });
    const { session, sets } = buildSession({
      sessionId: deps.newId(),
      programDayId: day.id,
      dayLabel: day.label,
      logDate: today,
      startedAt: now,
      readiness,
      checkInId: checkIn?.id,
      isDeloadWeek,
      plan,
      decisions,
      previousWeights: new Map(programExercises.map((pe) => [pe.id, pe.currentWeightKg])),
      inventory,
      newId: deps.newId,
    });

    await deps.tx.run(async () => {
      await deps.sessions.save(session);
      await deps.sessions.saveSets(sets);
    });
    return ok({ sessionId: session.id });
  }

  /** Rekor pribadi: set terbaik per gerakan dibanding semua sesi sebelumnya. */
  async function findPrs(
    completed: readonly SetLog[],
    byId: Map<string, Exercise>,
    sessionId: string,
  ) {
    const prs: SessionPr[] = [];
    for (const exerciseId of new Set(completed.map((s) => s.exerciseId))) {
      const exercise = byId.get(exerciseId);
      if (!exercise || !isLoaded(exercise)) continue;
      const mine = completed.filter((s) => s.exerciseId === exerciseId);
      const best = bestSet(mine);
      if (!best || best.weightKg <= 0) continue;
      const history = (await deps.sessions.exerciseHistory(exerciseId, PR_HISTORY))
        .filter((h) => h.sessionId !== sessionId)
        .flatMap((h) => h.sets);
      const kinds = detectPersonalRecord(history, best);
      if (kinds.length > 0)
        prs.push({ exerciseId, weightKg: best.weightKg, reps: best.reps, kinds });
    }
    return prs;
  }

  async function finish(): Promise<Result<{ sessionId: string; summary: SessionSummary }>> {
    const session = await deps.sessions.getActive();
    if (!session) return err({ code: 'no_active_session', message: 'Tidak ada sesi aktif' });
    const now = deps.clock.now();
    const [sets, bundle, library, inventory] = await Promise.all([
      deps.sessions.listSets(session.id),
      deps.programs.getActive(),
      deps.exercises.list(),
      deps.gym.getInventory(),
    ]);
    const byId = new Map(library.map((e) => [e.id, e]));
    const completed = sets.filter(isCompletedWorking);
    const prs = await findPrs(completed, byId, session.id);

    // Beban sesi ringan/deload tidak menjadi patokan progresi berikutnya.
    const updatesWeights = session.adjustment === 'none' || session.adjustment === 'reduced';
    const updatedExercises: ProgramExercise[] = [];
    for (const plan of session.plan) {
      const pe = bundle?.exercises.find((e) => e.id === plan.programExerciseId);
      const exercise = byId.get(plan.exerciseId);
      const weight = workingWeightOf(
        completed.filter((s) => s.programExerciseId === plan.programExerciseId),
      );
      if (!pe || !exercise || weight === null || !isLoaded(exercise)) continue;
      if (updatesWeights || pe.currentWeightKg === null)
        updatedExercises.push({ ...pe, currentWeightKg: weight });
    }

    const finished: WorkoutSession = { ...session, status: 'finished', finishedAt: now };
    await deps.tx.run(async () => {
      await deps.sessions.deleteSets(
        sets.filter((s) => s.completedAt === undefined).map((s) => s.id),
      );
      await deps.sessions.save(finished);
      if (updatedExercises.length > 0) await deps.programs.saveExercises(updatedExercises);
    });

    // Keputusan untuk sesi berikutnya dihitung setelah sesi ini masuk riwayat.
    const next: NextLoad[] = [];
    for (const pe of updatedExercises) {
      const exercise = byId.get(pe.exerciseId);
      if (!exercise) continue;
      const decision = await decide(pe, exercise, inventory, false);
      if (!decision) continue;
      next.push({
        exerciseId: exercise.id,
        fromKg: pe.currentWeightKg,
        toKg: decision.weightKg,
        targetReps: decision.targetReps,
        kind: decision.kind,
        reason: decision.reason,
      });
    }

    const summary: SessionSummary = {
      durationMin: durationMinutes(session.startedAt, now),
      workingSets: completed.length,
      tonnageKg: tonnageOf(completed),
      prs,
      next,
    };
    await deps.sessions.save({ ...finished, summary });
    return ok({ sessionId: session.id, summary });
  }

  return {
    getActive,
    start,
    finish,
    async discard(): Promise<Result<void>> {
      const session = await deps.sessions.getActive();
      if (!session) return err({ code: 'no_active_session', message: 'Tidak ada sesi aktif' });
      await deps.sessions.delete(session.id);
      return ok(undefined);
    },
    get: (id: string) => deps.sessions.get(id),
  };
}
