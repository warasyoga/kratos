import { must } from '@/domain/testing/profiles';
import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

async function onboarded() {
  const deps = createInMemoryDeps();
  const services = createServices(deps);
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  const program = must(await services.program.getActive());
  const day = (label: string) => must(program.days.find((d) => d.day.label === label));
  return { deps, services, program, day };
}

const labelsOf = async (
  services: Awaited<ReturnType<typeof onboarded>>['services'],
  label: string,
) => {
  const program = must(await services.program.getActive());
  return must(program.days.find((d) => d.day.label === label)).exercises.map(
    (e) => e.exercise.name,
  );
};

describe('editor program', () => {
  it('mengubah resep dan menolak nilai di luar batas', async () => {
    const { services, day } = await onboarded();
    const bench = must(day('Upper A').exercises[0]).programExercise;

    expect(
      await services.program.edit.updatePrescription(bench.id, { sets: 4, restSec: 150 }),
    ).toEqual({
      ok: true,
      value: undefined,
    });
    const updated = must(await services.program.getActive()).days[0]?.exercises[0]?.programExercise;
    expect(updated).toMatchObject({ sets: 4, restSec: 150, repMin: 8 });

    const invalid = await services.program.edit.updatePrescription(bench.id, { sets: 9 });
    expect(invalid).toMatchObject({ ok: false, error: { fields: { sets: 'sets_range' } } });
  });

  it('menambah, mengganti, dan menghapus gerakan', async () => {
    const { services, day } = await onboarded();
    const upperA = day('Upper A');
    await services.program.edit.addExercise(upperA.day.id, 'face-pull');
    expect(await labelsOf(services, 'Upper A')).toContain('Face Pull');

    const bench = must(upperA.exercises[0]).programExercise;
    await services.program.edit.swapExercise(bench.id, 'dumbbell-bench-press');
    expect((await labelsOf(services, 'Upper A'))[0]).toBe('Dumbbell Bench Press');

    await services.program.edit.removeExercise(bench.id);
    expect(await labelsOf(services, 'Upper A')).not.toContain('Dumbbell Bench Press');
  });

  it('mengubah urutan', async () => {
    const { services, day } = await onboarded();
    const upperA = day('Upper A');
    const ids = upperA.exercises.map((e) => e.programExercise.id);
    await services.program.edit.reorderDay(upperA.day.id, [...ids].reverse());
    expect((await labelsOf(services, 'Upper A'))[0]).toBe('Dumbbell Curl');
  });

  it('pindah hari memperbarui jadwal di profil', async () => {
    const { deps, services, day } = await onboarded();
    await services.program.edit.moveDay(day('Upper A').day.id, 'wed');
    expect(deps.state.profile?.trainingDays).toEqual(['tue', 'wed', 'thu', 'fri']);
  });

  it('urungkan mengembalikan perubahan terakhir (termasuk jadwal)', async () => {
    const { deps, services, day } = await onboarded();
    await services.program.edit.moveDay(day('Upper A').day.id, 'wed');
    expect((await services.program.edit.undo()).ok).toBe(true);
    expect(deps.state.profile?.trainingDays).toEqual(['mon', 'tue', 'thu', 'fri']);
    expect(await services.program.edit.undo()).toMatchObject({
      ok: false,
      error: { code: 'nothing_to_undo' },
    });
  });

  it('ringkasan volume otot besar ikut diperbarui', async () => {
    const { services, day } = await onboarded();
    const before = must(await services.program.getActive()).weeklyVolume;
    expect(before.every((v) => v.status === 'optimal')).toBe(true);

    for (const e of day('Upper B').exercises.filter((x) =>
      x.exercise.primaryMuscles.includes('chest'),
    )) {
      await services.program.edit.removeExercise(e.programExercise.id);
    }
    const chest = must(await services.program.getActive()).weeklyVolume.find(
      (v) => v.muscle === 'chest',
    );
    expect(chest).toMatchObject({ sets: 6, frequency: 1, status: 'low' });
  });
});

describe('saran trainer', () => {
  it('program bawaan tanpa saran', async () => {
    const { services } = await onboarded();
    expect(await services.program.suggestions.list()).toEqual([]);
  });

  it('setelah dada dikurangi → saran muncul, diterapkan, lalu hilang', async () => {
    const { services, day } = await onboarded();
    const fly = must(day('Upper B').exercises.find((e) => e.exercise.id === 'cable-fly'));
    await services.program.edit.removeExercise(fly.programExercise.id);

    const [suggestion] = await services.program.suggestions.list();
    expect(suggestion).toMatchObject({ ruleId: 'low_weekly_volume', targetKey: 'chest' });

    const applied = await services.program.suggestions.apply('low_weekly_volume', 'chest');
    expect(applied.ok).toBe(true);
    expect(await services.program.suggestions.list()).toEqual([]);
    expect(await labelsOf(services, 'Upper B')).toContain('Dumbbell Bench Press');
  });

  it('diabaikan → tidak muncul lagi selama 14 hari', async () => {
    const { deps, services, day } = await onboarded();
    const fly = must(day('Upper B').exercises.find((e) => e.exercise.id === 'cable-fly'));
    await services.program.edit.removeExercise(fly.programExercise.id);

    expect((await services.program.suggestions.dismiss('low_weekly_volume', 'chest')).ok).toBe(
      true,
    );
    expect(await services.program.suggestions.list()).toEqual([]);
    expect(deps.state.suggestions[0]).toMatchObject({ status: 'dismissed', targetKey: 'chest' });
  });

  it('saran yang sudah tidak berlaku ditolak', async () => {
    const { services } = await onboarded();
    const result = await services.program.suggestions.apply('low_weekly_volume', 'chest');
    expect(result).toMatchObject({ ok: false, error: { code: 'suggestion_gone' } });
  });

  it('menerapkan saran bisa diurungkan', async () => {
    const { services, day } = await onboarded();
    const fly = must(day('Upper B').exercises.find((e) => e.exercise.id === 'cable-fly'));
    await services.program.edit.removeExercise(fly.programExercise.id);
    await services.program.suggestions.apply('low_weekly_volume', 'chest');
    await services.program.edit.undo();
    expect(await labelsOf(services, 'Upper B')).not.toContain('Dumbbell Bench Press');
  });
});

describe('katalog', () => {
  it('status ketersediaan mengikuti alat dan kondisi pengguna', async () => {
    const { services } = await onboarded();
    await services.gym.setEquipment(EXAMPLE_ONBOARDING.equipment.filter((e) => e !== 'barbell'));
    const items = await services.catalog.list();
    expect(items.find((i) => i.exercise.id === 'barbell-bench-press')?.unavailable).toBe(
      'equipment',
    );
    expect(items.find((i) => i.exercise.id === 'pull-up')?.unavailable).toBe('difficulty');
    expect(items.find((i) => i.exercise.id === 'dumbbell-bench-press')?.unavailable).toBeNull();
  });

  it('detail berisi panduan dan alternatif', async () => {
    const { services } = await onboarded();
    const detail = must(await services.catalog.detail('barbell-bench-press'));
    expect(detail.guide?.instructions.length).toBeGreaterThan(0);
    expect(detail.alternatives.map((e) => e.id)).toContain('dumbbell-bench-press');
    expect(await services.catalog.detail('tidak-ada')).toBeNull();
  });

  it('pengganti gerakan program tidak memuat gerakan lain di hari yang sama', async () => {
    const { services, day } = await onboarded();
    const bench = must(day('Upper A').exercises[0]).programExercise;
    const options = (await services.catalog.substitutesFor(bench.id)).map((o) => o.exercise.id);
    expect(options).toContain('dumbbell-bench-press');
    expect(options).not.toContain('incline-dumbbell-press');
  });
});
