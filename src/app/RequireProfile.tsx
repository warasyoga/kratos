import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { paths } from './navigation';

/** Arahkan ke onboarding jika profil belum ada. */
export function RequireProfile({ children }: { children: ReactNode }) {
  const { profile } = useServices();
  const { data, isPending } = useQuery({
    queryKey: queryKeys.profileOverview,
    queryFn: profile.getOverview,
  });
  if (isPending) return null;
  if (!data) return <Navigate to={paths.onboarding} replace />;
  return children;
}
