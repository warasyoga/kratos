import { expect, test } from '@playwright/test';
import { completeOnboarding } from './helpers';

test.describe('PWA', () => {
  test('manifest lengkap untuk dipasang ke layar utama', async ({ page, request }) => {
    await page.goto('/');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();

    const manifest = await (await request.get(href ?? '')).json();
    expect(manifest).toMatchObject({ name: 'Kratos', display: 'standalone', start_url: '/' });
    const purposes = manifest.icons.map((i: { purpose: string }) => i.purpose);
    expect(purposes).toContain('maskable');

    for (const icon of manifest.icons as { src: string }[]) {
      expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
    }
  });

  test('tetap bisa dibuka dan dipakai tanpa internet', async ({ page, context }) => {
    await completeOnboarding(page);

    // Tunggu service worker aktif dan mengendalikan halaman.
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    await page.reload();
    await expect
      .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
      .toBe(true);

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Layar yang dimuat terpisah (lazy) juga tersedia offline, data tetap dari HP.
    await page.goto('/program');
    await expect(page.getByRole('heading', { level: 2, name: 'Upper A' })).toBeVisible();
    await page.goto('/profil');
    await expect(page.getByText('2.880')).toBeVisible();

    await context.setOffline(false);
  });
});
