import { expect, test, type Page } from '@playwright/test';
import { completeOnboarding } from './helpers';

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

test('backup: ekspor → hapus semua data → pulihkan dari layar pembuka → data identik', async ({
  page,
}, info) => {
  await completeOnboarding(page);

  // Data: ukuran tubuh + foto progres.
  await page.goto('/progres?bagian=tubuh');
  await page.getByRole('button', { name: 'Catat ukuran' }).click();
  await page.getByLabel('Leher').fill('37');
  await page.getByLabel('Pinggang').fill('80');
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(page.getByText('13,7%')).toBeVisible();
  await page.goto('/progres?bagian=foto');
  await page.getByRole('button', { name: 'Tambah foto' }).click();
  await page
    .getByLabel('Pilih atau ambil foto')
    .setInputFiles({ name: 'depan.png', mimeType: 'image/png', buffer: await makePng(page) });
  await expect(page.getByText('Foto tersimpan.')).toBeVisible();

  // Ekspor.
  await page.goto('/profil');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Ekspor backup (.zip)' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^kratos-backup-\d{4}-\d{2}-\d{2}\.zip$/);
  const file = info.outputPath('backup.zip');
  await download.saveAs(file);

  // "HP baru": hapus database, aplikasi kembali ke layar pembuka.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('kratos');
        request.onsuccess = () => resolve();
        request.onblocked = () => resolve();
      }),
  );
  await page.goto('/');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mulai' })).toBeVisible();

  // Pulihkan dari layar pembuka.
  await page.getByLabel('Impor backup').setInputFiles(file);
  await expect(page.getByText('Profil: Aris')).toBeVisible();
  await expect(page.getByText('1 foto progres')).toBeVisible();
  await page.getByRole('button', { name: 'Ganti semua' }).click();
  await expect(page.getByText('Backup dipulihkan.')).toBeVisible();

  await page.goto('/progres?bagian=tubuh');
  await expect(page.getByText('13,7%')).toBeVisible();
  await page.goto('/progres?bagian=foto');
  const thumb = page.getByRole('img', { name: /^Foto Depan/ });
  await expect(thumb).toBeVisible();
  await expect
    .poll(() => thumb.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
});
