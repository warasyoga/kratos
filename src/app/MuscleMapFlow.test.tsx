import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { must } from '@/domain/testing/profiles';
import { AppProviders } from './providers';
import { routes } from './router';

const MONDAY_7 = new Date('2026-09-28T07:00:00').getTime();
const HOUR = 3_600_000;

/** Senin 07.00: satu set bench press (dada), lalu buka peta otot Senin 19.00. */
async function renderMap() {
  let now = MONDAY_7;
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
  now = MONDAY_7 + 12 * HOUR;

  render(
    <AppProviders services={services}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/progres/otot'] })} />
    </AppProviders>,
  );
  return { user: userEvent.setup({ delay: null }) };
}

describe('Peta otot', () => {
  it('otot yang baru dilatih diberi status teks, bukan hanya warna', async () => {
    await renderMap();
    expect(await screen.findByRole('button', { name: 'Dada, baru dilatih' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paha depan, segar' })).toBeInTheDocument();
  });

  it('ketuk otot → set minggu ini dan perkiraan siap lagi', async () => {
    const { user } = await renderMap();
    await user.click(await screen.findByRole('button', { name: 'Dada, baru dilatih' }));
    const sheet = await screen.findByRole('dialog', { name: 'Dada' });
    expect(within(sheet).getByText('Rabu pagi')).toBeInTheDocument();
    expect(within(sheet).getByText('1')).toBeInTheDocument();
  });

  it('mode volume memberi label jumlah set', async () => {
    const { user } = await renderMap();
    await user.click(await screen.findByRole('button', { name: 'Volume minggu ini' }));
    expect(await screen.findByRole('button', { name: 'Dada, 1 set' })).toBeInTheDocument();
  });
});
