import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { must } from '@/domain/testing/profiles';
import { AppProviders } from './providers';
import { routes } from './router';

async function renderAt(
  path: string,
  prepare?: (s: ReturnType<typeof createServices>) => Promise<void>,
) {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  await prepare?.(services);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { deps, services, router, user: userEvent.setup({ delay: null }) };
}

const dayId = async (services: ReturnType<typeof createServices>, label: string) =>
  must(must(await services.program.getActive()).days.find((d) => d.day.label === label)).day.id;

describe('Program', () => {
  it('menampilkan volume per otot dan tanpa saran untuk program bawaan', async () => {
    await renderAt('/program');
    expect(await screen.findByText('Set per otot · minggu')).toBeInTheDocument();
    expect(screen.getByText('Dada')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Saran trainer' })).not.toBeInTheDocument();
  });

  it('ubah set di hari latihan, lalu urungkan', async () => {
    const { services, user, router } = await renderAt('/program');
    await user.click(await screen.findByRole('link', { name: 'Ubah Upper A' }));
    expect(router.state.location.pathname).toBe(
      `/program/hari/${await dayId(services, 'Upper A')}`,
    );

    await user.click(await screen.findByRole('button', { name: /^Bench Press/ }));
    const dialog = screen.getByRole('dialog', { name: 'Bench Press' });
    await user.click(within(dialog).getByRole('button', { name: 'Tambah Set' }));
    await user.click(within(dialog).getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('button', { name: /^Bench Press/ })).toHaveTextContent(
      '4 × 8–12',
    );
    await user.click(within(screen.getByRole('status')).getByRole('button', { name: 'Urungkan' }));
    expect(await screen.findByText('Perubahan diurungkan.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Bench Press/ })).toHaveTextContent('3 × 8–12');
  });

  it('urutan gerakan bisa diubah dengan tombol naik/turun', async () => {
    const { services, user } = await renderAt('/program', async () => {});
    await user.click(await screen.findByRole('link', { name: 'Ubah Upper A' }));
    await user.click(await screen.findByRole('button', { name: 'Turunkan Bench Press' }));
    const upperA = must(must(await services.program.getActive()).days[0]);
    expect(upperA.exercises.map((e) => e.exercise.name).slice(0, 2)).toEqual([
      'Barbell Row',
      'Bench Press',
    ]);
  });

  it('saran muncul setelah volume dada kurang, lalu diterapkan', async () => {
    const { user } = await renderAt('/program', async (services) => {
      const program = must(await services.program.getActive());
      const fly = must(
        program.days.flatMap((d) => d.exercises).find((e) => e.exercise.id === 'cable-fly'),
      );
      await services.program.edit.removeExercise(fly.programExercise.id);
    });
    const card = await screen.findByRole('region', { name: 'Saran trainer' });
    expect(card).toHaveTextContent('Volume dada 8 set/minggu');
    expect(card).toHaveTextContent('Dumbbell Bench Press di Upper B');

    await user.click(within(card).getByRole('button', { name: 'Kenapa?' }));
    expect(card).toHaveTextContent('Schoenfeld');

    await user.click(within(card).getByRole('button', { name: 'Terapkan' }));
    expect(await screen.findByText('Saran diterapkan.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Saran trainer' })).not.toBeInTheDocument();
  });

  it('pindah hari lewat panel', async () => {
    const { deps, services, user } = await renderAt('/program');
    await user.click(await screen.findByRole('link', { name: 'Ubah Upper A' }));
    await user.click(await screen.findByRole('button', { name: 'Pindah hari' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Rabu' }));
    expect(await screen.findByText('Program disimpan.')).toBeInTheDocument();
    expect(deps.state.profile?.trainingDays).toEqual(['tue', 'wed', 'thu', 'fri']);
    expect(await dayId(services, 'Upper A')).toBeTruthy();
  });
});

describe('Perpustakaan gerakan', () => {
  it('mencari "dada" menemukan Bench Press, lalu membuka panduannya', async () => {
    const { user } = await renderAt('/gerakan');
    await user.type(await screen.findByLabelText('Cari gerakan, otot, atau alat'), 'dada');
    await user.click(screen.getByRole('link', { name: /^Bench Press/ }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Bench Press' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Cara melakukan')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dumbbell Bench Press' })).toBeInTheDocument();
  });

  it('mode tambah: memilih gerakan menambahkannya ke hari lalu kembali', async () => {
    const { services, user, router } = await renderAt('/program');
    const id = await dayId(services, 'Upper A');
    await router.navigate(`/gerakan?tambah=${id}`);
    await user.click(await screen.findByRole('button', { name: /^Face Pull/ }));
    expect(await screen.findByText('Face Pull ditambahkan ke Upper A.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/program/hari/${id}`);
  });

  it('gerakan yang tidak cocok ditandai', async () => {
    await renderAt('/gerakan');
    const pullUp = await screen.findByRole('link', { name: /^Pull-up/ });
    expect(pullUp).toHaveTextContent('Terlalu sulit untuk pemula');
  });
});
