import { buildCustomExercise } from '@/domain/exercise/custom';
import { KratosDatabase } from '../db/database';
import { ensureCatalog } from '../db/seed';
import { DexieExerciseRepository } from './dexieRepositories';

let db: KratosDatabase;
let n = 0;

beforeEach(async () => {
  db = new KratosDatabase(`kratos-exercise-test-${++n}`);
  await db.open();
});

afterEach(async () => {
  await db.delete();
});

const custom = buildCustomExercise('custom-1', {
  name: 'Crossover Rendah',
  pattern: 'horizontal_push',
  primaryMuscles: ['chest'],
  secondaryMuscles: [],
  equipment: ['cable'],
  loadType: 'cable',
  measure: 'reps',
});

describe('gerakan buatan pengguna di Dexie', () => {
  it('tersimpan dengan catatan sebagai panduan dan selamat dari pembaruan katalog', async () => {
    const repo = new DexieExerciseRepository(db);
    await repo.saveCustom(custom, 'Tarik menyilang.');
    await db.settings.put({ id: 'settings', catalogVersion: -1 }); // paksa pasang ulang katalog
    await ensureCatalog(db);

    expect(await repo.get('custom-1')).toMatchObject({ name: 'Crossover Rendah', isCustom: true });
    expect((await repo.getGuide('custom-1'))?.instructions).toEqual(['Tarik menyilang.']);
  });

  it('removeCustom hanya menghapus gerakan buatan pengguna', async () => {
    await ensureCatalog(db);
    const repo = new DexieExerciseRepository(db);
    await repo.saveCustom(custom);
    await repo.removeCustom('custom-1');
    await repo.removeCustom('barbell-bench-press');
    expect(await repo.get('custom-1')).toBeNull();
    expect(await repo.get('barbell-bench-press')).not.toBeNull();
  });
});
