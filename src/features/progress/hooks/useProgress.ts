import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import type { Result } from '@/domain/common/result';
import type { ProgressRange } from '@/domain/progress/range';
import { errorMessage } from '@/shared/i18n/id';
import { useToast } from '@/shared/ui/toastContext';

export function useStrengthProgress(range: ProgressRange) {
  const { progress } = useServices();
  return useQuery({
    queryKey: queryKeys.progressStrength(range),
    queryFn: () => progress.strength(range),
  });
}

export function useExerciseProgress(exerciseId: string) {
  const { progress } = useServices();
  return useQuery({
    queryKey: queryKeys.progressExercise(exerciseId),
    queryFn: () => progress.exercise(exerciseId),
  });
}

export function useBodyProgress(range: ProgressRange) {
  const { progress } = useServices();
  return useQuery({ queryKey: queryKeys.progressBody(range), queryFn: () => progress.body(range) });
}

export function useVolumeProgress(range: ProgressRange) {
  const { progress } = useServices();
  return useQuery({
    queryKey: queryKeys.progressVolume(range),
    queryFn: () => progress.volume(range),
  });
}

export function usePhotos() {
  const { progress } = useServices();
  return useQuery({ queryKey: queryKeys.photos, queryFn: progress.photos.list });
}

/**
 * Jalankan aksi progres (catat ukuran, foto) lalu muat ulang progres dan data yang
 * bergantung pada berat (profil, target Hari Ini). Error tanpa kolom → toast.
 */
export function useProgressAction() {
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
          [queryKeys.progress, queryKeys.profileOverview, queryKeys.todayPlan].map((queryKey) =>
            client.invalidateQueries({ queryKey }),
          ),
        );
        return result.ok;
      } finally {
        setPending(false);
      }
    },
    [client, toast],
  );

  return { run, pending, errors };
}
