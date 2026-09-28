import { useSyncExternalStore } from 'react';

/** Event Chrome/Android saat aplikasi bisa dipasang (tidak ada di iPhone). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/**
 * Tangkap tawaran pemasangan sedini mungkin (dipanggil di main.tsx), agar tombol
 * "Pasang aplikasi" bisa ditampilkan kapan pun.
 */
export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

/** Sedang berjalan sebagai aplikasi terpasang (layar penuh dari layar utama). */
export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useInstallPrompt() {
  const available = useSyncExternalStore(
    subscribe,
    () => deferred !== null,
    () => false,
  );

  const install = async (): Promise<boolean> => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    notify();
    return outcome === 'accepted';
  };

  return { canInstall: available, installed: isStandalone(), install };
}
