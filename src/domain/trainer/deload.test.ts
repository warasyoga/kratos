import { blockWeek, earlyDeloadSignals, isScheduledDeloadWeek, programWeek } from './deload';

describe('programWeek & blockWeek', () => {
  it('minggu pertama dimulai di tanggal mulai', () => {
    expect(programWeek('2026-09-28', '2026-09-28')).toBe(1);
    expect(programWeek('2026-09-28', '2026-10-04')).toBe(1);
    expect(programWeek('2026-09-28', '2026-10-05')).toBe(2);
  });

  it('blok berulang setiap 6 minggu', () => {
    expect([1, 5, 6, 7, 12, 13].map(blockWeek)).toEqual([1, 5, 6, 1, 6, 1]);
  });

  it('minggu ke-6 adalah deload terjadwal', () => {
    expect(isScheduledDeloadWeek('2026-09-28', '2026-11-02')).toBe(true); // minggu 6
    expect(isScheduledDeloadWeek('2026-09-28', '2026-11-09')).toBe(false); // minggu 7
  });
});

describe('earlyDeloadSignals', () => {
  const dropping = [80, 82, 77, 76]; // terbaik 82; dua terakhir ≤ 77,9
  const steady = [80, 81, 82, 83];
  const base = {
    blockWeek: 4,
    e1rmHistory: [steady],
    recentReadiness: ['green', 'green'] as const,
    decreaseDecisionsThisWeek: 0,
  };

  it('minggu 3: tidak diusulkan walau performa turun', () => {
    expect(
      earlyDeloadSignals({ ...base, blockWeek: 3, e1rmHistory: [dropping, dropping, dropping] }),
    ).toEqual([]);
  });

  it('minggu 4: performa turun di ≥ 3 gerakan', () => {
    expect(
      earlyDeloadSignals({ ...base, e1rmHistory: [dropping, dropping, dropping, steady] }),
    ).toEqual(['performance_drop']);
  });

  it('minggu 4: 3 check-in kuning/merah dalam 7 hari', () => {
    expect(
      earlyDeloadSignals({ ...base, recentReadiness: ['yellow', 'red', 'green', 'yellow'] }),
    ).toEqual(['poor_readiness']);
  });

  it('beban diturunkan di 3 gerakan dalam seminggu', () => {
    expect(earlyDeloadSignals({ ...base, decreaseDecisionsThisWeek: 3 })).toEqual([
      'repeated_decreases',
    ]);
  });

  it('turun sedikit (< 5%) tidak dihitung', () => {
    expect(earlyDeloadSignals({ ...base, e1rmHistory: Array(3).fill([80, 82, 80, 79]) })).toEqual(
      [],
    );
  });

  it('minggu 6 sudah deload terjadwal', () => {
    expect(earlyDeloadSignals({ ...base, blockWeek: 6, decreaseDecisionsThisWeek: 5 })).toEqual([]);
  });
});
