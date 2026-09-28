import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { ServicesContext } from '@/application/ServicesContext';
import { createInMemoryDeps } from '@/application/testing/inMemoryDeps';
import { ToastProvider } from '@/shared/ui/Toast';
import { OnboardingScreen } from './OnboardingScreen';

function renderOnboarding() {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  const router = createMemoryRouter(
    [
      { path: '/onboarding', element: <OnboardingScreen /> },
      { path: '/program', element: <p>Layar program</p> },
      { path: '/', element: <p>Layar hari ini</p> },
    ],
    { initialEntries: ['/onboarding'] },
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ServicesContext.Provider value={services}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ServicesContext.Provider>
    </QueryClientProvider>,
  );
  return { deps, router };
}

const next = () =>
  userEvent.setup({ delay: null }).click(screen.getByRole('button', { name: 'Lanjut' }));

describe('OnboardingScreen', () => {
  it('alur lengkap menghasilkan profil dan program', async () => {
    const { deps, router } = renderOnboarding();
    const user = userEvent.setup({ delay: null });

    await user.click(await screen.findByRole('button', { name: 'Mulai' }));

    // Data diri — kosong dulu untuk memastikan validasi muncul.
    await next();
    expect(screen.getByText('Isi nama panggilan.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Nama panggilan'), 'Aris');
    await user.click(screen.getByRole('radio', { name: 'Pria' }));
    await user.type(screen.getByLabelText('Tanggal lahir'), '2002-05-10');
    await user.type(screen.getByLabelText('Tinggi badan'), '175');
    await user.type(screen.getByLabelText('Berat badan'), '68,4');
    await next();

    await user.click(await screen.findByRole('radio', { name: /Pemula/ }));
    await next();
    await user.click(await screen.findByRole('radio', { name: /^Sedang/ }));
    await next();

    // Jadwal default Sen, Sel, Kam, Jum.
    expect(await screen.findByText('4 hari dipilih')).toBeInTheDocument();
    await next();
    await next(); // alat: semua tersedia
    await next(); // kesehatan: tidak ada keluhan

    // PAR-Q+: 7 × "Tidak"
    const noButtons = await screen.findAllByRole('button', { name: 'Tidak' });
    expect(noButtons).toHaveLength(7);
    for (const button of noButtons) await user.click(button);
    await user.click(screen.getByRole('button', { name: 'Buat program saya' }));

    expect(await screen.findByRole('heading', { name: 'Program Anda siap' })).toBeInTheDocument();
    expect(await screen.findByText('2.880')).toBeInTheDocument();
    expect(deps.state.profile?.name).toBe('Aris');
    expect((await deps.programs.getActive())?.days).toHaveLength(4);

    await next();
    await user.click(screen.getByRole('button', { name: 'Selesai, lihat program' }));
    expect(router.state.location.pathname).toBe('/program');
  }, 30_000);

  it('PAR-Q+ harus dijawab semua', async () => {
    renderOnboarding();
    localStorage.clear();
    const user = userEvent.setup({ delay: null });
    await user.click(await screen.findByRole('button', { name: 'Mulai' }));
    await user.type(screen.getByLabelText('Nama panggilan'), 'Aris');
    await user.click(screen.getByRole('radio', { name: 'Pria' }));
    await user.type(screen.getByLabelText('Tanggal lahir'), '2002-05-10');
    await user.type(screen.getByLabelText('Tinggi badan'), '175');
    await user.type(screen.getByLabelText('Berat badan'), '68');
    await next();
    await user.click(screen.getByRole('radio', { name: /Pemula/ }));
    await next();
    await user.click(screen.getByRole('radio', { name: /^Sedang/ }));
    for (let i = 0; i < 4; i++) await next();

    await user.click(screen.getByRole('button', { name: 'Buat program saya' }));
    expect(screen.getAllByText('Jawab pertanyaan ini.')).toHaveLength(7);
  });

  it('umur di bawah 16 tahun ditolak', async () => {
    renderOnboarding();
    const user = userEvent.setup({ delay: null });
    await user.click(await screen.findByRole('button', { name: 'Mulai' }));
    await user.type(screen.getByLabelText('Tanggal lahir'), '2015-01-01');
    await next();
    expect(screen.getByText('Umur harus 16–80 tahun.')).toBeInTheDocument();
  });

  it('keluhan bisa ditambah dan dihapus sebelum selesai', async () => {
    renderOnboarding();
    const user = userEvent.setup({ delay: null });
    await user.click(await screen.findByRole('button', { name: 'Mulai' }));
    await user.type(screen.getByLabelText('Nama panggilan'), 'Aris');
    await user.click(screen.getByRole('radio', { name: 'Pria' }));
    await user.type(screen.getByLabelText('Tanggal lahir'), '2002-05-10');
    await user.type(screen.getByLabelText('Tinggi badan'), '175');
    await user.type(screen.getByLabelText('Berat badan'), '68');
    await next();
    await user.click(screen.getByRole('radio', { name: /Pemula/ }));
    await next();
    await user.click(screen.getByRole('radio', { name: /^Sedang/ }));
    for (let i = 0; i < 3; i++) await next();

    await user.click(screen.getByRole('button', { name: '+ Tambah keluhan' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Lutut kanan' }));
    await user.click(within(dialog).getByRole('radio', { name: /Sedang/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Simpan' }));
    expect(screen.getByText('Lutut kanan')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(screen.getByText('Tidak ada keluhan')).toBeInTheDocument();
  });
});
