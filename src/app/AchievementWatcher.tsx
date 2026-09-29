import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { t } from '@/shared/i18n/id';
import { useToast } from '@/shared/ui/toastContext';

/**
 * Cek lencana setiap kali data yang relevan berubah (hook aksi meng-invalidate
 * `queryKeys.achievements`), lalu umumkan lencana yang baru terbuka lewat toast.
 * Sync aman diulang: lencana yang sudah terbuka tidak dibuka lagi.
 */
export function AchievementWatcher() {
  const { achievements } = useServices();
  const toast = useToast();
  const { data } = useQuery({ queryKey: queryKeys.achievementSync, queryFn: achievements.sync });

  useEffect(() => {
    const names = (data ?? []).map((id) => t.achievements.badge[id].name);
    const [first, ...rest] = names;
    if (first) toast(t.achievements.unlockedToast(first), rest);
  }, [data, toast]);

  return null;
}
