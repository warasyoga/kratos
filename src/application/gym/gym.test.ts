import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

async function onboarded() {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  return { deps, services };
}

describe('setEquipment', () => {
  it('mematikan barbell mengganti gerakan dan melaporkan namanya', async () => {
    const { services } = await onboarded();
    const result = await services.gym.setEquipment(
      EXAMPLE_ONBOARDING.equipment.filter((e) => e !== 'barbell'),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.changes).toContainEqual({
      kind: 'substituted',
      fromName: 'Bench Press',
      toName: 'Dumbbell Bench Press',
      reason: 'equipment',
    });

    const program = await services.program.getActive();
    const names = program?.days.flatMap((d) => d.exercises.map((e) => e.exercise.name));
    expect(names).not.toContain('Bench Press');
  });

  it('menyalakan kembali barbell mengembalikan gerakan asal', async () => {
    const { services } = await onboarded();
    const without = EXAMPLE_ONBOARDING.equipment.filter((e) => e !== 'barbell');
    await services.gym.setEquipment(without);
    const result = await services.gym.setEquipment(EXAMPLE_ONBOARDING.equipment);
    expect(result.ok && result.value.changes.every((c) => c.kind === 'restored')).toBe(true);
  });

  it('alat tidak dikenal ditolak', async () => {
    const { services } = await onboarded();
    expect((await services.gym.setEquipment(['treadmill'])).ok).toBe(false);
  });
});

describe('kondisi kesehatan', () => {
  const shoulder = {
    area: 'shoulder_left',
    severity: 'mild',
    painfulMovements: ['vertical_push'],
    note: '',
  };

  it('menambah kondisi mengganti gerakan yang berisiko', async () => {
    const { services } = await onboarded();
    const result = await services.gym.saveHealthCondition(shoulder);
    expect(result.ok && result.value.changes).toContainEqual(
      expect.objectContaining({
        fromName: 'Seated Dumbbell Shoulder Press',
        toName: 'Landmine Press',
        reason: 'health',
      }),
    );
  });

  it('menonaktifkan kondisi mengembalikan gerakan asal', async () => {
    const { deps, services } = await onboarded();
    await services.gym.saveHealthCondition(shoulder);
    const [condition] = deps.state.conditions.values();
    const result = await services.gym.saveHealthCondition(shoulder, {
      id: condition?.id ?? '',
      active: false,
    });
    expect(result.ok && result.value.changes[0]?.kind).toBe('restored');
  });

  it('menghapus kondisi', async () => {
    const { deps, services } = await onboarded();
    await services.gym.saveHealthCondition(shoulder);
    const [condition] = deps.state.conditions.values();
    await services.gym.removeHealthCondition(condition?.id ?? '');
    expect(deps.state.conditions.size).toBe(0);
  });

  it('ID yang tidak ada ditolak', async () => {
    const { services } = await onboarded();
    const result = await services.gym.saveHealthCondition(shoulder, { id: 'tidak-ada' });
    expect(result).toMatchObject({ ok: false, error: { code: 'condition_not_found' } });
  });
});

describe('getActiveProgram', () => {
  it('hari berisi gerakan terurut, total set, dan estimasi durasi', async () => {
    const { services } = await onboarded();
    const program = await services.program.getActive();
    const upperA = program?.days[0];
    expect(upperA?.day.label).toBe('Upper A');
    expect(upperA?.exercises[0]?.exercise.name).toBe('Bench Press');
    expect(upperA?.totalSets).toBe(16);
    expect(upperA?.estimatedMinutes).toBeGreaterThan(30);
  });
});

describe('inventaris pelat & dumbbell', () => {
  const form = {
    barKg: 15,
    platesKg: [20, 10, 5, 2.5],
    dumbbellMinKg: 2.5,
    dumbbellMaxKg: 25,
    dumbbellStepKg: 2.5,
    machineStepKg: 5,
  };

  it('menyimpan dan membangun deret dumbbell', async () => {
    const { services } = await onboarded();
    expect((await services.gym.inventory.save(form)).ok).toBe(true);
    const inv = await services.gym.inventory.get();
    expect(inv).toMatchObject({ barKg: 15, platesKg: [20, 10, 5, 2.5], machineStepKg: 5 });
    expect(inv.dumbbellsKg.slice(0, 3)).toEqual([2.5, 5, 7.5]);
    expect(inv.dumbbellsKg.at(-1)).toBe(25);
  });

  it('dumbbell maksimal < minimal ditolak', async () => {
    const { services } = await onboarded();
    const result = await services.gym.inventory.save({ ...form, dumbbellMaxKg: 2 });
    expect(result).toMatchObject({
      ok: false,
      error: { fields: { dumbbellMaxKg: 'dumbbell_order' } },
    });
  });

  it('pelat yang tidak dikenal ditolak', async () => {
    const { services } = await onboarded();
    expect((await services.gym.inventory.save({ ...form, platesKg: [7] })).ok).toBe(false);
  });
});
