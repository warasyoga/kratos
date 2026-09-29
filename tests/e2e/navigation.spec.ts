import { expect, test } from '@playwright/test';
import { completeOnboarding } from './helpers';

test.describe('Kratos di HP', () => {
  test('pengguna baru diarahkan ke onboarding', async ({ page }) => {
    await page.goto('/program');
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByRole('heading', { name: 'Selamat datang di Kratos' })).toBeVisible();
  });

  test('onboarding → program tersimpan dan tetap ada setelah dimuat ulang', async ({ page }) => {
    await completeOnboarding(page);
    await expect(page).toHaveURL(/\/$/);

    await page
      .getByRole('navigation', { name: 'Menu utama' })
      .getByRole('link', { name: 'Program' })
      .click();
    for (const label of ['Upper A', 'Lower A', 'Upper B', 'Lower B']) {
      await expect(page.getByRole('heading', { level: 2, name: label })).toBeVisible();
    }

    await page.reload();
    await expect(page.getByRole('heading', { level: 2, name: 'Upper A' })).toBeVisible();

    await page.getByRole('link', { name: 'Profil' }).click();
    await expect(page.getByText('2.880')).toBeVisible();
    await expect(page.getByText('137 g').first()).toBeVisible();
  });

  test('mematikan barbell di Profil mengganti Bench Press', async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole('link', { name: 'Profil' }).click();
    await page
      .getByRole('group', { name: 'Alat di gym saya' })
      .getByRole('button', { name: 'Barbell' })
      .click();
    await expect(page.getByRole('status')).toContainText('Bench Press → Dumbbell Bench Press');

    await page.getByRole('link', { name: 'Program' }).click();
    await expect(page.getByText('pengganti Bench Press (alat tidak ada)')).toBeVisible();
  });

  test('tema gelap tetap berlaku setelah dimuat ulang', async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole('link', { name: 'Profil' }).click();
    await page.getByRole('button', { name: 'Gelap' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('tidak ada geser horizontal di layar mana pun', async ({ page }) => {
    await completeOnboarding(page);
    for (const path of [
      '/',
      '/program',
      '/profil',
      '/nutrisi',
      '/progres',
      '/progres?bagian=tubuh',
      '/progres?bagian=lencana',
      '/progres/otot',
      '/gerakan/baru',
      '/onboarding',
    ]) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBe(0);
    }
  });
});
