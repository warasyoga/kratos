import type { Exercise, ExerciseGuide } from '@/domain/exercise/types';
import { DEFAULT_INVENTORY } from '@/domain/profile/inventory';
import type {
  Equipment,
  HealthCondition,
  PlateInventory,
  UserProfile,
} from '@/domain/profile/types';
import type { ProgramExercise } from '@/domain/program/types';
import type {
  BodyMetric,
  BodyMetricRepository,
  ExerciseRepository,
  GymRepository,
  HealthConditionRepository,
  ProfileRepository,
  ProgramBundle,
  ProgramRepository,
  TransactionRunner,
} from '@/domain/repositories';
import type { ExerciseRow, KratosDatabase } from '../db/database';

export class DexieProfileRepository implements ProfileRepository {
  constructor(private readonly db: KratosDatabase) {}

  async get(): Promise<UserProfile | null> {
    return (await this.db.profile.get('me')) ?? null;
  }

  async save(profile: UserProfile): Promise<void> {
    await this.db.profile.put(profile);
  }
}

export class DexieHealthConditionRepository implements HealthConditionRepository {
  constructor(private readonly db: KratosDatabase) {}

  list(): Promise<HealthCondition[]> {
    return this.db.healthConditions.orderBy('id').toArray();
  }

  async save(condition: HealthCondition): Promise<void> {
    await this.db.healthConditions.put(condition);
  }

  async remove(id: string): Promise<void> {
    await this.db.healthConditions.delete(id);
  }
}

export class DexieGymRepository implements GymRepository {
  constructor(private readonly db: KratosDatabase) {}

  async getEquipment(): Promise<Equipment[]> {
    const rows = await this.db.equipment.toArray();
    return rows.filter((r) => r.available).map((r) => r.equipment);
  }

  async setEquipment(equipment: readonly Equipment[]): Promise<void> {
    await this.db.transaction('rw', this.db.equipment, async () => {
      await this.db.equipment.clear();
      await this.db.equipment.bulkPut(equipment.map((e) => ({ equipment: e, available: true })));
    });
  }

  async getInventory(): Promise<PlateInventory> {
    return (await this.db.settings.get('settings'))?.inventory ?? DEFAULT_INVENTORY;
  }

  async setInventory(inventory: PlateInventory): Promise<void> {
    const settings = (await this.db.settings.get('settings')) ?? { id: 'settings' as const };
    await this.db.settings.put({ ...settings, inventory });
  }
}

function toExercise({ guide: _guide, ...exercise }: ExerciseRow): Exercise {
  return exercise;
}

export class DexieExerciseRepository implements ExerciseRepository {
  constructor(private readonly db: KratosDatabase) {}

  async list(): Promise<Exercise[]> {
    return (await this.db.exercises.toArray()).map(toExercise);
  }

  async get(id: string): Promise<Exercise | null> {
    const row = await this.db.exercises.get(id);
    return row ? toExercise(row) : null;
  }

  async getGuide(id: string): Promise<ExerciseGuide | null> {
    const row = await this.db.exercises.get(id);
    return row?.guide ? { exerciseId: id, ...row.guide } : null;
  }
}

export class DexieProgramRepository implements ProgramRepository {
  constructor(private readonly db: KratosDatabase) {}

  async getActive(): Promise<ProgramBundle | null> {
    const program = (await this.db.programs.toArray()).find((p) => p.active);
    if (!program) return null;
    const days = await this.db.programDays.where('programId').equals(program.id).sortBy('order');
    const exercises = await this.db.programExercises
      .where('programDayId')
      .anyOf(days.map((d) => d.id))
      .toArray();
    exercises.sort((a, b) => a.order - b.order);
    return { program, days, exercises };
  }

  async saveAsActive({ program, days, exercises }: ProgramBundle): Promise<void> {
    const { db } = this;
    await db.transaction('rw', db.programs, db.programDays, db.programExercises, async () => {
      const others = (await db.programs.toArray()).filter((p) => p.active && p.id !== program.id);
      await db.programs.bulkPut(others.map((p) => ({ ...p, active: false })));
      await db.programs.put({ ...program, active: true });
      await db.programDays.bulkPut(days);
      await db.programExercises.bulkPut(exercises);
    });
  }

  async saveExercises(exercises: readonly ProgramExercise[]): Promise<void> {
    await this.db.programExercises.bulkPut([...exercises]);
  }
}

export class DexieBodyMetricRepository implements BodyMetricRepository {
  constructor(private readonly db: KratosDatabase) {}

  async add(metric: BodyMetric): Promise<void> {
    await this.db.bodyMetrics.put(metric);
  }

  async latestWeightKg(): Promise<number | null> {
    const withWeight = (await this.db.bodyMetrics.toArray()).filter(
      (m) => m.weightKg !== undefined,
    );
    withWeight.sort((a, b) => b.logDate.localeCompare(a.logDate) || b.createdAt - a.createdAt);
    return withWeight[0]?.weightKg ?? null;
  }
}

export class DexieTransactionRunner implements TransactionRunner {
  constructor(private readonly db: KratosDatabase) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.db.transaction('rw', this.db.tables, work);
  }
}
