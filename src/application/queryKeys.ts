/**
 * Kunci cache TanStack Query untuk query di Services. Setelah mutasi, UI meng-invalidate kunci terkait.
 */
export const queryKeys = {
  profileOverview: ['profile', 'overview'] as const,
  activeProgram: ['program', 'active'] as const,
  exercises: ['catalog', 'exercises'] as const,
  catalog: ['catalog', 'list'] as const,
  /** Awalan semua query perpustakaan gerakan. */
  catalogAll: ['catalog'] as const,
  exerciseDetail: (id: string) => ['catalog', 'detail', id] as const,
  substitutes: (programExerciseId: string) =>
    ['program', 'substitutes', programExerciseId] as const,
  suggestions: ['program', 'suggestions'] as const,
  checkInToday: ['checkin', 'today'] as const,
  todayPlan: ['today', 'plan'] as const,
  inventory: ['gym', 'inventory'] as const,
  activeSession: ['workout', 'active'] as const,
  session: (id: string) => ['workout', 'session', id] as const,
  /** Awalan semua query progres, untuk dimuat ulang setelah latihan/penimbangan. */
  progress: ['progress'] as const,
  progressStrength: (range: string) => ['progress', 'strength', range] as const,
  progressExercise: (id: string) => ['progress', 'exercise', id] as const,
  progressBody: (range: string) => ['progress', 'body', range] as const,
  progressVolume: (range: string) => ['progress', 'volume', range] as const,
  photos: ['progress', 'photos'] as const,
  muscles: ['progress', 'muscles'] as const,
  nutritionDay: ['nutrition', 'day'] as const,
  reminders: ['reminders'] as const,
  /** Awalan lencana: dicek ulang setelah latihan, nutrisi, ukuran, dan foto. */
  achievements: ['achievements'] as const,
  achievementList: ['achievements', 'list'] as const,
  achievementSync: ['achievements', 'sync'] as const,
  evaluationDue: ['achievements', 'evaluation-due'] as const,
  evaluations: ['achievements', 'evaluations'] as const,
  evaluation: (key: string) => ['achievements', 'evaluation', key] as const,
};
