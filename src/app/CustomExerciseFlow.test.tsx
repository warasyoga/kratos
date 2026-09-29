import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { AppProviders } from './providers';
import { routes } from './router';

async function renderLibrary() {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  const router = createMemoryRouter(routes, { initialEntries: ['/gerakan'] });
  render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { router, services, user: userEvent.setup({ delay: null }) };
}

describe('Gerakan buatan sendiri', () => {
  it('buat dari perpustakaan → detail gerakan → ubah → hapus', async () => {
    const { user, router, services } = await renderLibrary();
    await user.click(await screen.findByRole('link', { name: 'Gerakan baru' }));

    await user.type(await screen.findByLabelText('Nama gerakan'), 'Crossover Rendah');
    await user.selectOptions(screen.getByLabelText('Pola gerakan'), 'horizontal_push');
    const [chestPrimary] = screen.getAllByRole('button', { name: 'Dada' });
    await user.click(chestPrimary as HTMLElement);
    await user.click(screen.getByRole('button', { name: 'Mesin kabel' }));
    await user.click(screen.getByRole('radio', { name: 'Kabel' }));
    await user.click(screen.getByRole('button', { name: 'Simpan gerakan' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Crossover Rendah' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Buatan saya')).toBeInTheDocument();
    const id = router.state.location.pathname.split('/').at(-1) ?? '';
    expect(id).toMatch(/^custom-/);

    await user.click(screen.getByRole('link', { name: 'Ubah gerakan' }));
    await user.click(await screen.findByRole('button', { name: 'Hapus gerakan' }));
    await user.click(screen.getByRole('button', { name: 'Hapus' }));
    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/gerakan'));
    expect(await services.catalog.detail(id)).toBeNull();
  });

  it('otot utama wajib', async () => {
    const { user } = await renderLibrary();
    await user.click(await screen.findByRole('link', { name: 'Gerakan baru' }));
    await user.type(await screen.findByLabelText('Nama gerakan'), 'Gerakan X');
    await user.click(screen.getByRole('button', { name: 'Simpan gerakan' }));
    expect(await screen.findByText('Pilih minimal satu otot utama.')).toBeInTheDocument();
  });
});
