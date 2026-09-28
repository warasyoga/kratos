import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { t } from '@/shared/i18n/id';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/toastContext';

/**
 * Mendaftarkan service worker dan menawarkan versi baru.
 * Tidak pernah memuat ulang otomatis, agar sesi latihan yang sedang berjalan tidak terganggu.
 */
export function UpdatePrompt() {
  const toast = useToast();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!offlineReady) return;
    toast(t.pwa.offlineReady);
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady, toast]);

  if (!needRefresh) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
      <div
        role="alert"
        className="pointer-events-auto flex w-full max-w-[528px] items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-ground shadow-float"
      >
        <p className="flex-1 font-semibold">{t.pwa.updateAvailable}</p>
        <Button size="sm" onClick={() => void updateServiceWorker(true)}>
          {t.pwa.reload}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setNeedRefresh(false)}>
          {t.pwa.later}
        </Button>
      </div>
    </div>
  );
}
