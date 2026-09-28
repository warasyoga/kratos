/**
 * Kunci cache TanStack Query untuk query di Services. Setelah mutasi, UI meng-invalidate kunci terkait.
 */
export const queryKeys = {
  profileOverview: ['profile', 'overview'] as const,
  activeProgram: ['program', 'active'] as const,
  exercises: ['catalog', 'exercises'] as const,
  catalog: ['catalog', 'list'] as const,
  exerciseDetail: (id: string) => ['catalog', 'detail', id] as const,
  substitutes: (programExerciseId: string) =>
    ['program', 'substitutes', programExerciseId] as const,
  suggestions: ['program', 'suggestions'] as const,
};
