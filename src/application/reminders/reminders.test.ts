import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

const text = {
  calendarName: 'Kratos',
  summary: (label: string) => `Latihan ${label}`,
  alarm: 'Latihan 30 menit lagi',
};

async function setup() {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  return { deps, services };
}

describe('pengingat', () => {
  it('default: jam 17.30, notifikasi mati (izin diminta hanya saat dinyalakan)', async () => {
    const { services } = await setup();
    expect(await services.reminders.get()).toEqual({
      settings: { workoutTime: '17:30', restTimerNotify: false, waterNotify: false },
      calendarOutdated: false,
    });
  });

  it('file kalender memuat 4 hari latihan; jadwal berubah → perlu diperbarui', async () => {
    const { services } = await setup();
    const file = await services.reminders.calendarFile(text);
    expect(file.ok && file.value.fileName).toBe('kratos-jadwal-latihan.ics');
    expect(file.ok && file.value.content.match(/BEGIN:VEVENT/g)).toHaveLength(4);
    expect((await services.reminders.get()).calendarOutdated).toBe(false);

    await services.profile.changeTrainingDays(['mon', 'wed', 'fri']);
    expect((await services.reminders.get()).calendarOutdated).toBe(true);
  });

  it('ubah jam juga membuat kalender perlu diperbarui; jam tidak valid ditolak', async () => {
    const { services } = await setup();
    await services.reminders.calendarFile(text);
    expect((await services.reminders.update({ workoutTime: '06:15' })).ok).toBe(true);
    expect((await services.reminders.get()).calendarOutdated).toBe(true);

    const bad = await services.reminders.update({ workoutTime: '25:00' });
    expect(!bad.ok && bad.error.fields).toEqual({ workoutTime: 'time_invalid' });
  });
});
