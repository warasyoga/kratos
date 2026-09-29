import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { AppProviders } from './providers';
import { routes } from './router';

const MONDAY = new Date('2026-09-28T07:00:00').getTime();

async function renderAt(path: string) {
  const deps = createInMemoryDeps({ clock: { now: () => MONDAY } });
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  render(
    <AppProviders services={services}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </AppProviders>,
  );
  return { deps, user: userEvent.setup({ delay: null }) };
}

describe('Nutrisi', () => {
  it('Hari Ini: asupan vs target dan tombol cepat air', async () => {
    const { user, deps } = await renderAt('/');
    await user.click(await screen.findByRole('button', { name: 'Tambah air 250 ml' }));
    expect(await screen.findByRole('progressbar', { name: 'Air minum' })).toHaveAttribute(
      'aria-valuetext',
      '250 / 2.500 ml',
    );
    expect(screen.getByRole('progressbar', { name: 'Kalori' })).toHaveAttribute(
      'aria-valuetext',
      '0 / 2.880 kkal',
    );
    expect(deps.state.water).toHaveLength(1);
  });

  it('catat makan + menu favorit, lalu catat ulang dengan satu ketukan', async () => {
    const { user } = await renderAt('/nutrisi');
    await user.click(await screen.findByRole('button', { name: 'Catat makan' }));
    const sheet = await screen.findByRole('dialog', { name: 'Catat makan' });
    await user.type(within(sheet).getByLabelText('Nama makanan'), 'Nasi + ayam');
    await user.type(within(sheet).getByLabelText('Kalori'), '650');
    await user.type(within(sheet).getByLabelText('Protein'), '45');
    await user.click(within(sheet).getByLabelText('Simpan sebagai menu favorit'));
    await user.click(within(sheet).getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('button', { name: 'Ubah Nasi + ayam' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Catat Nasi + ayam' }));
    expect(await screen.findAllByRole('button', { name: 'Ubah Nasi + ayam' })).toHaveLength(2);
    expect(screen.getByRole('progressbar', { name: 'Protein' })).toHaveAttribute(
      'aria-valuetext',
      '90 / 137 g',
    );
  });

  it('porsi referensi TKPI dengan berat yang bisa diubah', async () => {
    const { user, deps } = await renderAt('/nutrisi');
    await user.click(await screen.findByRole('button', { name: /^Nasi putih/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Nasi putih' });
    expect(within(sheet).getByText(/TKPI 2019 · AP001/)).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Tambah Berat' }));
    await user.click(within(sheet).getByRole('button', { name: 'Catat Nasi putih' }));
    expect(await screen.findByRole('button', { name: 'Ubah Nasi putih 160 g' })).toBeVisible();
    expect(deps.state.foods[0]).toMatchObject({ kcal: 288, proteinG: 4.8 });
  });

  it('kesalahan isian ditampilkan di kolom', async () => {
    const { user } = await renderAt('/nutrisi');
    await user.click(await screen.findByRole('button', { name: 'Catat makan' }));
    const sheet = await screen.findByRole('dialog');
    await user.click(within(sheet).getByRole('button', { name: 'Simpan' }));
    expect(await within(sheet).findByText('Isi nama makanan.')).toBeInTheDocument();
  });
});
