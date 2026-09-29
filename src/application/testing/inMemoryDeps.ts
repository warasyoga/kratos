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
import type { UnlockedAchievement } from '@/domain/achievements/rules';
import type { BackupData } from '@/domain/backup/backup';
import type { NutritionLog, SavedMeal, WaterLog } from '@/domain/nutrition/intake';
import type { ProgressPhoto } from '@/domain/progress/photo';
import { DEFAULT_REMINDERS, type ReminderSettings } from '@/domain/reminders/reminders';
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
  foods: NutritionLog[];
  water: WaterLog[];
  meals: SavedMeal[];
  achievements: UnlockedAchievement[];
  reminders: ReminderSettings;
  lastBackupAt: number | null;
  custom: Map<string, { exercise: Exercise; note?: string }>;
}

export function createInMemoryDeps(
  options: { clock?: Clock; library?: readonly Exercise[] } = {},
): AppDeps & { state: InMemoryState } {
  const builtIn = options.library ?? TEST_EXERCISES;
  const library = () => [...builtIn, ...[...custom.values()].map((c) => c.exercise)];
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
    foods: [],
    water: [],
    meals: [],
    achievements: [],
    reminders: DEFAULT_REMINDERS,
    lastBackupAt: null,
    custom: new Map(),
  };
  const custom = state.custom;
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
      list: async () => library(),
      get: async (id) => library().find((e) => e.id === id) ?? null,
      getGuide: async (id) => {
        const own = custom.get(id);
        if (own) {
          return own.note ? { exerciseId: id, instructions: [own.note], commonMistakes: [] } : null;
        }
        return {
          exerciseId: id,
          instructions: ['Langkah 1', 'Langkah 2'],
          commonMistakes: ['Kesalahan'],
        };
      },
      saveCustom: async (exercise, note) =>
        void custom.set(exercise.id, { exercise, ...(note && { note }) }),
      removeCustom: async (id) => void custom.delete(id),
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
      listSince: async (from) => state.checkIns.filter((c) => c.logDate >= from),
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
          const { sessionId, exerciseId, weightKg, reps, rir, completedAt } = log;
          return [
            {
              sessionId,
              logDate,
              exerciseId,
              weightKg,
              reps,
              completedAt,
              ...(rir !== undefined && { rir }),
            },
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
    nutrition: {
      listFoodsSince: async (from) => state.foods.filter((f) => f.logDate >= from),
      saveFood: async (log) => {
        state.foods = [...state.foods.filter((f) => f.id !== log.id), log].sort(
          (a, b) => a.createdAt - b.createdAt,
        );
      },
      removeFood: async (id) => {
        state.foods = state.foods.filter((f) => f.id !== id);
      },
      listWaterSince: async (from) => state.water.filter((w) => w.logDate >= from),
      addWater: async (log) => void state.water.push(log),
      removeWater: async (id) => {
        state.water = state.water.filter((w) => w.id !== id);
      },
      listMeals: async () => [...state.meals].sort((a, b) => a.label.localeCompare(b.label)),
      saveMeal: async (meal) => {
        state.meals = [...state.meals.filter((m) => m.id !== meal.id), meal];
      },
      removeMeal: async (id) => {
        state.meals = state.meals.filter((m) => m.id !== id);
      },
    },
    achievements: {
      list: async () => [...state.achievements],
      add: async (record) => {
        if (state.achievements.some((a) => a.achievementId === record.achievementId))
          throw new Error('ConstraintError');
        state.achievements.push(record);
      },
    },
    reminders: {
      get: async () => ({ ...state.reminders }),
      save: async (r) => void (state.reminders = { ...r }),
    },
    backup: {
      dump: async () => {
        const data: BackupData = {
          profile: state.profile ? [state.profile] : [],
          healthConditions: [...state.conditions.values()],
          equipment: state.equipment.map((equipment) => ({ equipment, available: true })),
          exercises: [...custom.values()].map(({ exercise, note }) => ({
            ...exercise,
            ...(note && { guide: { instructions: [note], commonMistakes: [] } }),
          })),
          programs: state.programs.map((p) => p.program),
          programDays: state.programs.flatMap((p) => p.days),
          programExercises: state.programs.flatMap((p) => p.exercises),
          bodyMetrics: [...state.bodyMetrics],
          photos: state.photos.map(({ blob: _b, thumb: _t, ...meta }) => meta),
          nutritionLogs: [...state.foods],
          waterLogs: [...state.water],
          savedMeals: [...state.meals],
          suggestions: [...state.suggestions],
          achievements: [...state.achievements],
          checkIns: [...state.checkIns],
          sessions: [...state.sessions],
          setLogs: [...state.setLogs],
          activityLogs: [...state.activities],
          settings: {
            inventory: state.inventory,
            reminders: state.reminders,
            ...(state.lastBackupAt !== null && { lastBackupAt: state.lastBackupAt }),
          },
        };
        return { data: structuredClone(data), photos: [...state.photos] };
      },
      restore: async (data, photos) => {
        state.profile = data.profile[0] ?? null;
        state.conditions = new Map(data.healthConditions.map((c) => [c.id, c]));
        state.equipment = data.equipment.filter((e) => e.available).map((e) => e.equipment);
        custom.clear();
        for (const { guide, ...exercise } of data.exercises)
          custom.set(exercise.id, {
            exercise,
            ...(guide?.instructions[0] && { note: guide.instructions[0] }),
          });
        state.programs = data.programs.map((program) => {
          const days = data.programDays.filter((d) => d.programId === program.id);
          const dayIds = new Set(days.map((d) => d.id));
          return {
            program,
            days,
            exercises: data.programExercises.filter((e) => dayIds.has(e.programDayId)),
          };
        });
        state.bodyMetrics = [...data.bodyMetrics];
        state.photos = [...photos];
        state.foods = [...data.nutritionLogs];
        state.water = [...data.waterLogs];
        state.meals = [...data.savedMeals];
        state.suggestions = [...data.suggestions];
        state.achievements = [...data.achievements];
        state.checkIns = [...data.checkIns];
        state.sessions = [...data.sessions];
        state.setLogs = [...data.setLogs];
        state.activities = [...data.activityLogs];
        state.inventory = data.settings.inventory ?? DEFAULT_INVENTORY;
        state.reminders = data.settings.reminders ?? DEFAULT_REMINDERS;
        state.lastBackupAt = data.settings.lastBackupAt ?? null;
      },
      lastBackupAt: async () => state.lastBackupAt,
      markBackedUp: async (at) => void (state.lastBackupAt = at),
    },
    // Zip tiruan: file → JSON (cukup untuk menguji alur backup tanpa pustaka zip).
    archive: {
      pack: async (files) =>
        new TextEncoder().encode(
          JSON.stringify(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, [...v]]))),
        ),
      unpack: async (bytes) =>
        Object.fromEntries(
          Object.entries(
            JSON.parse(new TextDecoder().decode(bytes)) as Record<string, number[]>,
          ).map(([k, v]) => [k, Uint8Array.from(v)]),
        ),
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
