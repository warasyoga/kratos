import type { Clock } from '@/domain/common/clock';
import type { IdGenerator } from '@/domain/common/id';
import type {
  ActivityRepository,
  BodyMetricRepository,
  CheckInRepository,
  ExerciseRepository,
  GymRepository,
  HealthConditionRepository,
  ProfileRepository,
  ProgramRepository,
  SessionRepository,
  SuggestionRepository,
  TransactionRunner,
} from '@/domain/repositories';

/** Semua port yang dibutuhkan use case. Dirakit di src/app/container.ts, atau versi memori di test. */
export interface AppDeps {
  clock: Clock;
  newId: IdGenerator;
  profiles: ProfileRepository;
  conditions: HealthConditionRepository;
  gym: GymRepository;
  exercises: ExerciseRepository;
  programs: ProgramRepository;
  bodyMetrics: BodyMetricRepository;
  suggestions: SuggestionRepository;
  checkIns: CheckInRepository;
  sessions: SessionRepository;
  activities: ActivityRepository;
  tx: TransactionRunner;
  platform: {
    requestPersistentStorage(): Promise<boolean>;
  };
}
