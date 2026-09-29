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

/** Latihan Senin 28 Sep, lalu buka aplikasi `daysLater` hari kemudian. */
async function renderAfterSession(path: string, daysLater: number) {
  let now = MONDAY;
  const deps = createInMemoryDeps({ clock: { now: () => now } });
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  await services.workout.start();
  const first = must(must(await services.workout.getActive()).exercises[0]);
  await services.workout.sets.complete(must(first.sets.find((s) => s.kind === 'working')).id, {
    weightKg: 50,
    reps: 10,
  });
  await services.workout.finish();
  now = MONDAY + daysLater * DAY;

  render(
    <AppProviders services={services}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </AppProviders>,
  );
  return { deps, user: userEvent.setup({ delay: null }) };
}

describe('Lencana & evaluasi', () => {
  it('lencana yang baru terbuka diumumkan sekali dan tercatat', async () => {
    const { deps } = await renderAfterSession('/progres?bagian=lencana', 0);
    expect(await screen.findByText('Lencana terbuka: Langkah Pertama')).toBeInTheDocument();
    expect(await screen.findByText('1 dari 14 terbuka')).toBeInTheDocument();
    expect(deps.state.achievements.map((a) => a.achievementId)).toEqual(['first_session']);
  });

  it('tanggal 1: kartu evaluasi bulan lalu di Hari Ini → layar evaluasi', async () => {
    const { user } = await renderAfterSession('/', 3);
    await user.click(await screen.findByRole('link', { name: /Evaluasi September 2026/ }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Evaluasi September 2026' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 dari 2 sesi (50%)')).toBeInTheDocument();
  });
});
