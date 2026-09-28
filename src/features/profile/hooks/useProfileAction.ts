import { useCallback, useState } from 'react';
import type { Result } from '@/domain/common/result';
import { t } from '@/shared/i18n/id';
import { useToast } from '@/shared/ui/toastContext';
import { useRefreshProfile } from './useProfile';

/**
 * Jalankan use case profil: tampilkan error per kolom, atau muat ulang data + toast ringkasan.
 * `describe` menyusun judul dan baris toast dari hasil yang berhasil.
 */
export function useProfileAction() {
  const refresh = useRefreshProfile();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string> | undefined>();

  const run = useCallback(
    async <T>(
      action: () => Promise<Result<T>>,
      describe: (value: T) => [string, string[]?] = () => [t.common.saved],
    ): Promise<boolean> => {
      setPending(true);
      setErrors(undefined);
      try {
        const result = await action();
        if (!result.ok) {
          setErrors(result.error.fields ?? { _: result.error.code });
          return false;
        }
        await refresh();
        const [title, lines] = describe(result.value);
        toast(title, lines);
        return true;
      } finally {
        setPending(false);
      }
    },
    [refresh, toast],
  );

  return { run, pending, errors, clearErrors: () => setErrors(undefined) };
}
