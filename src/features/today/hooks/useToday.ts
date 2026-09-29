import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import type { Result } from '@/domain/common/result';
import { errorMessage } from '@/shared/i18n/id';
import { useToast } from '@/shared/ui/toastContext';

export function useTodayPlan() {
  const { today } = useServices();
  return useQuery({ queryKey: queryKeys.todayPlan, queryFn: today.plan });
}

export function useTopSuggestion() {
  const { program } = useServices();
  return useQuery({ queryKey: queryKeys.suggestions, queryFn: program.suggestions.list });
}

/** Jalankan aksi dari layar Hari Ini lalu muat ulang rencana dan data terkait. */
export function useTodayAction() {
  const client = useQueryClient();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async <T>(action: () => Promise<Result<T>>): Promise<Result<T>> => {
      setPending(true);
      try {
        const result = await action();
        if (!result.ok) toast(errorMessage(result.error.code));
        await Promise.all(
          [
            queryKeys.todayPlan,
            queryKeys.activeSession,
            queryKeys.suggestions,
            queryKeys.nutritionDay,
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
