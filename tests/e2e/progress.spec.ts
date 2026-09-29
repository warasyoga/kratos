import { expect, test, type Page } from '@playwright/test';
import { completeOnboarding } from './helpers';

/** Gambar PNG sungguhan (30×40 px) dibuat oleh canvas browser. */
async function makePng(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 40;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#2455d6';
      context.fillRect(0, 0, 30, 40);
    }
    return canvas.toDataURL('image/png');
  });
  return Buffer.from(dataUrl.split(',')[1] ?? '', 'base64');
}

test.describe('Progres', () => {
  test('catat ukuran tubuh → estimasi lemak tampil dan tersimpan setelah muat ulang', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.getByRole('link', { name: 'Progres' }).click();
    await page.getByRole('button', { name: 'Tubuh' }).click();

    await page.getByRole('button', { name: 'Catat ukuran' }).click();
    await page.getByLabel('Leher').fill('37');
    await page.getByLabel('Pinggang').fill('80');
    await page.getByRole('button', { name: 'Simpan' }).click();
    await expect(page.getByText('13,7%')).toBeVisible();

    await page.reload();
    await expect(page.getByText('13,7%')).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Pinggang' })).toBeVisible();
  });

  test('foto dikompres, tersimpan sebagai gambar, dan tetap ada setelah muat ulang', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto('/progres?bagian=foto');

    await page.getByRole('button', { name: 'Tambah foto' }).click();
    await page
      .getByLabel('Pilih atau ambil foto')
      .setInputFiles({ name: 'depan.png', mimeType: 'image/png', buffer: await makePng(page) });
    await expect(page.getByText('Foto tersimpan.')).toBeVisible();

    await page.reload();
    const thumb = page.getByRole('img', { name: /^Foto Depan/ });
    await expect(thumb).toBeVisible();
    // Gambar benar-benar terbaca dari IndexedDB (bukan kotak kosong).
    await expect
      .poll(() => thumb.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  });
});
