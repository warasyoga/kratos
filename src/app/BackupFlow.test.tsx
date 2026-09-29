import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { AppProviders } from './providers';
import { routes } from './router';

async function renderApp(onboard: boolean) {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  if (onboard) await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  const router = createMemoryRouter(routes, { initialEntries: ['/profil'] });
  const view = render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { deps, services, router, view, user: userEvent.setup({ delay: null }) };
}

describe('Profil → Data & backup', () => {
  it('ekspor di HP lama → impor di HP baru dengan pratinjau → data kembali', async () => {
    const downloads: Blob[] = [];
    Object.assign(URL, {
      createObjectURL: (blob: Blob) => {
        downloads.push(blob);
        return 'blob:backup';
      },
      revokeObjectURL: () => {},
    });
    onTestFinished(() => {
      Reflect.deleteProperty(URL, 'createObjectURL');
      Reflect.deleteProperty(URL, 'revokeObjectURL');
    });

    const old = await renderApp(true);
    await old.services.progress.logMetric({ waistCm: 80 });
    await old.user.click(await screen.findByRole('button', { name: 'Ekspor backup (.zip)' }));
    expect(await screen.findByText(/Backup diunduh/)).toBeInTheDocument();
    expect(await screen.findByText(/^Backup terakhir:/)).toBeInTheDocument();
    const zip = downloads.at(-1);
    if (!zip) throw new Error('tidak ada unduhan');
    old.view.unmount();

    // HP baru: pengguna yang sudah onboarding dengan data berbeda, lalu memulihkan backup.
    const fresh = await renderApp(true);
    fresh.deps.state.bodyMetrics = [];
    await fresh.user.upload(
      await screen.findByLabelText('Impor backup'),
      new File([await zip.arrayBuffer()], 'kratos-backup.zip', { type: 'application/zip' }),
    );
    const sheet = await screen.findByRole('dialog', { name: 'Pulihkan backup?' });
    expect(within(sheet).getByText('Profil: Aris')).toBeInTheDocument();
    expect(within(sheet).getByText('0 foto progres')).toBeInTheDocument();
    await fresh.user.click(within(sheet).getByRole('button', { name: 'Ganti semua' }));

    expect(await screen.findByText('Backup dipulihkan.')).toBeInTheDocument();
    await vi.waitFor(() => expect(fresh.router.state.location.pathname).toBe('/'));
    expect(fresh.deps.state.bodyMetrics.some((m) => m.waistCm === 80)).toBe(true);
  });

  it('file asing ditolak dengan pesan jelas', async () => {
    const { user, deps } = await renderApp(true);
    await user.upload(
      await screen.findByLabelText('Impor backup'),
      new File(['bukan backup'], 'foto.zip', { type: 'application/zip' }),
    );
    expect(await screen.findByText(/bukan backup Kratos atau rusak/)).toBeInTheDocument();
    expect(deps.state.profile?.name).toBe('Aris');
  });
});
