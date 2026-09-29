import { Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { TodayScreen } from '@/features/today';
import { AppLayout } from './AppLayout';
import { paths } from './navigation';
import { RequireProfile } from './RequireProfile';
import {
  CustomExerciseScreen,
  DayEditScreen,
  EvaluationScreen,
  ExerciseProgressScreen,
  MuscleMapScreen,
  NutritionScreen,
  ExerciseDetailScreen,
  ExerciseLibraryScreen,
  OnboardingScreen,
  ProfileScreen,
  ProgramScreen,
  ProgressScreen,
  SummaryScreen,
  WorkoutScreen,
} from './screens';

const page = (node: ReactNode) => <Suspense fallback={null}>{node}</Suspense>;

export const routes: RouteObject[] = [
  { path: paths.onboarding, element: page(<OnboardingScreen />) },
  {
    element: (
      <RequireProfile>
        <AppLayout />
      </RequireProfile>
    ),
    children: [
      { path: paths.today, element: <TodayScreen /> },
      { path: paths.program, element: page(<ProgramScreen />) },
      { path: `${paths.program}/hari/:dayId`, element: page(<DayEditScreen />) },
      { path: paths.library, element: page(<ExerciseLibraryScreen />) },
      { path: `${paths.library}/baru`, element: page(<CustomExerciseScreen />) },
      { path: `${paths.library}/:id`, element: page(<ExerciseDetailScreen />) },
      { path: `${paths.library}/:id/ubah`, element: page(<CustomExerciseScreen />) },
      { path: paths.workout, element: page(<WorkoutScreen />) },
      { path: `${paths.workout}/ringkasan/:sessionId`, element: page(<SummaryScreen />) },
      { path: paths.progress, element: page(<ProgressScreen />) },
      { path: `${paths.progress}/gerakan/:id`, element: page(<ExerciseProgressScreen />) },
      { path: `${paths.progress}/otot`, element: page(<MuscleMapScreen />) },
      { path: `${paths.progress}/evaluasi/:key`, element: page(<EvaluationScreen />) },
      { path: paths.nutrition, element: page(<NutritionScreen />) },
      { path: paths.profile, element: page(<ProfileScreen />) },
      { path: '*', element: <Navigate to={paths.today} replace /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
