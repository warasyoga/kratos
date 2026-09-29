import { expect, test } from '@playwright/test';
import { completeOnboarding } from './helpers';

test.describe('Nutrisi, pengingat, peta otot, gerakan buatan sendiri', () => {
  test('catat air & makan, tetap ada setelah muat ulang', async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole('button', { name: 'Tambah air 250 ml' }).click();
    await expect(page.getByRole('progressbar', { name: 'Air minum' })).toHaveAttribute(
      'aria-valuetext',
      /^250 \//,
    );

    await page.getByRole('link', { name: 'Catat makan' }).click();
    await page.getByRole('button', { name: 'Catat makan' }).click();
    const sheet = page.getByRole('dialog', { name: 'Catat makan' });
    await sheet.getByLabel('Nama makanan').fill('Nasi + ayam');
    await sheet.getByLabel('Kalori').fill('650');
    await sheet.getByLabel('Protein').fill('45');
    await sheet.getByRole('button', { name: 'Simpan' }).click();
    await expect(page.getByRole('button', { name: 'Ubah Nasi + ayam' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Ubah Nasi + ayam' })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Protein' })).toHaveAttribute(
      'aria-valuetext',
      /^45 \//,
    );
  });

  test('file kalender .ics terunduh dengan jadwal latihan', async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole('link', { name: 'Profil' }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Tambahkan ke kalender HP' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('kratos-jadwal-latihan.ics');
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const ics = Buffer.concat(chunks).toString('utf8');
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(4);
    expect(ics).toContain('TRIGGER:-PT30M');
  });

  test('peta otot dan gerakan buatan sendiri', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/progres/otot');
    await expect(page.getByRole('heading', { level: 1, name: 'Peta otot' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dada, segar' })).toBeVisible();

    await page.goto('/gerakan/baru');
    await page.getByLabel('Nama gerakan').fill('Crossover Rendah');
    await page.getByRole('button', { name: 'Dada' }).first().click();
    await page.getByRole('button', { name: 'Simpan gerakan' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Crossover Rendah' })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Buatan saya')).toBeVisible();
  });
});
