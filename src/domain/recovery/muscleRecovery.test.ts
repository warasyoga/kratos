import { TEST_EXERCISES } from '../testing/exercises';
import type { WorkingSetRecord } from '../workout/types';
import { muscleRecovery, recoveryHours, recoveryStatus } from './muscleRecovery';

const HOUR = 3_600_000;
const byId = (id: string) => TEST_EXERCISES.find((e) => e.id === id);
const MONDAY_18 = new Date('2026-09-28T18:00:00').getTime();

const set = (exerciseId: string, completedAt: number, rir?: number): WorkingSetRecord => ({
  sessionId: 's1',
  logDate: '2026-09-28',
  exerciseId,
  weightKg: 50,
  reps: 8,
  completedAt,
  ...(rir !== undefined && { rir }),
});

describe('recoveryHours (docs/sains-latihan/05 §3)', () => {
  it.each([
    [3, 2, 48],
    [6, 2, 72],
    [3, 1, 72],
    [3, null, 48],
    [12, 0, 72],
  ] as const)('kelelahan %s set, RIR rata-rata %s → %s jam', (sets, rir, hours) => {
    expect(recoveryHours(sets, rir)).toBe(hours);
  });
});

describe('recoveryStatus', () => {
  it.each([
    [10, 48, 'recent'],
    [24, 48, 'partial'],
    [47, 48, 'partial'],
    [48, 48, 'fresh'],
  ] as const)('%s dari %s jam → %s', (elapsed, needed, status) => {
    expect(recoveryStatus(elapsed, needed)).toBe(status);
  });
});

describe('muscleRecovery', () => {
  const records = [
    set('barbell-bench-press', MONDAY_18, 2),
    set('barbell-bench-press', MONDAY_18, 2),
    set('barbell-bench-press', MONDAY_18, 2),
  ];

  it('bench 3 set: dada baru dilatih, pulih 48 jam kemudian', () => {
    const chest = muscleRecovery(records, byId, MONDAY_18 + 12 * HOUR).find(
      (m) => m.muscle === 'chest',
    );
    expect(chest).toMatchObject({
      status: 'recent',
      fatigueSets: 3,
      recoveryHours: 48,
      recoveredAt: MONDAY_18 + 48 * HOUR,
    });
  });

  it('otot pendukung ½ set; Rabu malam sudah segar', () => {
    const status = muscleRecovery(records, byId, MONDAY_18 + 50 * HOUR);
    const triceps = status.find((m) => m.muscle === 'triceps');
    expect(triceps?.fatigueSets).toBe(1.5);
    expect(triceps?.status).toBe('fresh');
  });

  it('otot yang tidak dilatih: segar tanpa tanggal', () => {
    const quads = muscleRecovery(records, byId, MONDAY_18).find((m) => m.muscle === 'quads');
    expect(quads).toMatchObject({ status: 'fresh', lastTrainedAt: null, recoveredAt: null });
  });

  it('memakai sesi terakhir, bukan sesi lama', () => {
    const old = { ...set('barbell-bench-press', MONDAY_18 - 96 * HOUR, 0), sessionId: 'old' };
    const chest = muscleRecovery([old, ...records], byId, MONDAY_18).find(
      (m) => m.muscle === 'chest',
    );
    expect(chest?.fatigueSets).toBe(3);
    expect(chest?.recoveryHours).toBe(48);
  });
});
