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

/** Selesaikan latihan hari ini (satu set cukup). */
async function trainToday(services: Awaited<ReturnType<typeof setup>>['services']) {
  await services.workout.start();
  const view = must(await services.workout.getActive());
  const set = must(must(view.exercises[0]).sets.find((s) => s.kind === 'working'));
  await services.workout.sets.complete(set.id, { weightKg: 40, reps: 10 });
  await services.workout.finish();
}

describe('rencana hari ini', () => {
  it('Senin: hari gym Upper A, minggu 1, target air hari gym', async () => {
    const { services } = await setup();
    const plan = must(await services.today.plan());
    expect(plan).toMatchObject({
      kind: 'gym',
      programWeek: 1,
      blockWeek: 1,
      isDeloadWeek: false,
      hasActiveSession: false,
      streakWeeks: 0,
      targets: { kcal: 2880, proteinG: 137, waterL: 2.5 },
    });
    expect(plan.day?.day.label).toBe('Upper A');
    expect(plan.week.map((d) => d.status)).toEqual([
      'today',
      'upcoming',
      'recovery',
      'upcoming',
      'upcoming',
      'recovery',
      'recovery',
    ]);
  });

  it('setelah latihan: selesai hari ini dan tercentang di kalender', async () => {
    const { services } = await setup();
    await trainToday(services);
    const plan = must(await services.today.plan());
    expect(plan.doneToday?.dayLabel).toBe('Upper A');
    expect(plan.week[0]?.status).toBe('done');
  });

  it('Rabu: pemulihan, Selasa terlewat ditawarkan, latihan berikutnya Kamis', async () => {
    const { services, goTo } = await setup();
    await trainToday(services);
    goTo(2);
    const plan = must(await services.today.plan());
    expect(plan.kind).toBe('recovery');
    expect(plan.missed.map((d) => d.label)).toEqual(['Lower A']);
    expect(plan.next?.label).toBe('Upper B');
    expect(plan.targets?.waterL).toBe(2);
  });

  it('aktivitas pemulihan dicatat dan bisa dihapus', async () => {
    const { services, goTo } = await setup();
    goTo(2);
    await services.today.logActivity('walk');
    await services.today.logActivity('mobility');
    let plan = must(await services.today.plan());
    expect(plan.activitiesToday.map((a) => [a.kind, a.minutes])).toEqual([
      ['walk', 35],
      ['mobility', 10],
    ]);
    expect(plan.aerobicMinutesThisWeek).toBe(35);
    await services.today.removeActivity(must(plan.activitiesToday[0]).id);
    plan = must(await services.today.plan());
    expect(plan.activitiesToday).toHaveLength(1);
  });

  it('satu minggu penuh → streak 1 minggu', async () => {
    const { services, goTo } = await setup();
    for (const day of [0, 1, 3, 4]) {
      goTo(day);
      await trainToday(services);
    }
    goTo(5);
    expect(must(await services.today.plan()).streakWeeks).toBe(1);
  });

  it('minggu ke-6 adalah deload', async () => {
    const { services, goTo } = await setup();
    goTo(35);
    expect(must(await services.today.plan())).toMatchObject({ programWeek: 6, isDeloadWeek: true });
  });
});

describe('saran aerobik WHO', () => {
  it('tidak muncul di minggu pertama program', async () => {
    const { services } = await setup();
    expect((await services.program.suggestions.list()).map((s) => s.ruleId)).not.toContain(
      'aerobic_below_who',
    );
  });

  it('minggu lalu < 150 menit jalan kaki → saran muncul; ≥ 150 → tidak', async () => {
    const { services, goTo } = await setup();
    goTo(2);
    await services.today.logActivity('walk');
    goTo(7);
    expect((await services.program.suggestions.list()).map((s) => s.ruleId)).toContain(
      'aerobic_below_who',
    );

    goTo(5);
    for (let i = 0; i < 4; i++) await services.today.logActivity('walk');
    goTo(7);
    expect((await services.program.suggestions.list()).map((s) => s.ruleId)).not.toContain(
      'aerobic_below_who',
    );
  });
});
