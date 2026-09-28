/**
 * Kunci cache TanStack Query untuk query di Services. Setelah mutasi, UI meng-invalidate kunci terkait.
 */
export const queryKeys = {
  profileOverview: ['profile', 'overview'] as const,
  activeProgram: ['program', 'active'] as const,
  exercises: ['catalog', 'exercises'] as const,
};
