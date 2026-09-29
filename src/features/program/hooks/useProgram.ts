import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import type { Result } from '@/domain/common/result';
import { errorMessage, t } from '@/shared/i18n/id';
import { useToast } from '@/shared/ui/toastContext';

export function useActiveProgram() {
  const { program } = useServices();
  return useQuery({ queryKey: queryKeys.activeProgram, queryFn: program.getActive });
}

export function useSuggestions() {
  const { program } = useServices();
  return useQuery({ queryKey: queryKeys.suggestions, queryFn: program.suggestions.list });
}

export function useCatalog() {
  const { catalog } = useServices();
  return useQuery({ queryKey: queryKeys.catalog, queryFn: catalog.list });
}

/** Nama gerakan dari ID (untuk teks saran dan catatan pengganti). */
export function useExerciseNames() {
  const { data = [] } = useCatalog();
  return useMemo(() => {
    const names = new Map(data.map((i) => [i.exercise.id, i.exercise.name]));
    return (id: string) => names.get(id) ?? id;
  }, [data]);
}

/**
 * Jalankan perubahan program: muat ulang data terkait, tampilkan toast dengan tombol
 * "Urungkan", atau pesan error. Mengembalikan true jika berhasil.
 */
export function useProgramAction() {
  const services = useServices();
  const client = useQueryClient();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string> | undefined>();

  const refresh = useCallback(
    () =>
      Promise.all(
        [
          queryKeys.activeProgram,
          queryKeys.suggestions,
          queryKeys.profileOverview,
          queryKeys.todayPlan,
          queryKeys.nutritionDay,
          queryKeys.catalogAll,
        ].map((queryKey) => client.invalidateQueries({ queryKey })),
      ),
    [client],
  );

  const undo = useCallback(async () => {
    const result = await services.program.edit.undo();
    await refresh();
    toast(result.ok ? t.program.undone : errorMessage(result.error.code));
  }, [services, refresh, toast]);

  const run = useCallback(
    async (
      action: () => Promise<Result<unknown>>,
      successTitle: string = t.program.saved,
      undoable = true,
    ) => {
      setPending(true);
      setErrors(undefined);
      try {
        const result = await action();
        if (!result.ok) {
          setErrors(result.error.fields);
          if (!result.error.fields) toast(errorMessage(result.error.code));
          return false;
        }
        await refresh();
        toast(
          successTitle,
          undefined,
          undoable ? { label: t.program.undo, onClick: () => void undo() } : undefined,
        );
        return true;
      } finally {
        setPending(false);
      }
    },
    [refresh, toast, undo],
  );

  return { run, pending, errors, clearErrors: () => setErrors(undefined) };
}
