import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { ProfileScreen } from '@/features/profile';
import { ProgramScreen } from '@/features/program';
import { ProgressScreen } from '@/features/progress';
import { TodayScreen } from '@/features/today';
import { WorkoutScreen } from '@/features/workout';
import { AppLayout } from './AppLayout';
import { paths } from './navigation';

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: paths.today, element: <TodayScreen /> },
      { path: paths.program, element: <ProgramScreen /> },
      { path: paths.workout, element: <WorkoutScreen /> },
      { path: paths.progress, element: <ProgressScreen /> },
      { path: paths.profile, element: <ProfileScreen /> },
      { path: '*', element: <Navigate to={paths.today} replace /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
