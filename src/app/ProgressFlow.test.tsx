import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { must } from '@/domain/testing/profiles';
import { AppProviders } from './providers';
import { routes } from './router';

const MONDAY = new Date('2026-09-28T07:00:00').getTime();
const DAY = 86_400_000;

/** Dua Senin berturut-turut latihan Upper A (bench press 50×10 lalu 52,5×10). */
async function renderProgress(path = '/progres') {
  let now = MONDAY;
  const deps = createInMemoryDeps({ clock: { now: () => now } });
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  for (const [day, weightKg] of [
    [0, 50],
    [7, 52.5],
  ] as const) {
    now = MONDAY + day * DAY;
    await services.workout.start();
    const first = must(must(await services.workout.getActive()).exercises[0]);
    const set = must(first.sets.find((s) => s.kind === 'working'));
    await services.workout.sets.complete(set.id, { weightKg, reps: 10 });
    await services.workout.finish();
  }
  now = MONDAY + 8 * DAY;

  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { deps, router, user: userEvent.setup({ delay: null }) };
}

describe('Progres — kekuatan', () => {
  it('rekor pribadi, grafik 1RM, dan detail gerakan', async () => {
    const { user, router } = await renderProgress();
    const prs = await screen.findByRole('heading', { name: 'Rekor pribadi terbaru' });
    expect(within(must(prs.closest('section'))).getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /1RM estimasi Bench Press/ })).toBeInTheDocument();
    expect(screen.getAllByText('70 kg').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('link', { name: /Bench Press/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Bench Press' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/progres/gerakan/barbell-bench-press');
    expect(screen.getByText('Riwayat sesi')).toBeInTheDocument();
    expect(screen.getByText('52,5 kg × 10')).toBeInTheDocument();
  });

  it('bagian dan rentang tersimpan di URL', async () => {
    const { user, router } = await renderProgress();
    await user.click(await screen.findByRole('button', { name: '4 mgg' }));
    await user.click(screen.getByRole('button', { name: 'Volume' }));
    expect(router.state.location.search).toBe('?rentang=4&bagian=volume');
    expect(await screen.findByText('Set per otot minggu ini')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Tonase 4 minggu/ })).toBeInTheDocument();
  });
});

describe('Progres — tubuh', () => {
  it('catat ukuran → tabel ukuran dan estimasi lemak', async () => {
    const { user, deps } = await renderProgress('/progres?bagian=tubuh');
    expect(await screen.findByText('Waktunya mengukur')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Catat ukuran' }));
    const sheet = await screen.findByRole('dialog', { name: 'Catat ukuran' });
    await user.type(within(sheet).getByLabelText('Leher'), '37');
    await user.type(within(sheet).getByLabelText('Pinggang'), '80');
    await user.click(within(sheet).getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('rowheader', { name: 'Pinggang' })).toBeInTheDocument();
    expect(screen.getByText('13,7%')).toBeInTheDocument();
    expect(screen.queryByText('Waktunya mengukur')).not.toBeInTheDocument();
    expect(deps.state.bodyMetrics.at(-1)).toMatchObject({ neckCm: 37, waistCm: 80 });
  });

  it('ukuran di luar batas ditampilkan di kolom', async () => {
    const { user } = await renderProgress();
    await user.click(await screen.findByRole('button', { name: 'Tubuh' }));
    await user.click(await screen.findByRole('button', { name: 'Catat ukuran' }));
    const sheet = await screen.findByRole('dialog');
    await user.type(within(sheet).getByLabelText('Pinggang'), '10');
    await user.click(within(sheet).getByRole('button', { name: 'Simpan' }));
    expect(await within(sheet).findByText('Ukuran di luar batas wajar.')).toBeInTheDocument();
  });
});

describe('Progres — foto', () => {
  it('tambah foto lalu bandingkan dua foto', async () => {
    const { user, deps } = await renderProgress();
    await user.click(await screen.findByRole('button', { name: 'Foto' }));
    expect(await screen.findByText(/Belum ada foto/)).toBeInTheDocument();

    for (const pose of ['Depan', 'Samping']) {
      await user.click(screen.getByRole('button', { name: 'Tambah foto' }));
      const sheet = await screen.findByRole('dialog', { name: 'Tambah foto progres' });
      await user.click(within(sheet).getByRole('radio', { name: pose }));
      await user.upload(
        within(sheet).getByLabelText('Pilih atau ambil foto'),
        new File(['x'], 'foto.jpg', { type: 'image/jpeg' }),
      );
      expect(
        await screen.findByRole('button', { name: `Buka: Foto ${pose}, 6 Okt` }),
      ).toBeVisible();
    }
    expect(deps.state.photos).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Bandingkan' }));
    await user.click(screen.getByRole('button', { name: 'Pilih: Foto Depan, 6 Okt' }));
    await user.click(screen.getByRole('button', { name: 'Pilih: Foto Samping, 6 Okt' }));
    expect(await screen.findByRole('dialog', { name: 'Perbandingan' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Geser untuk membandingkan' })).toBeInTheDocument();
  });
});
