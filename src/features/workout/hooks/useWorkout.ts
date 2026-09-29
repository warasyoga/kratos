import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import type { Result } from '@/domain/common/result';
import { errorMessage } from '@/shared/i18n/id';
import { useToast } from '@/shared/ui/toastContext';

export function useActiveSession() {
  const { workout } = useServices();
  return useQuery({ queryKey: queryKeys.activeSession, queryFn: workout.getActive });
}

export function useCheckInToday() {
  const { checkIn } = useServices();
  return useQuery({ queryKey: queryKeys.checkInToday, queryFn: checkIn.today });
}

export function useProgramForWorkout() {
  const { program } = useServices();
  return useQuery({ queryKey: queryKeys.activeProgram, queryFn: program.getActive });
}

export function useInventory() {
  const { gym } = useServices();
  return useQuery({ queryKey: queryKeys.inventory, queryFn: gym.inventory.get });
}

/**
 * Jalankan aksi latihan lalu muat ulang sesi (dan data yang ikut berubah).
 * Error tanpa kolom ditampilkan sebagai toast. Mengembalikan hasil use case.
 */
export function useWorkoutAction() {
  const client = useQueryClient();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async <T>(action: () => Promise<Result<T>>): Promise<Result<T>> => {
      setPending(true);
      try {
        const result = await action();
        if (!result.ok && !result.error.fields) toast(errorMessage(result.error.code));
        await Promise.all(
          [
            queryKeys.activeSession,
            queryKeys.checkInToday,
            queryKeys.activeProgram,
            queryKeys.profileOverview,
            queryKeys.todayPlan,
            queryKeys.progress,
          ].map((queryKey) => client.invalidateQueries({ queryKey })),
        );
        return result;
      } finally {
        setPending(false);
      }
    },
    [client, toast],
  );

  return { run, pending };
}
