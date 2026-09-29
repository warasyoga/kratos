import { must } from '../testing/profiles';
import { TEST_EXERCISES } from '../testing/exercises';
import type { WorkingSetRecord } from '../workout/types';
import { completedSetsPerMuscle, weeklyAttendance, weeklyTonnage } from './volume';

const byId = (id: string) => TEST_EXERCISES.find((e) => e.id === id);
const rec = (logDate: string, exerciseId: string, weightKg = 50, reps = 10): WorkingSetRecord => ({
  sessionId: logDate,
  logDate,
  exerciseId,
  weightKg,
  reps,
});

describe('completedSetsPerMuscle', () => {
  it('otot utama 1 set, otot pendukung ½ set', () => {
    const sets = completedSetsPerMuscle(
      [
        rec('2026-09-28', 'barbell-bench-press'),
        rec('2026-09-28', 'barbell-bench-press'),
        rec('2026-09-28', 'barbell-bench-press'),
      ],
      byId,
    );
    const bench = must(byId('barbell-bench-press'));
    expect(sets.get('chest')).toBe(3);
    expect(sets.get(must(bench.secondaryMuscles[0]))).toBe(1.5);
  });

  it('gerakan yang tidak dikenal diabaikan', () => {
    expect(completedSetsPerMuscle([rec('2026-09-28', 'unknown')], byId).size).toBe(0);
  });
});

describe('weeklyTonnage', () => {
  it('Σ beban × repetisi per minggu (Senin–Minggu)', () => {
    const tonnage = weeklyTonnage(
      [
        rec('2026-09-21', 'barbell-bench-press', 50, 10),
        rec('2026-09-27', 'barbell-bench-press', 50, 10),
        rec('2026-09-28', 'barbell-bench-press', 60, 5),
      ],
      ['2026-09-21', '2026-09-28'],
    );
    expect(tonnage).toEqual([
      { weekStart: '2026-09-21', tonnageKg: 1000 },
      { weekStart: '2026-09-28', tonnageKg: 300 },
    ]);
  });
});

describe('weeklyAttendance', () => {
  it('hari terjadwal hanya dihitung jika sudah tiba dan setelah program mulai', () => {
    const attendance = weeklyAttendance(
      ['2026-09-22', '2026-09-24', '2026-09-28'],
      ['mon', 'tue', 'thu', 'fri'],
      ['2026-09-21', '2026-09-28'],
      '2026-09-29',
      '2026-09-22',
    );
    expect(attendance).toEqual([
      // Senin 21 sebelum program mulai → 3 hari terjadwal.
      { weekStart: '2026-09-21', done: 2, scheduled: 3 },
      // Minggu ini baru Senin & Selasa yang tiba.
      { weekStart: '2026-09-28', done: 1, scheduled: 2 },
    ]);
  });
});
