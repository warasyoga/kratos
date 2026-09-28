import { createSequentialIds } from '@/domain/common/id';
import { DEFAULT_INVENTORY } from '@/domain/profile/inventory';
import type { UserProfile } from '@/domain/profile/types';
import { generateProgram } from '@/domain/program/generateProgram';
import { FULL_GYM, TEST_EXERCISES, testExercise } from '@/domain/testing/exercises';
import { KratosDatabase } from '../db/database';
import { ensureCatalog } from '../db/seed';
import { CATALOG_VERSION, EXERCISE_CATALOG } from '../seed/exerciseCatalog';
import {
  DexieBodyMetricRepository,
  DexieExerciseRepository,
  DexieGymRepository,
  DexieProfileRepository,
  DexieProgramRepository,
  DexieSuggestionRepository,
  DexieTransactionRunner,
} from './dexieRepositories';

let db: KratosDatabase;
let n = 0;

beforeEach(async () => {
  db = new KratosDatabase(`kratos-test-${++n}`);
  await db.open();
});

afterEach(async () => {
  await db.delete();
});

const profile: UserProfile = {
  id: 'me',
  name: 'Aris',
  sex: 'male',
  birthDate: '2002-05-10',
  heightCm: 175,
  goal: 'hypertrophy',
  experience: 'beginner',
  activityLevel: 'moderate',
  trainingDays: ['mon', 'tue', 'thu', 'fri'],
  proteinGPerKg: 2,
  createdAt: 0,
  updatedAt: 0,
};

function makeProgram(prefix: string) {
  return generateProgram({
    library: TEST_EXERCISES,
    availableEquipment: FULL_GYM,
    conditions: [],
    experience: 'beginner',
    trainingDays: ['mon', 'tue', 'thu', 'fri'],
    startDate: '2026-09-28',
    createdAt: 0,
    newId: createSequentialIds(prefix),
  });
}

describe('ensureCatalog', () => {
  it('memasang katalog sekali dan mencatat versinya', async () => {
    await ensureCatalog(db);
    expect(await db.exercises.count()).toBe(EXERCISE_CATALOG.length);
    expect((await db.settings.get('settings'))?.catalogVersion).toBe(CATALOG_VERSION);
  });

  it('gerakan buatan pengguna tidak terhapus', async () => {
    await db.exercises.put({
      ...testExercise('barbell-bench-press'),
      id: 'my-machine',
      isCustom: true,
    });
    await ensureCatalog(db);
    expect(await db.exercises.get('my-machine')).toBeDefined();
  });

  it('panduan tersedia lewat repository', async () => {
    await ensureCatalog(db);
    const repo = new DexieExerciseRepository(db);
    const guide = await repo.getGuide('barbell-bench-press');
    expect(guide?.instructions.length).toBeGreaterThan(0);
    expect(await repo.get('barbell-bench-press')).not.toHaveProperty('guide');
  });
});

describe('repository Dexie', () => {
  it('profil: simpan dan baca', async () => {
    const repo = new DexieProfileRepository(db);
    expect(await repo.get()).toBeNull();
    await repo.save(profile);
    expect(await repo.get()).toEqual(profile);
  });

  it('alat: hanya yang tersedia yang tersimpan; inventaris default', async () => {
    const repo = new DexieGymRepository(db);
    await repo.setEquipment(['barbell', 'bench']);
    await repo.setEquipment(['dumbbell']);
    expect(await repo.getEquipment()).toEqual(['dumbbell']);
    expect(await repo.getInventory()).toEqual(DEFAULT_INVENTORY);
  });

  it('program: program baru menonaktifkan yang lama, riwayat tetap ada', async () => {
    const repo = new DexieProgramRepository(db);
    const first = makeProgram('a');
    const second = makeProgram('b');
    await repo.saveAsActive(first);
    await repo.saveAsActive(second);

    const active = await repo.getActive();
    expect(active?.program.id).toBe(second.program.id);
    expect(active?.days.map((d) => d.label)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B']);
    expect(active?.exercises).toHaveLength(second.exercises.length);
    expect(await db.programs.count()).toBe(2);
  });

  it('berat terbaru berdasarkan tanggal lalu waktu catat', async () => {
    const repo = new DexieBodyMetricRepository(db);
    await repo.add({ id: '1', logDate: '2026-09-28', weightKg: 68.4, createdAt: 1 });
    await repo.add({ id: '2', logDate: '2026-09-28', weightKg: 68.6, createdAt: 2 });
    await repo.add({ id: '3', logDate: '2026-09-27', weightKg: 69, createdAt: 3 });
    await repo.add({ id: '4', logDate: '2026-09-29', waistCm: 80, createdAt: 4 });
    expect(await repo.latestWeightKg()).toBe(68.6);
  });

  it('transaksi: gagal di tengah → tidak ada yang tersimpan', async () => {
    const tx = new DexieTransactionRunner(db);
    const profiles = new DexieProfileRepository(db);
    await expect(
      tx.run(async () => {
        await profiles.save(profile);
        throw new Error('gagal');
      }),
    ).rejects.toThrow('gagal');
    expect(await profiles.get()).toBeNull();
  });
});

describe('program update & saran', () => {
  it('update menyimpan perubahan dan menghapus gerakan yang dibuang', async () => {
    const repo = new DexieProgramRepository(db);
    const bundle = makeProgram('u');
    await repo.saveAsActive(bundle);
    const [first, ...rest] = bundle.exercises;
    await repo.update({
      ...bundle,
      exercises: rest.map((e) => (e.id === rest[0]?.id ? { ...e, sets: 5 } : e)),
    });
    const active = await repo.getActive();
    expect(active?.exercises).toHaveLength(bundle.exercises.length - 1);
    expect(active?.exercises.some((e) => e.id === first?.id)).toBe(false);
    expect(active?.exercises.find((e) => e.id === rest[0]?.id)?.sets).toBe(5);
  });

  it('saran yang diabaikan tersimpan', async () => {
    const repo = new DexieSuggestionRepository(db);
    await repo.save({
      id: 's1',
      programId: 'p',
      ruleId: 'low_weekly_volume',
      targetKey: 'chest',
      status: 'dismissed',
      resolvedAt: 1,
    });
    expect(await repo.listResolved()).toHaveLength(1);
  });
});
