import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { must } from '@/domain/testing/profiles';
import { AppProviders } from './providers';
import { routes } from './router';

const MONDAY = new Date('2026-09-28T07:00:00').getTime();
const DAY = 86_400_000;

/** Latihan Senin selesai, lalu buka aplikasi hari Rabu (hari pemulihan). */
async function renderWednesday() {
  let now = MONDAY;
  const deps = createInMemoryDeps({ clock: { now: () => now } });
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  await services.workout.start();
  const set = must(must(must(await services.workout.getActive()).exercises[0]).sets[0]);
  await services.workout.sets.complete(set.id, { weightKg: 40, reps: 10 });
  await services.workout.finish();
  now = MONDAY + 2 * DAY;

  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { deps, router, user: userEvent.setup({ delay: null }) };
}

describe('Hari Ini — hari pemulihan', () => {
  it('menampilkan kalender minggu dan latihan terlewat', async () => {
    await renderWednesday();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hari pemulihan' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Senin · Upper A · selesai' })).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Selasa · Lower A · terlewat' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Lower A (Selasa) belum dikerjakan minggu ini.')).toBeInTheDocument();
    expect(screen.getByText('Latihan berikutnya: Upper B (Kamis)')).toBeInTheDocument();
  });

  it('menandai jalan kaki selesai menambah menit aerobik', async () => {
    const { deps, user } = await renderWednesday();
    await user.click(
      await screen.findByRole('button', { name: 'Tandai selesai: Jalan kaki santai' }),
    );
    expect(
      await screen.findByRole('button', { name: 'Batalkan: Jalan kaki santai' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('progressbar', { name: /Aerobik minggu ini: 35/ })).toBeInTheDocument();
    expect(deps.state.activities).toHaveLength(1);
  });

  it('latihan terlewat bisa dikerjakan hari ini', async () => {
    const { user, router } = await renderWednesday();
    await user.click(await screen.findByRole('button', { name: 'Latih Lower A hari ini' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Back Squat' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/latihan');
  });
});
