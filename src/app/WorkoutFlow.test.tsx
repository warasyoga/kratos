import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { AppProviders } from './providers';
import { routes } from './router';

async function renderAt(path: string) {
  // Senin 28 Sep 2026 = hari Upper A.
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { deps, services, router, user: userEvent.setup({ delay: null }) };
}

describe('Mode latihan', () => {
  it('check-in → mulai → centang set → RIR kalibrasi → selesai → ringkasan', async () => {
    const { deps, user, router } = await renderAt('/latihan');

    await user.click(await screen.findByRole('button', { name: 'Check-in' }));
    const sheet = screen.getByRole('dialog', { name: 'Check-in sebelum latihan' });
    await user.click(within(sheet).getByRole('button', { name: 'Simpan check-in' }));
    expect(await screen.findByText('Siap penuh')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mulai latihan' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Bench Press' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pasang di tiap sisi')).toBeInTheDocument();
    expect(screen.getByText(/Gerakan baru: mulai ringan/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Selesaikan set 1' }));
    expect(await screen.findByRole('timer', { name: 'Istirahat' })).toHaveTextContent('2:00');

    await user.click(await screen.findByRole('button', { name: '5+' }));
    expect(await screen.findByText('Beban set berikutnya disesuaikan: 25 kg.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Batalkan set 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Selesai latihan' }));
    await user.click(screen.getByRole('button', { name: 'Ya, selesai' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Latihan selesai' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toMatch(/^\/latihan\/ringkasan\//);
    expect(deps.state.sessions[0]?.status).toBe('finished');
  });

  it('mengatur beban set lewat panel melompat ke beban yang bisa dipasang', async () => {
    const { user } = await renderAt('/latihan');
    await user.click(await screen.findByRole('button', { name: 'Mulai latihan' }));
    await screen.findByRole('heading', { level: 1, name: 'Bench Press' });

    await user.click(screen.getAllByRole('button', { name: 'Atur set 1' })[0] as HTMLElement);
    const dialog = screen.getByRole('dialog', { name: 'Bench Press · set 1' });
    await user.click(within(dialog).getByRole('button', { name: 'Tambah Beban' }));
    await user.click(within(dialog).getByRole('button', { name: 'Simpan' }));
    expect((await screen.findAllByRole('button', { name: 'Atur set 1' }))[0]).toHaveTextContent(
      '22,5',
    );
  });

  it('pindah ke gerakan berikutnya', async () => {
    const { user } = await renderAt('/latihan');
    await user.click(await screen.findByRole('button', { name: 'Mulai latihan' }));
    await screen.findByRole('heading', { level: 1, name: 'Bench Press' });
    await user.click(screen.getByRole('button', { name: /Gerakan berikutnya/ }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Barbell Row' }),
    ).toBeInTheDocument();
  });

  it('batalkan sesi dengan konfirmasi di halaman', async () => {
    const { deps, user } = await renderAt('/latihan');
    await user.click(await screen.findByRole('button', { name: 'Mulai latihan' }));
    await screen.findByRole('heading', { level: 1, name: 'Bench Press' });
    await user.click(screen.getByRole('button', { name: 'Batalkan sesi' }));
    await user.click(screen.getByRole('button', { name: 'Ya, hapus' }));
    expect(await screen.findByRole('button', { name: 'Mulai latihan' })).toBeInTheDocument();
    expect(deps.state.sessions).toHaveLength(0);
  });

  it('Hari Ini menautkan ke mode latihan', async () => {
    const { user, router } = await renderAt('/');
    await user.click(await screen.findByRole('link', { name: 'Mulai latihan' }));
    expect(router.state.location.pathname).toBe('/latihan');
  });
});
