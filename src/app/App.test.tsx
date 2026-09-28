import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createFixedClock } from '@/domain/common/clock';
import { AppProviders } from './providers';
import { routes } from './router';

function renderApp(initialPath = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  render(
    <AppProviders services={{ clock: createFixedClock('2026-09-28T07:00:00') }}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}

describe('Kerangka aplikasi', () => {
  it('membuka layar Hari Ini dengan tanggal dari Clock', () => {
    renderApp();
    expect(screen.getByRole('heading', { level: 1, name: 'Hari Ini' })).toBeInTheDocument();
    expect(screen.getByText('Senin, 28 September')).toBeInTheDocument();
  });

  it('tab bar berpindah layar dan menandai tab aktif', async () => {
    renderApp();
    const nav = screen.getByRole('navigation', { name: 'Menu utama' });
    await userEvent.click(screen.getByRole('link', { name: 'Program' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Program' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Program' })).toHaveAttribute('aria-current', 'page');
    expect(nav).toBeInTheDocument();
  });

  it.each([
    ['/latihan', 'Latihan'],
    ['/progres', 'Progres'],
    ['/profil', 'Profil'],
  ])('rute %s menampilkan layar %s', (path, title) => {
    renderApp(path);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
  });

  it('rute tidak dikenal kembali ke Hari Ini', () => {
    renderApp('/tidak-ada');
    expect(screen.getByRole('heading', { level: 1, name: 'Hari Ini' })).toBeInTheDocument();
  });

  it('pilihan tema di Profil memasang data-theme', async () => {
    renderApp('/profil');
    await userEvent.click(screen.getByRole('button', { name: 'Gelap' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
