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
  CheckInRepository,
  ExerciseHistoryEntry,
  ExerciseRepository,
  GymRepository,
  HealthConditionRepository,
  ProfileRepository,
  ProgramBundle,
  ProgramRepository,
  ResolvedSuggestion,
  SessionRepository,
  SuggestionRepository,
  TransactionRunner,
} from '@/domain/repositories';
import type { CheckIn, SetLog, WorkoutSession } from '@/domain/workout/types';
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

  async update({ program, days, exercises }: ProgramBundle): Promise<void> {
    const { db } = this;
    await db.transaction('rw', db.programs, db.programDays, db.programExercises, async () => {
      const dayIds = (await db.programDays.where('programId').equals(program.id).toArray()).map(
        (d) => d.id,
      );
      const existing = await db.programExercises.where('programDayId').anyOf(dayIds).primaryKeys();
      const keep = new Set(exercises.map((e) => e.id));
      await db.programExercises.bulkDelete(existing.filter((id) => !keep.has(id)));
      await db.programs.put(program);
      await db.programDays.bulkPut(days);
      await db.programExercises.bulkPut(exercises);
    });
  }
}

export class DexieSuggestionRepository implements SuggestionRepository {
  constructor(private readonly db: KratosDatabase) {}

  listResolved(): Promise<ResolvedSuggestion[]> {
    return this.db.suggestions.toArray();
  }

  async save(record: ResolvedSuggestion): Promise<void> {
    await this.db.suggestions.put(record);
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

export class DexieCheckInRepository implements CheckInRepository {
  constructor(private readonly db: KratosDatabase) {}

  async getByDate(logDate: string): Promise<CheckIn | null> {
    return (await this.db.checkIns.where('logDate').equals(logDate).first()) ?? null;
  }

  async save(checkIn: CheckIn): Promise<void> {
    const { db } = this;
    await db.transaction('rw', db.checkIns, async () => {
      await db.checkIns.where('logDate').equals(checkIn.logDate).delete();
      await db.checkIns.put(checkIn);
    });
  }
}

export class DexieSessionRepository implements SessionRepository {
  constructor(private readonly db: KratosDatabase) {}

  async getActive(): Promise<WorkoutSession | null> {
    return (await this.db.sessions.where('status').equals('active').first()) ?? null;
  }

  async get(id: string): Promise<WorkoutSession | null> {
    return (await this.db.sessions.get(id)) ?? null;
  }

  async save(session: WorkoutSession): Promise<void> {
    await this.db.sessions.put(session);
  }

  async delete(id: string): Promise<void> {
    const { db } = this;
    await db.transaction('rw', db.sessions, db.setLogs, async () => {
      await db.setLogs.where('sessionId').equals(id).delete();
      await db.sessions.delete(id);
    });
  }

  listSets(sessionId: string): Promise<SetLog[]> {
    return this.db.setLogs.where('sessionId').equals(sessionId).toArray();
  }

  async saveSets(sets: readonly SetLog[]): Promise<void> {
    await this.db.setLogs.bulkPut([...sets]);
  }

  async deleteSets(ids: readonly string[]): Promise<void> {
    await this.db.setLogs.bulkDelete([...ids]);
  }

  async exerciseHistory(exerciseId: string, limit: number): Promise<ExerciseHistoryEntry[]> {
    const logs = (await this.db.setLogs.where('exerciseId').equals(exerciseId).toArray()).filter(
      (s) => s.kind === 'working' && s.completedAt !== undefined,
    );
    const sessionIds = [...new Set(logs.map((s) => s.sessionId))];
    const sessions = (await this.db.sessions.bulkGet(sessionIds)).filter(
      (s): s is WorkoutSession => s !== undefined && s.status === 'finished',
    );
    return sessions
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit)
      .map((session) => ({
        sessionId: session.id,
        logDate: session.logDate,
        readiness: session.readiness,
        sets: logs
          .filter((s) => s.sessionId === session.id)
          .sort((a, b) => a.setNumber - b.setNumber)
          .map(({ weightKg, reps, rir }) => ({
            weightKg,
            reps,
            ...(rir !== undefined && { rir }),
          })),
      }));
  }
}

export class DexieTransactionRunner implements TransactionRunner {
  constructor(private readonly db: KratosDatabase) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.db.transaction('rw', this.db.tables, work);
  }
}
