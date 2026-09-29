import type { Clock } from '@/domain/common/clock';
import type { IdGenerator } from '@/domain/common/id';
import type {
  AchievementRepository,
  ActivityRepository,
  BackupRepository,
  BodyMetricRepository,
  CheckInRepository,
  ExerciseRepository,
  GymRepository,
  HealthConditionRepository,
  NutritionRepository,
  PhotoRepository,
  ReminderRepository,
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
  photos: PhotoRepository;
  nutrition: NutritionRepository;
  achievements: AchievementRepository;
  reminders: ReminderRepository;
  backup: BackupRepository;
  /** Pembungkus zip (file → isi). Implementasi dimuat saat dipakai. */
  archive: {
    pack(files: Record<string, Uint8Array>): Promise<Uint8Array>;
    unpack(bytes: Uint8Array): Promise<Record<string, Uint8Array>>;
  };
  tx: TransactionRunner;
  platform: {
    requestPersistentStorage(): Promise<boolean>;
    /** Perkecil gambar ke sisi terpanjang `maxSidePx` dan simpan sebagai JPEG. Gagal → reject. */
    resizeImage(file: Blob, maxSidePx: number, quality: number): Promise<Blob>;
  };
}
