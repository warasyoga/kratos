/**
 * Repository di memori untuk test application dan UI (tanpa IndexedDB).
 */
import { createFixedClock, type Clock } from '@/domain/common/clock';
import { createSequentialIds } from '@/domain/common/id';
import type { Exercise } from '@/domain/exercise/types';
import { DEFAULT_INVENTORY } from '@/domain/profile/inventory';
import type {
  Equipment,
  HealthCondition,
  PlateInventory,
  UserProfile,
} from '@/domain/profile/types';
import type { ProgressPhoto } from '@/domain/progress/photo';
import type { BodyMetric, ProgramBundle, ResolvedSuggestion } from '@/domain/repositories';
import type { ActivityLog } from '@/domain/today/activity';
import type { CheckIn, SetLog, WorkoutSession } from '@/domain/workout/types';
import { TEST_EXERCISES } from '@/domain/testing/exercises';
import type { AppDeps } from '../deps';

export interface InMemoryState {
  profile: UserProfile | null;
  conditions: Map<string, HealthCondition>;
  equipment: Equipment[];
  inventory: PlateInventory;
  programs: ProgramBundle[];
  bodyMetrics: BodyMetric[];
  suggestions: ResolvedSuggestion[];
  checkIns: CheckIn[];
  sessions: WorkoutSession[];
  setLogs: SetLog[];
  activities: ActivityLog[];
  photos: ProgressPhoto[];
}

export function createInMemoryDeps(
  options: { clock?: Clock; library?: readonly Exercise[] } = {},
): AppDeps & { state: InMemoryState } {
  const library = options.library ?? TEST_EXERCISES;
  const state: InMemoryState = {
    profile: null,
    conditions: new Map(),
    equipment: [],
    inventory: DEFAULT_INVENTORY,
    programs: [],
    bodyMetrics: [],
    suggestions: [],
    checkIns: [],
    sessions: [],
    setLogs: [],
    activities: [],
    photos: [],
  };
  const active = () => state.programs.find((p) => p.program.active) ?? null;

  return {
    state,
    clock: options.clock ?? createFixedClock('2026-09-28T07:00:00'),
    newId: createSequentialIds('id'),
    profiles: {
      get: async () => state.profile,
      save: async (p) => void (state.profile = p),
    },
    conditions: {
      list: async () => [...state.conditions.values()],
      save: async (c) => void state.conditions.set(c.id, c),
      remove: async (id) => void state.conditions.delete(id),
    },
    gym: {
      getEquipment: async () => [...state.equipment],
      setEquipment: async (e) => void (state.equipment = [...e]),
      getInventory: async () => state.inventory,
      setInventory: async (i) => void (state.inventory = i),
    },
    exercises: {
      list: async () => [...library],
      get: async (id) => library.find((e) => e.id === id) ?? null,
      getGuide: async (id) => ({
        exerciseId: id,
        instructions: ['Langkah 1', 'Langkah 2'],
        commonMistakes: ['Kesalahan'],
      }),
    },
    programs: {
      getActive: async () => active(),
      saveAsActive: async (bundle) => {
        state.programs = state.programs.map((p) => ({
          ...p,
          program: { ...p.program, active: false },
        }));
        state.programs.push({ ...bundle, program: { ...bundle.program, active: true } });
      },
      saveExercises: async (exercises) => {
        const current = active();
        if (!current) return;
        const byId = new Map(exercises.map((e) => [e.id, e]));
        current.exercises = current.exercises.map((e) => byId.get(e.id) ?? e);
      },
      update: async (bundle) => {
        state.programs = state.programs.map((p) =>
          p.program.id === bundle.program.id ? structuredClone(bundle) : p,
        );
      },
    },
    bodyMetrics: {
      add: async (m) => void state.bodyMetrics.push(m),
      remove: async (id) => {
        state.bodyMetrics = state.bodyMetrics.filter((m) => m.id !== id);
      },
      list: async () =>
        [...state.bodyMetrics].sort(
          (a, b) => a.logDate.localeCompare(b.logDate) || a.createdAt - b.createdAt,
        ),
      latestWeightKg: async () => {
        // Seri (jam test tetap): catatan yang ditambahkan belakangan menang.
        let latest: BodyMetric | undefined;
        for (const m of state.bodyMetrics) {
          if (m.weightKg === undefined) continue;
          if (
            !latest ||
            m.logDate > latest.logDate ||
            (m.logDate === latest.logDate && m.createdAt >= latest.createdAt)
          ) {
            latest = m;
          }
        }
        return latest?.weightKg ?? null;
      },
    },
    suggestions: {
      listResolved: async () => [...state.suggestions],
      save: async (r) => void state.suggestions.push(r),
    },
    checkIns: {
      getByDate: async (d) => state.checkIns.find((c) => c.logDate === d) ?? null,
      save: async (c) => {
        state.checkIns = [...state.checkIns.filter((x) => x.logDate !== c.logDate), c];
      },
    },
    sessions: {
      getActive: async () => state.sessions.find((s) => s.status === 'active') ?? null,
      get: async (id) => state.sessions.find((s) => s.id === id) ?? null,
      save: async (s) => {
        state.sessions = [...state.sessions.filter((x) => x.id !== s.id), structuredClone(s)];
      },
      delete: async (id) => {
        state.sessions = state.sessions.filter((s) => s.id !== id);
        state.setLogs = state.setLogs.filter((s) => s.sessionId !== id);
      },
      listFinishedSince: async (from) =>
        state.sessions.filter((s) => s.status === 'finished' && s.logDate >= from),
      listSets: async (id) => structuredClone(state.setLogs.filter((s) => s.sessionId === id)),
      saveSets: async (sets) => {
        const ids = new Set(sets.map((s) => s.id));
        state.setLogs = [
          ...state.setLogs.filter((s) => !ids.has(s.id)),
          ...structuredClone([...sets]),
        ];
      },
      deleteSets: async (ids) => {
        state.setLogs = state.setLogs.filter((s) => !ids.includes(s.id));
      },
      exerciseHistory: async (exerciseId, limit) =>
        state.sessions
          .filter((s) => s.status === 'finished')
          .sort((a, b) => b.startedAt - a.startedAt)
          .map((session) => ({
            sessionId: session.id,
            logDate: session.logDate,
            readiness: session.readiness,
            sets: state.setLogs
              .filter(
                (l) =>
                  l.sessionId === session.id &&
                  l.exerciseId === exerciseId &&
                  l.kind === 'working' &&
                  l.completedAt !== undefined,
              )
              .sort((a, b) => a.setNumber - b.setNumber)
              .map(({ weightKg, reps, rir }) => ({
                weightKg,
                reps,
                ...(rir !== undefined && { rir }),
              })),
          }))
          .filter((h) => h.sets.length > 0)
          .slice(0, limit),
      workingSetsSince: async (from) => {
        const dateOf = new Map(
          state.sessions
            .filter((s) => s.status === 'finished' && s.logDate >= from)
            .map((s) => [s.id, s.logDate]),
        );
        return state.setLogs.flatMap((log) => {
          const logDate = dateOf.get(log.sessionId);
          if (log.kind !== 'working' || log.completedAt === undefined || !logDate) return [];
          const { sessionId, exerciseId, weightKg, reps, rir } = log;
          return [
            { sessionId, logDate, exerciseId, weightKg, reps, ...(rir !== undefined && { rir }) },
          ];
        });
      },
    },
    activities: {
      listSince: async (from) => state.activities.filter((a) => a.logDate >= from),
      add: async (a) => void state.activities.push(a),
      remove: async (id) => {
        state.activities = state.activities.filter((a) => a.id !== id);
      },
    },
    photos: {
      list: async () =>
        [...state.photos].sort(
          (a, b) => b.logDate.localeCompare(a.logDate) || b.createdAt - a.createdAt,
        ),
      add: async (p) => void state.photos.push(p),
      remove: async (id) => {
        state.photos = state.photos.filter((p) => p.id !== id);
      },
    },
    tx: { run: (work) => work() },
    platform: {
      requestPersistentStorage: async () => true,
      // Tanpa canvas di test: salin isi file sebagai JPEG.
      resizeImage: async (file) => new Blob([file], { type: 'image/jpeg' }),
    },
  };
}

/** Jawaban onboarding lengkap untuk profil contoh docs. */
export const EXAMPLE_ONBOARDING = {
  name: 'Aris',
  sex: 'male',
  birthDate: '2002-05-10',
  heightCm: 175,
  weightKg: 68.4,
  experience: 'beginner',
  activityLevel: 'moderate',
  trainingDays: ['mon', 'tue', 'thu', 'fri'],
  equipment: [
    'barbell',
    'dumbbell',
    'squat_rack',
    'bench',
    'cable',
    'leg_press',
    'smith',
    'pullup_bar',
    'hack_squat',
    'leg_curl',
    'leg_extension',
    'chest_press_machine',
    'lat_pulldown',
    'ez_bar',
    'landmine',
    'trap_bar',
  ],
  conditions: [],
  parq: {
    heart_condition: false,
    chest_pain: false,
    dizziness: false,
    chronic_condition: false,
    medication: false,
    bone_joint: false,
    supervised_only: false,
  },
};
