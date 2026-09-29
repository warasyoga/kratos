import { must } from '@/domain/testing/profiles';
import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

const MONDAY = new Date('2026-09-28T07:00:00').getTime();
const DAY = 86_400_000;

async function setup() {
  let now = MONDAY;
  const deps = createInMemoryDeps({ clock: { now: () => now } });
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  return { deps, services, goTo: (days: number) => (now = MONDAY + days * DAY) };
}

const ruleIds = async (services: Awaited<ReturnType<typeof setup>>['services']) =>
  (await services.program.suggestions.list()).map((s) => s.ruleId);

describe('deload lebih awal (docs/mesin-trainer/06-deload.md)', () => {
  const badCheckIn = { sleepHours: 3, soreness: 5, energy: 1, painAreas: [] };

  it('minggu ke-4 blok + 3 check-in merah dalam 7 hari → diusulkan; diterapkan → minggu ini deload', async () => {
    const { services, goTo } = await setup();
    for (const day of [21, 22, 23]) {
      goTo(day);
      await services.checkIn.submit(badCheckIn);
    }
    expect(await ruleIds(services)).toContain('deload_due');

    expect((await services.program.suggestions.apply('deload_due', 'program')).ok).toBe(true);
    const plan = must(await services.today.plan());
    expect(plan.isDeloadWeek).toBe(true);
    expect(plan.blockWeek).toBe(6);
    expect(await ruleIds(services)).not.toContain('deload_due');
  });

  it('minggu ke-3 dengan sinyal yang sama → tidak diusulkan', async () => {
    const { services, goTo } = await setup();
    for (const day of [14, 15, 16]) {
      goTo(day);
      await services.checkIn.submit(badCheckIn);
    }
    expect(await ruleIds(services)).not.toContain('deload_due');
  });
});

describe('pengingat backup', () => {
  it('> 14 hari tanpa backup → saran; setelah ekspor hilang', async () => {
    const { services, goTo } = await setup();
    goTo(14);
    expect(await ruleIds(services)).not.toContain('backup_reminder');
    goTo(15);
    expect(await ruleIds(services)).toContain('backup_reminder');
    await services.backup.exportData();
    expect(await ruleIds(services)).not.toContain('backup_reminder');
  });
});
