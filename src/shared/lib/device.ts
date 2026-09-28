import { useEffect, useState } from 'react';

/**
 * Getaran singkat (Android). iPhone tidak mendukung getaran dari web, jadi selalu
 * sertai umpan balik visual (docs/06-design-system.md "Gerak & umpan balik").
 */
export function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Tidak didukung: abaikan.
  }
}

/** Jaga layar tetap menyala selama `active` (Screen Wake Lock). Penolakan diabaikan. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) void lock.release();
      } catch {
        // Ditolak (hemat baterai, tab di latar): abaikan.
      }
    };
    // Kunci lepas saat tab disembunyikan; minta lagi saat kembali terlihat.
    const onVisible = () => document.visibilityState === 'visible' && void acquire();
    void acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release();
    };
  }, [active]);
}

/**
 * Waktu sekarang yang diperbarui berkala (untuk timer di UI).
 * `read` sebaiknya jam yang sama dengan use case (services.clock.now) agar konsisten.
 */
export function useNow(read: () => number, intervalMs = 250): number {
  const [now, setNow] = useState(read);
  useEffect(() => {
    const timer = setInterval(() => setNow(read()), intervalMs);
    return () => clearInterval(timer);
  }, [read, intervalMs]);
  return now;
}

/** "1:05" dari detik. */
export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.ceil(totalSec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
