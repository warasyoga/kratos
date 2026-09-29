import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import type { Result } from '@/domain/common/result';
import { errorMessage } from '@/shared/i18n/id';
import { useToast } from '@/shared/ui/toastContext';

export function useNutritionDay() {
  const { nutrition } = useServices();
  return useQuery({ queryKey: queryKeys.nutritionDay, queryFn: nutrition.day });
}

/** Jalankan aksi nutrisi lalu muat ulang nutrisi, Hari Ini, dan saran (protein). */
export function useNutritionAction() {
  const client = useQueryClient();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string> | undefined>();

  const run = useCallback(
    async <T>(action: () => Promise<Result<T>>, successMessage?: string): Promise<boolean> => {
      setPending(true);
      try {
        const result = await action();
        setErrors(result.ok ? undefined : result.error.fields);
        if (result.ok) {
          if (successMessage) toast(successMessage);
        } else {
          const { code, fields } = result.error;
          if (!fields || fields._) toast(errorMessage(fields?._ ?? code));
        }
        await Promise.all(
          [
            queryKeys.nutritionDay,
            queryKeys.todayPlan,
            queryKeys.suggestions,
            queryKeys.achievements,
          ].map((queryKey) => client.invalidateQueries({ queryKey })),
        );
        return result.ok;
      } finally {
        setPending(false);
      }
    },
    [client, toast],
  );

  return { run, pending, errors, clearErrors: () => setErrors(undefined) };
}
