import { expect, type Page } from '@playwright/test';

/** Selesaikan onboarding dengan profil contoh docs (pria, 2002-05-10, 175 cm, 68,4 kg). */
export async function completeOnboarding(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Mulai' }).click();

  await page.getByLabel('Nama panggilan').fill('Aris');
  await page.getByText('Pria', { exact: true }).click();
  await page.getByLabel('Tanggal lahir').fill('2002-05-10');
  await page.getByLabel('Tinggi badan').fill('175');
  await page.getByLabel('Berat badan').fill('68,4');
  await next(page);

  await page.getByText('Pemula', { exact: true }).click();
  await next(page);
  await page.getByText('Sedang', { exact: true }).click();
  await next(page);
  await next(page); // jadwal default
  await next(page); // alat lengkap
  await next(page); // tanpa keluhan

  for (const button of await page.getByRole('button', { name: 'Tidak' }).all())
    await button.click();
  await page.getByRole('button', { name: 'Buat program saya' }).click();
  await expect(page.getByRole('heading', { name: 'Program Anda siap' })).toBeVisible();
  await next(page);
  await page.getByRole('button', { name: 'Nanti saja' }).click();
}

export function next(page: Page) {
  return page.getByRole('button', { name: 'Lanjut' }).click();
}
