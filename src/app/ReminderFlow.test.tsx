import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createServices } from '@/application/services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '@/application/testing/inMemoryDeps';
import { AppProviders } from './providers';
import { routes } from './router';

async function renderProfile() {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  render(
    <AppProviders services={services}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/profil'] })} />
    </AppProviders>,
  );
  const card = (await screen.findByRole('heading', { name: 'Pengingat' })).closest('section');
  if (!card) throw new Error('kartu pengingat tidak ada');
  return { deps, card, user: userEvent.setup({ delay: null }) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Profil → Pengingat', () => {
  it('tanpa dukungan notifikasi: penjelasan tampil, toggle tetap mati', async () => {
    const { card, user, deps } = await renderProfile();
    expect(within(card).getByText(/pasang Kratos ke layar utama/)).toBeInTheDocument();
    await user.click(within(card).getByRole('switch', { name: /Pengingat minum air/ }));
    expect(deps.state.reminders.waterNotify).toBe(false);
  });

  it('izin diminta saat toggle dinyalakan; diberikan → tersimpan', async () => {
    const requestPermission = vi.fn(async () => 'granted' as const);
    vi.stubGlobal('Notification', { permission: 'default', requestPermission });
    const { card, user, deps } = await renderProfile();
    expect(requestPermission).not.toHaveBeenCalled();

    await user.click(within(card).getByRole('switch', { name: /Pengingat minum air/ }));
    expect(requestPermission).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(deps.state.reminders.waterNotify).toBe(true));
  });

  it('izin ditolak → penjelasan, pengaturan tidak berubah', async () => {
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: async () => 'denied',
    });
    const { card, user, deps } = await renderProfile();
    await user.click(within(card).getByRole('switch', { name: /Notifikasi timer istirahat/ }));
    expect(await within(card).findByText(/Izin notifikasi ditolak/)).toBeInTheDocument();
    expect(deps.state.reminders.restTimerNotify).toBe(false);
  });

  it('tambahkan ke kalender HP mengunduh file .ics', async () => {
    const createObjectURL = vi.fn(() => 'blob:ics');
    // jsdom tidak punya createObjectURL: pasang sementara, dilepas di akhir test.
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    onTestFinished(() => {
      Reflect.deleteProperty(URL, 'createObjectURL');
      Reflect.deleteProperty(URL, 'revokeObjectURL');
    });
    const { card, user, deps } = await renderProfile();
    await user.click(within(card).getByRole('button', { name: 'Tambahkan ke kalender HP' }));
    expect(await screen.findByText(/File kalender diunduh/)).toBeInTheDocument();
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(deps.state.reminders.calendarSignature).toMatch(/@17:30$/);
  });
});
