import { useCallback, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

/**
 * Preferensi tema disimpan di localStorage (bukan IndexedDB) karena harus terbaca
 * sinkron sebelum halaman digambar, agar tidak ada kedipan tema. Lihat skrip di index.html.
 */
export const THEME_STORAGE_KEY = 'kratos:theme';

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark';

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function applyThemePreference(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', preference);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Penyimpanan diblokir (mode privat): tema tetap berlaku untuk sesi ini.
  }
}

export function useThemePreference(): [ThemePreference, (next: ThemePreference) => void] {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference);
  const update = useCallback((next: ThemePreference) => {
    applyThemePreference(next);
    setPreference(next);
  }, []);
  return [preference, update];
}
