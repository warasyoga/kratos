import { lazy } from 'react';

// Layar selain Hari Ini dimuat saat dibuka (anggaran kinerja: docs/06-design-system.md).
export const OnboardingScreen = lazy(() =>
  import('@/features/profile').then((m) => ({ default: m.OnboardingScreen })),
);
export const ProfileScreen = lazy(() =>
  import('@/features/profile').then((m) => ({ default: m.ProfileScreen })),
);
export const ProgramScreen = lazy(() =>
  import('@/features/program').then((m) => ({ default: m.ProgramScreen })),
);
export const WorkoutScreen = lazy(() =>
  import('@/features/workout').then((m) => ({ default: m.WorkoutScreen })),
);
export const ProgressScreen = lazy(() =>
  import('@/features/progress').then((m) => ({ default: m.ProgressScreen })),
);
