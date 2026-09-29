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

describe('nutrisi harian', () => {
  it('target profil contoh: 2.880 kkal, 137 g protein, air 2,5 L di hari gym', async () => {
    const { services } = await setup();
    const day = must(await services.nutrition.day());
    expect(day.isGymDay).toBe(true);
    expect(day.targets).toMatchObject({ kcal: 2880, proteinG: 137, waterMl: 2500 });
    expect(day.intake).toEqual({ kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, waterMl: 0 });
  });

  it('catat makan, air, simpan menu favorit, dan catat ulang menu', async () => {
    const { services } = await setup();
    await services.nutrition.logFood({
      label: 'Nasi + ayam',
      kcal: 650,
      proteinG: 45,
      saveAsMeal: true,
    });
    await services.nutrition.logWater(500);
    const meal = must(must(await services.nutrition.day()).meals[0]);
    expect(meal).toMatchObject({ label: 'Nasi + ayam', kcal: 650, proteinG: 45 });

    await services.nutrition.logMeal(meal.id);
    const day = must(await services.nutrition.day());
    expect(day.foods).toHaveLength(2);
    expect(day.intake).toMatchObject({ kcal: 1300, proteinG: 90, waterMl: 500 });
  });

  it('porsi referensi TKPI: nasi 1 piring = 270 kkal', async () => {
    const { services } = await setup();
    await services.nutrition.logReference('nasi');
    const [food] = must(await services.nutrition.day()).foods;
    expect(food).toMatchObject({ label: 'Nasi putih 150 g', kcal: 270, proteinG: 4.5 });
  });

  it('makan lewat tengah malam bisa dipindah ke tanggal kemarin', async () => {
    const { services } = await setup();
    const logged = await services.nutrition.logFood({ label: 'Roti', kcal: 200, proteinG: 6 });
    const id = logged.ok ? logged.value.id : '';
    expect(
      (
        await services.nutrition.updateFood(id, {
          label: 'Roti',
          kcal: 200,
          proteinG: 6,
          logDate: '2026-09-27',
        })
      ).ok,
    ).toBe(true);
    expect(must(await services.nutrition.day()).foods).toHaveLength(0);
  });

  it('validasi: nama kosong, tanggal di masa depan, air di luar batas', async () => {
    const { services } = await setup();
    const empty = await services.nutrition.logFood({ label: ' ', kcal: 100, proteinG: 5 });
    expect(!empty.ok && empty.error.fields).toMatchObject({ label: 'food_label_required' });
    const future = await services.nutrition.logFood({
      label: 'Nanti',
      kcal: 100,
      proteinG: 5,
      logDate: '2026-09-30',
    });
    expect(!future.ok && future.error.fields).toEqual({ logDate: 'date_future' });
    const water = await services.nutrition.logWater(5000);
    expect(!water.ok && water.error.fields).toEqual({ _: 'water_range' });
  });

  it('riwayat 7 hari: rata-rata hanya dari hari yang dicatat', async () => {
    const { services, goTo } = await setup();
    await services.nutrition.logFood({ label: 'A', kcal: 2000, proteinG: 100 });
    goTo(1);
    await services.nutrition.logFood({ label: 'B', kcal: 3000, proteinG: 140 });
    goTo(3);
    const day = must(await services.nutrition.day());
    expect(day.history.map((d) => d.logDate)).toEqual(['2026-09-28', '2026-09-29']);
    expect(day.historyAverage).toEqual({ kcal: 2500, proteinG: 120 });
  });
});

describe('saran dari data riwayat', () => {
  it('protein < 80% target di ≥ 4 dari 7 hari → saran protein', async () => {
    const { services, goTo } = await setup();
    for (let d = 0; d < 5; d++) {
      goTo(d);
      await services.nutrition.logFood({ label: 'Makan', kcal: 2500, proteinG: 90 });
    }
    goTo(5);
    const suggestions = await services.program.suggestions.list();
    expect(suggestions.map((s) => s.ruleId)).toContain('low_protein');
  });

  it('berat datar 2 minggu → kalibrasi +150 kkal; setelah diterapkan target naik dan jeda 14 hari', async () => {
    const { services, goTo } = await setup();
    for (let d = 1; d <= 15; d++) {
      goTo(d);
      await services.progress.logMetric({ weightKg: 68.4 });
    }
    const calibration = (await services.program.suggestions.list()).find(
      (s) => s.ruleId === 'calorie_recalibration',
    );
    expect(calibration?.params).toEqual({ deltaKcal: 150 });

    expect((await services.program.suggestions.apply('calorie_recalibration', 'calories')).ok).toBe(
      true,
    );
    expect(must(await services.profile.getOverview()).targets.kcal).toBe(3030);
    expect((await services.program.suggestions.list()).map((s) => s.ruleId)).not.toContain(
      'calorie_recalibration',
    );
  });

  it('dua minggu tanpa latihan → saran program 3 hari', async () => {
    const { services, goTo } = await setup();
    goTo(15);
    expect((await services.program.suggestions.list()).map((s) => s.ruleId)).toContain(
      'low_attendance',
    );
  });
});
