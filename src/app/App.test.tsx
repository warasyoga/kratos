import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { AppProviders } from './providers';
import { routes } from './router';

async function renderApp(initialPath = '/', { onboarded = true } = {}) {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  if (onboarded) await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { deps, services, router };
}

describe('Kerangka aplikasi', () => {
  it('tanpa profil → diarahkan ke onboarding', async () => {
    const { router } = await renderApp('/', { onboarded: false });
    expect(
      await screen.findByRole('heading', { name: 'Selamat datang di Kratos' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/onboarding');
  });

  it('Senin 28 Sep 2026 adalah hari gym Upper A', async () => {
    await renderApp();
    expect(await screen.findByRole('heading', { level: 1, name: 'Hari gym' })).toBeInTheDocument();
    expect(screen.getByText('Senin, 28 September')).toBeInTheDocument();
    expect(screen.getByText('Upper A')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('tab bar berpindah layar dan menandai tab aktif', async () => {
    await renderApp();
    await screen.findByRole('heading', { level: 1, name: 'Hari gym' });
    await userEvent.click(screen.getByRole('link', { name: 'Program' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Program' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Program' })).toHaveAttribute('aria-current', 'page');
  });

  it('layar Program menampilkan 4 hari latihan', async () => {
    await renderApp('/program');
    for (const label of ['Upper A', 'Lower A', 'Upper B', 'Lower B']) {
      expect(await screen.findByRole('heading', { level: 2, name: label })).toBeInTheDocument();
    }
  });

  it('rute tidak dikenal kembali ke Hari Ini', async () => {
    await renderApp('/tidak-ada');
    expect(await screen.findByRole('heading', { level: 1, name: 'Hari gym' })).toBeInTheDocument();
  });

  it('pilihan tema di Profil memasang data-theme', async () => {
    await renderApp('/profil');
    await userEvent.click(await screen.findByRole('button', { name: 'Gelap' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});

describe('Profil', () => {
  it('menampilkan target dari rumus: 2.880 kkal, 137 g protein', async () => {
    await renderApp('/profil');
    expect(await screen.findByText('2.880')).toBeInTheDocument();
    expect(screen.getByText('137 g')).toBeInTheDocument();
  });

  it('mematikan barbell → toast ringkasan gerakan yang diganti', async () => {
    await renderApp('/profil');
    const equipment = await screen.findByRole('group', { name: 'Alat di gym saya' });
    await userEvent.click(within(equipment).getByRole('button', { name: 'Barbell' }));
    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent(/gerakan disesuaikan/);
    expect(toast).toHaveTextContent('Bench Press → Dumbbell Bench Press');
  });

  it('menambah kondisi kesehatan lewat panel', async () => {
    const { deps } = await renderApp('/profil');
    await userEvent.click(await screen.findByRole('button', { name: '+ Tambah' }));
    const dialog = screen.getByRole('dialog', { name: 'Tambah keluhan' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Bahu kiri' }));
    await userEvent.click(within(dialog).getByRole('radio', { name: /Ringan/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Mendorong ke atas kepala' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Seated Dumbbell Shoulder Press → Landmine Press',
    );
    expect(deps.state.conditions.size).toBe(1);
  });

  it('keluhan tanpa bagian tubuh ditolak dengan pesan', async () => {
    await renderApp('/profil');
    await userEvent.click(await screen.findByRole('button', { name: '+ Tambah' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Simpan' }));
    expect(within(dialog).getAllByText('Pilih salah satu.').length).toBeGreaterThan(0);
  });
});
