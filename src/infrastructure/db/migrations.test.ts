import Dexie from 'dexie';
import { KratosDatabase, SCHEMA_V1 } from './database';

describe('migrasi database', () => {
  it('v1 → v2: data lama utuh, tabel aktivitas tersedia', async () => {
    const name = 'kratos-migration-test';
    const v1 = new Dexie(name);
    v1.version(1).stores(SCHEMA_V1);
    await v1.open();
    await v1.table('profile').put({ id: 'me', name: 'Aris' });
    await v1.table('sessions').put({ id: 's1', logDate: '2026-09-28', status: 'finished' });
    v1.close();

    const db = new KratosDatabase(name);
    await db.open();
    expect(db.verno).toBe(2);
    expect(await db.profile.get('me')).toMatchObject({ name: 'Aris' });
    expect(await db.sessions.count()).toBe(1);
    await db.activityLogs.put({
      id: 'a1',
      logDate: '2026-09-30',
      kind: 'walk',
      minutes: 35,
      createdAt: 0,
    });
    expect(await db.activityLogs.where('logDate').equals('2026-09-30').count()).toBe(1);
    await db.delete();
  });
});
