import type { SetLog, WorkoutSession } from '@/domain/workout/types';
import { KratosDatabase } from '../db/database';
import {
  DexieBodyMetricRepository,
  DexiePhotoRepository,
  DexieSessionRepository,
} from './dexieRepositories';

let db: KratosDatabase;
let n = 0;

beforeEach(async () => {
  db = new KratosDatabase(`kratos-progress-test-${++n}`);
  await db.open();
});

afterEach(async () => {
  await db.delete();
});

const session = (id: string, logDate: string, status: WorkoutSession['status']) =>
  ({
    id,
    programDayId: 'day',
    dayLabel: 'Upper A',
    readiness: 'green',
    logDate,
    startedAt: 0,
    status,
    adjustment: 'none',
    isDeloadWeek: false,
    plan: [],
  }) satisfies WorkoutSession;

const setLog = (id: string, sessionId: string, patch: Partial<SetLog> = {}): SetLog => ({
  id,
  sessionId,
  exerciseId: 'barbell-bench-press',
  programExerciseId: 'pe',
  setNumber: 1,
  kind: 'working',
  weightKg: 50,
  reps: 10,
  completedAt: 1,
  ...patch,
});

describe('DexieSessionRepository.workingSetsSince', () => {
  it('hanya set kerja selesai dari sesi selesai sejak tanggal tertentu', async () => {
    const repo = new DexieSessionRepository(db);
    const planned = setLog('d', 's1');
    delete planned.completedAt;
    await repo.save(session('old', '2026-08-01', 'finished'));
    await repo.save(session('s1', '2026-09-28', 'finished'));
    await repo.save(session('active', '2026-09-29', 'active'));
    await repo.saveSets([
      setLog('a', 'old'),
      setLog('b', 's1', { rir: 2 }),
      setLog('c', 's1', { kind: 'warmup' }),
      planned,
      setLog('e', 'active'),
    ]);

    expect(await repo.workingSetsSince('2026-09-01')).toEqual([
      {
        sessionId: 's1',
        logDate: '2026-09-28',
        exerciseId: 'barbell-bench-press',
        weightKg: 50,
        reps: 10,
        rir: 2,
      },
    ]);
  });
});

describe('DexieBodyMetricRepository', () => {
  it('list urut tanggal, remove menghapus, berat terakhir mengikuti', async () => {
    const repo = new DexieBodyMetricRepository(db);
    await repo.add({ id: 'b', logDate: '2026-09-02', weightKg: 69, createdAt: 2 });
    await repo.add({ id: 'a', logDate: '2026-09-01', weightKg: 68, createdAt: 1 });
    expect((await repo.list()).map((m) => m.id)).toEqual(['a', 'b']);
    expect(await repo.latestWeightKg()).toBe(69);

    await repo.remove('b');
    expect(await repo.latestWeightKg()).toBe(68);
  });
});

describe('DexiePhotoRepository', () => {
  // Isi Blob tidak bisa diperiksa di sini: fake-indexeddb tidak bisa mengkloning Blob jsdom.
  // Penyimpanan foto sungguhan diuji E2E di browser (tests/e2e/progress.spec.ts).
  it('terbaru lebih dulu, bisa dihapus', async () => {
    const repo = new DexiePhotoRepository(db);
    const blob = new Blob(['jpeg'], { type: 'image/jpeg' });
    const base = { pose: 'front' as const, blob, thumb: blob };
    await repo.add({ ...base, id: 'p1', logDate: '2026-09-01', createdAt: 1 });
    await repo.add({ ...base, id: 'p2', logDate: '2026-09-15', createdAt: 2 });

    const photos = await repo.list();
    expect(photos.map((p) => p.id)).toEqual(['p2', 'p1']);

    await repo.remove('p2');
    expect((await repo.list()).map((p) => p.id)).toEqual(['p1']);
  });
});
