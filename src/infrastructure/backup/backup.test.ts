import { KratosDatabase } from '../db/database';
import { ensureCatalog } from '../db/seed';
import { DexieBackupRepository } from './dexieBackupRepository';
import { packZip, unpackZip } from './zipArchive';

describe('zipArchive (fflate)', () => {
  it('pack → unpack mengembalikan isi yang sama; bukan zip ditolak', async () => {
    const files = {
      'manifest.json': new TextEncoder().encode('{"app":"kratos"}'),
      'photos/p1.jpg': Uint8Array.from([255, 216, 255, 224]),
    };
    const unpacked = await unpackZip(await packZip(files));
    expect(Object.keys(unpacked).sort()).toEqual(['manifest.json', 'photos/p1.jpg']);
    expect([...(unpacked['photos/p1.jpg'] ?? [])]).toEqual([255, 216, 255, 224]);
    await expect(unpackZip(new TextEncoder().encode('bukan zip'))).rejects.toBeDefined();
  });
});

describe('DexieBackupRepository', () => {
  let db: KratosDatabase;
  let n = 0;

  beforeEach(async () => {
    db = new KratosDatabase(`kratos-backup-test-${++n}`);
    await db.open();
    await ensureCatalog(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  it('dump tanpa gerakan bawaan; restore mengganti data dan mempertahankan katalog', async () => {
    const repo = new DexieBackupRepository(db);
    await db.bodyMetrics.put({ id: 'm1', logDate: '2026-09-28', weightKg: 68.4, createdAt: 1 });
    await db.exercises.put({
      id: 'custom-1',
      name: 'Crossover Rendah',
      pattern: 'horizontal_push',
      mechanics: 'compound',
      equipment: ['cable'],
      primaryMuscles: ['chest'],
      secondaryMuscles: [],
      loadType: 'cable',
      measure: 'reps',
      difficulty: 1,
      stressedAreas: [],
      isCustom: true,
    });
    await repo.markBackedUp(123);

    const { data } = await repo.dump();
    expect(data.exercises.map((e) => e.id)).toEqual(['custom-1']);
    expect(data.bodyMetrics).toHaveLength(1);
    expect(data.settings.lastBackupAt).toBe(123);

    await db.bodyMetrics.put({ id: 'm2', logDate: '2026-09-29', weightKg: 69, createdAt: 2 });
    await repo.restore({ ...data, bodyMetrics: [] }, []);
    expect(await db.bodyMetrics.count()).toBe(0);
    expect(await db.exercises.get('custom-1')).toBeDefined();
    expect(await db.exercises.get('barbell-bench-press')).toBeDefined();
    expect((await db.settings.get('settings'))?.catalogVersion).toBeDefined();
    expect(await repo.lastBackupAt()).toBe(123);
  });
});
