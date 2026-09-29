import { must } from '@/domain/testing/profiles';
import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

const valid = {
  name: 'Cable Crossover',
  pattern: 'horizontal_push',
  primaryMuscles: ['chest'],
  secondaryMuscles: ['shoulder_front'],
  equipment: ['cable'],
  loadType: 'cable',
  measure: 'reps',
  note: 'Tarik kabel menyilang di depan dada.',
};

async function setup() {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  return { services };
}

describe('gerakan buatan pengguna', () => {
  it('dibuat, muncul di katalog, catatan menjadi panduan', async () => {
    const { services } = await setup();
    const created = await services.catalog.custom.create(valid);
    const id = created.ok ? created.value.id : '';
    expect(id).toMatch(/^custom-/);

    const detail = must(await services.catalog.detail(id));
    expect(detail.exercise).toMatchObject({ name: 'Cable Crossover', isCustom: true });
    expect(detail.guide?.instructions).toEqual(['Tarik kabel menyilang di depan dada.']);
    expect((await services.catalog.list()).some((i) => i.exercise.id === id)).toBe(true);
  });

  it('bisa dipakai di program dan tidak bisa dihapus selama dipakai', async () => {
    const { services } = await setup();
    const created = await services.catalog.custom.create(valid);
    const id = created.ok ? created.value.id : '';
    const program = must(await services.program.getActive());
    const dayId = must(program.days[0]).day.id;
    expect((await services.program.edit.addExercise(dayId, id)).ok).toBe(true);

    const blocked = await services.catalog.custom.remove(id);
    expect(!blocked.ok && blocked.error.code).toBe('exercise_in_use');
  });

  it('ubah: nama baru tersimpan; draft memuat catatan', async () => {
    const { services } = await setup();
    const created = await services.catalog.custom.create(valid);
    const id = created.ok ? created.value.id : '';
    expect(
      (await services.catalog.custom.update(id, { ...valid, name: 'Crossover Rendah' })).ok,
    ).toBe(true);
    const draft = must(await services.catalog.custom.draft(id));
    expect(draft.exercise.name).toBe('Crossover Rendah');
    expect(draft.note).toBe('Tarik kabel menyilang di depan dada.');
    expect((await services.catalog.custom.remove(id)).ok).toBe(true);
    expect(await services.catalog.detail(id)).toBeNull();
  });

  it('validasi: otot utama wajib, nama tidak boleh sama dengan gerakan lain', async () => {
    const { services } = await setup();
    const noMuscle = await services.catalog.custom.create({ ...valid, primaryMuscles: [] });
    expect(!noMuscle.ok && noMuscle.error.fields).toMatchObject({
      primaryMuscles: 'primary_muscle_required',
    });
    const taken = await services.catalog.custom.create({ ...valid, name: 'bench press' });
    expect(!taken.ok && taken.error.fields).toEqual({ name: 'exercise_name_taken' });
  });

  it('gerakan bawaan tidak bisa diubah atau dihapus', async () => {
    const { services } = await setup();
    const result = await services.catalog.custom.remove('barbell-bench-press');
    expect(!result.ok && result.error.code).toBe('not_custom');
    expect(await services.catalog.custom.draft('barbell-bench-press')).toBeNull();
  });
});
