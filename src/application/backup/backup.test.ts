import { must } from '@/domain/testing/profiles';
import { createServices } from '../services';
import { createInMemoryDeps, EXAMPLE_ONBOARDING } from '../testing/inMemoryDeps';

const MONDAY = new Date('2026-09-28T07:00:00').getTime();

async function setup() {
  const deps = createInMemoryDeps({ clock: { now: () => MONDAY } });
  const services = createServices(deps);
  return { deps, services };
}

/** Pengguna dengan profil, 1 sesi, ukuran, makan, foto, dan gerakan buatan sendiri. */
async function withData() {
  const ctx = await setup();
  const { services } = ctx;
  await services.profile.completeOnboarding(EXAMPLE_ONBOARDING);
  await services.workout.start();
  const first = must(must(await services.workout.getActive()).exercises[0]);
  await services.workout.sets.complete(must(first.sets.find((s) => s.kind === 'working')).id, {
    weightKg: 52.5,
    reps: 10,
  });
  await services.workout.finish();
  await services.progress.logMetric({ waistCm: 80 });
  await services.nutrition.logFood({ label: 'Nasi', kcal: 270, proteinG: 4.5 });
  await services.progress.photos.add({
    file: new Blob(['foto'], { type: 'image/jpeg' }),
    pose: 'front',
  });
  await services.catalog.custom.create({
    name: 'Crossover Rendah',
    pattern: 'horizontal_push',
    primaryMuscles: ['chest'],
    secondaryMuscles: [],
    equipment: ['cable'],
    loadType: 'cable',
    measure: 'reps',
  });
  return ctx;
}

const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));

describe('backup & pemulihan', () => {
  it('ekspor → pulihkan di perangkat kosong: semua data kembali, tanggal backup tercatat', async () => {
    const source = await withData();
    const exported = await source.services.backup.exportData();
    expect(exported.ok && exported.value.fileName).toBe('kratos-backup-2026-09-28.zip');
    expect(await source.services.backup.lastBackupAt()).toBe(MONDAY);

    const target = await setup();
    const preview = await target.services.backup.inspect(
      exported.ok ? exported.value.bytes : new Uint8Array(),
    );
    if (!preview.ok) throw new Error(preview.error.code);
    expect(preview.value.summary).toEqual({
      sessions: 1,
      firstDate: '2026-09-28',
      lastDate: '2026-09-28',
      photos: 1,
      profileName: 'Aris',
    });
    expect(target.deps.state.profile).toBeNull(); // pratinjau tidak mengubah data

    await target.services.backup.restore(preview.value.backup);
    const { state } = target.deps;
    expect(state.profile?.name).toBe('Aris');
    expect(state.sessions).toHaveLength(1);
    expect(state.setLogs.filter((s) => s.completedAt !== undefined)).toHaveLength(1);
    expect(state.foods).toHaveLength(1);
    expect(state.photos[0]?.blob.size).toBe(4);
    expect(state.custom.size).toBe(1);
    expect(must(await target.services.program.getActive()).days).toHaveLength(4);
    expect(await target.services.backup.lastBackupAt()).toBe(MONDAY);
  });

  it('file rusak atau asing ditolak tanpa mengubah data', async () => {
    const { services, deps } = await withData();
    const garbage = await services.backup.inspect(new TextEncoder().encode('bukan zip'));
    expect(!garbage.ok && garbage.error.code).toBe('backup_invalid');

    const foreign = await deps.archive.pack({
      'manifest.json': encode({ app: 'lain', schemaVersion: 2, exportedAt: 0 }),
      'data.json': encode({}),
    });
    const rejected = await services.backup.inspect(foreign);
    expect(!rejected.ok && rejected.error.code).toBe('backup_invalid');
    expect(deps.state.profile?.name).toBe('Aris');
  });

  it('backup dari versi lebih baru ditolak; foto yang hilang dari zip ditolak', async () => {
    const { services, deps } = await withData();
    const exported = await services.backup.exportData();
    const files = await deps.archive.unpack(exported.ok ? exported.value.bytes : new Uint8Array());

    const newer = await deps.archive.pack({
      ...files,
      'manifest.json': encode({ app: 'kratos', schemaVersion: 99, exportedAt: 0 }),
    });
    const tooNew = await services.backup.inspect(newer);
    expect(!tooNew.ok && tooNew.error.code).toBe('backup_newer');

    const withoutPhotos = Object.fromEntries(
      Object.entries(files).filter(([name]) => !name.startsWith('photos/')),
    );
    const missing = await services.backup.inspect(await deps.archive.pack(withoutPhotos));
    expect(!missing.ok && missing.error.code).toBe('backup_invalid');
  });

  it('backup skema v1 (tanpa aktivitas pemulihan) dimigrasikan', async () => {
    const { services, deps } = await withData();
    const exported = await services.backup.exportData();
    const files = await deps.archive.unpack(exported.ok ? exported.value.bytes : new Uint8Array());
    const data = JSON.parse(new TextDecoder().decode(files['data.json'])) as Record<
      string,
      unknown
    >;
    delete data.activityLogs;
    const v1 = await deps.archive.pack({
      ...files,
      'manifest.json': encode({ app: 'kratos', schemaVersion: 1, exportedAt: 0 }),
      'data.json': encode(data),
    });
    const preview = await services.backup.inspect(v1);
    expect(preview.ok && preview.value.backup.data.activityLogs).toEqual([]);
  });

  it('CSV riwayat set: nama gerakan, koma desimal', async () => {
    const { services } = await withData();
    const csv = await services.backup.exportSetsCsv([
      'Tanggal',
      'Hari',
      'Gerakan',
      'Jenis',
      'Set',
      'Beban (kg)',
      'Repetisi',
      'RIR',
    ]);
    expect(csv.fileName).toBe('kratos-riwayat-set-2026-09-28.csv');
    const lines = csv.content.split('\r\n');
    expect(lines[1]).toBe('2026-09-28;Upper A;Bench Press;working;1;52,5;10;');
  });
});
