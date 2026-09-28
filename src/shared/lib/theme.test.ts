import { applyThemePreference, readThemePreference, THEME_STORAGE_KEY } from './theme';

describe('tema', () => {
  it('default mengikuti HP', () => {
    expect(readThemePreference()).toBe('system');
  });

  it('gelap memasang data-theme dan tersimpan', () => {
    applyThemePreference('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(readThemePreference()).toBe('dark');
  });

  it('ikuti HP menghapus data-theme', () => {
    applyThemePreference('light');
    applyThemePreference('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('nilai tersimpan yang rusak diabaikan', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'ungu');
    expect(readThemePreference()).toBe('system');
  });
});
