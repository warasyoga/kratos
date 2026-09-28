import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

function setup() {
  const deps = createInMemoryDeps();
  return { deps, services: createServices(deps) };
}

async function onboarded() {
  const ctx = setup();
  const result = await ctx.services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return ctx;
}

describe('completeOnboarding', () => {
  it('menyimpan profil, alat, berat, dan program pertama', async () => {
    const { deps, services } = setup();
    const result = await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);

    expect(result).toEqual({
      ok: true,
      value: { programName: 'Upper/Lower 4 hari', warnings: [] },
    });
    expect(deps.state.profile).toMatchObject({
      name: 'Aris',
      trainingDays: ['mon', 'tue', 'thu', 'fri'],
      proteinGPerKg: 2,
      parqAllNo: true,
    });
    expect(deps.state.equipment).toHaveLength(16);
    expect(await deps.bodyMetrics.latestWeightKg()).toBe(68.4);
    const program = await deps.programs.getActive();
    expect(program?.program.startDate).toBe('2026-09-28');
    expect(program?.days).toHaveLength(4);
  });

  it('kondisi kesehatan ikut disimpan dan memengaruhi program', async () => {
    const { deps, services } = setup();
    await services.profile.completeOnboarding({
      ...EXAMPLE_ONBOARDING,
      conditions: [
        {
          area: 'shoulder_left',
          severity: 'mild',
          painfulMovements: ['vertical_push'],
          note: 'Nyeri saat angkat ke atas',
        },
      ],
    });
    expect(deps.state.conditions.size).toBe(1);
    const program = await deps.programs.getActive();
    expect(program?.exercises.map((e) => e.exerciseId)).toContain('landmine-press');
  });

  it('PAR-Q+ dengan jawaban "ya" tetap boleh lanjut, dicatat', async () => {
    const { deps, services } = setup();
    await services.profile.completeOnboarding({
      ...EXAMPLE_ONBOARDING,
      parq: { ...EXAMPLE_ONBOARDING.parq, bone_joint: true },
    });
    expect(deps.state.profile?.parqAllNo).toBe(false);
  });

  it.each([
    [{ heightCm: 100 }, 'heightCm', 'height_range'],
    [{ weightKg: 300 }, 'weightKg', 'weight_range'],
    [{ name: '  ' }, 'name', 'name_required'],
    [{ birthDate: '2015-01-01' }, 'birthDate', 'age_range'],
    [{ trainingDays: ['mon', 'tue'] }, 'trainingDays', 'training_days_range'],
  ])('validasi %o → %s: %s', async (patch, field, code) => {
    const { services } = setup();
    const result = await services.profile.completeOnboarding({ ...EXAMPLE_ONBOARDING, ...patch });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.fields?.[field]).toBe(code);
  });

  it('tidak bisa onboarding dua kali', async () => {
    const { services } = await onboarded();
    const again = await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
    expect(again).toMatchObject({ ok: false, error: { code: 'already_onboarded' } });
  });
});

describe('getOverview', () => {
  it('null sebelum onboarding', async () => {
    expect(await setup().services.profile.getOverview()).toBeNull();
  });

  it('target sesuai contoh dokumen (pria 24 th, 175 cm, 68,4 kg, aktivitas sedang)', async () => {
    const { services } = await onboarded();
    const overview = await services.profile.getOverview();
    expect(overview).toMatchObject({
      ageYears: 24,
      weightKg: 68.4,
      bmiCategory: 'normal',
      parq: 'clear',
      targets: {
        kcal: 2880,
        proteinG: 137,
        fatG: 80,
        carbsG: 403,
        waterRestL: 2,
        waterGymL: 2.5,
      },
    });
    expect(overview?.bmi).toBeCloseTo(22.33, 2);
  });
});

describe('updateProfile', () => {
  it('berat baru dicatat dan target dihitung ulang', async () => {
    const { services } = await onboarded();
    const result = await services.profile.update({ weightKg: 70 });
    expect(result.ok).toBe(true);
    const overview = await services.profile.getOverview();
    expect(overview?.weightKg).toBe(70);
    expect(overview?.targets.proteinG).toBe(140);
  });

  it('faktor protein di luar 1,6–2,2 ditolak', async () => {
    const { services } = await onboarded();
    const result = await services.profile.update({ proteinGPerKg: 3 });
    expect(result).toMatchObject({
      ok: false,
      error: { fields: { proteinGPerKg: 'protein_range' } },
    });
  });

  it('gagal jika belum onboarding', async () => {
    const result = await setup().services.profile.update({ name: 'Budi' });
    expect(result).toMatchObject({ ok: false, error: { code: 'profile_missing' } });
  });
});

describe('changeTrainingDays', () => {
  it('3 hari → program Full Body baru, program lama tetap tersimpan', async () => {
    const { deps, services } = await onboarded();
    const result = await services.profile.changeTrainingDays(['mon', 'wed', 'fri']);
    expect(result).toMatchObject({ ok: true, value: { programName: 'Full Body 3 hari' } });
    expect(deps.state.profile?.trainingDays).toEqual(['mon', 'wed', 'fri']);
    expect(deps.state.programs).toHaveLength(2);
    expect((await services.program.getActive())?.days).toHaveLength(3);
  });

  it('7 hari ditolak', async () => {
    const { services } = await onboarded();
    const result = await services.profile.changeTrainingDays([
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat',
      'sun',
    ]);
    expect(result.ok).toBe(false);
  });
});

describe('submitParq', () => {
  it('menyimpan hasil skrining', async () => {
    const { deps, services } = await onboarded();
    await services.profile.submitParq({ ...EXAMPLE_ONBOARDING.parq, medication: true });
    expect(deps.state.profile?.parqAllNo).toBe(false);
    expect((await services.profile.getOverview())?.parq).toBe('consult_doctor');
  });
});
