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
import type { BodyMetric, ProgramBundle } from '@/domain/repositories';
import { TEST_EXERCISES } from '@/domain/testing/exercises';
import type { AppDeps } from '../deps';

export interface InMemoryState {
  profile: UserProfile | null;
  conditions: Map<string, HealthCondition>;
  equipment: Equipment[];
  inventory: PlateInventory;
  programs: ProgramBundle[];
  bodyMetrics: BodyMetric[];
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
    },
    bodyMetrics: {
      add: async (m) => void state.bodyMetrics.push(m),
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
    tx: { run: (work) => work() },
    platform: { requestPersistentStorage: async () => true },
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
