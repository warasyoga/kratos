import { expect, test } from '@playwright/test';

test.describe('Kerangka aplikasi di HP', () => {
  test('berpindah semua tab lewat tab bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Hari Ini' })).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Menu utama' });
    for (const name of ['Program', 'Latihan', 'Progres', 'Profil', 'Hari Ini']) {
      await nav.getByRole('link', { name }).click();
      await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    }
  });

  test('tema gelap tetap berlaku setelah dimuat ulang', async ({ page }) => {
    await page.goto('/profil');
    await page.getByRole('button', { name: 'Gelap' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('halaman tidak bisa digeser ke samping', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});
