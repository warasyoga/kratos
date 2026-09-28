import { expect, test } from '@playwright/test';
import { completeOnboarding } from './helpers';

test.describe('Mode latihan', () => {
  test('check-in, catat set, timer istirahat, selesai → ringkasan; sesi tahan dimuat ulang', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.getByRole('link', { name: 'Latihan', exact: true }).click();

    await page.getByRole('button', { name: 'Check-in' }).click();
    await page.getByRole('button', { name: 'Simpan check-in' }).click();
    await expect(page.getByText('Siap penuh')).toBeVisible();

    // Hari apa pun tes dijalankan: mulai latihan hari ini, atau Upper A dari "Latihan hari lain".
    await page
      .getByRole('button', { name: /^Mulai (latihan|Upper A)$/ })
      .first()
      .click();
    const title = page.getByRole('heading', { level: 1 });
    await expect(title).toBeVisible();

    await page
      .getByRole('button', { name: /^Selesaikan set (1|P1)$/ })
      .first()
      .click();
    await expect(page.getByRole('timer', { name: 'Istirahat' })).toBeVisible();

    // Sesi tersimpan: muat ulang tetap di sesi yang sama dengan set tercentang.
    await page.reload();
    await expect(page.getByRole('button', { name: /^Batalkan set/ }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Selesai latihan' }).click();
    await page.getByRole('button', { name: 'Ya, selesai' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Latihan selesai' })).toBeVisible();
  });
});
