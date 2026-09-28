import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';

export function useProfileOverview() {
  const { profile } = useServices();
  return useQuery({ queryKey: queryKeys.profileOverview, queryFn: profile.getOverview });
}

export function useActiveProgram() {
  const { program } = useServices();
  return useQuery({ queryKey: queryKeys.activeProgram, queryFn: program.getActive });
}

/** Muat ulang profil dan program setelah ada perubahan data. */
export function useRefreshProfile() {
  const client = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.profileOverview }),
        client.invalidateQueries({ queryKey: queryKeys.activeProgram }),
        client.invalidateQueries({ queryKey: queryKeys.inventory }),
      ]),
    [client],
  );
}
