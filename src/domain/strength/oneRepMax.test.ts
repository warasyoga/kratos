import { bestEstimatedOneRepMax, estimateOneRepMax, estimateOneRepMaxBrzycki } from './oneRepMax';

describe('estimateOneRepMax (Epley)', () => {
  it('contoh dokumen: 65 kg × 8 → 82,3 kg', () => {
    expect(estimateOneRepMax(65, 8)).toBeCloseTo(82.33, 2);
  });

  it('1 repetisi mengembalikan beban itu sendiri', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it('lebih dari 10 repetisi tidak diestimasi', () => {
    expect(estimateOneRepMax(40, 12)).toBeNull();
  });

  it('menolak repetisi 0 atau pecahan', () => {
    expect(() => estimateOneRepMax(60, 0)).toThrow(RangeError);
    expect(() => estimateOneRepMax(60, 2.5)).toThrow(RangeError);
  });
});

describe('estimateOneRepMaxBrzycki', () => {
  it('contoh dokumen: 65 kg × 8 → 80,7 kg', () => {
    expect(estimateOneRepMaxBrzycki(65, 8)).toBeCloseTo(80.69, 2);
  });
});

describe('bestEstimatedOneRepMax', () => {
  it('mengambil set dengan 1RM estimasi tertinggi', () => {
    const best = bestEstimatedOneRepMax([
      { weightKg: 65, reps: 9 },
      { weightKg: 65, reps: 8 },
      { weightKg: 60, reps: 12 },
    ]);
    expect(best).toBeCloseTo(84.5, 2);
  });

  it('null jika tidak ada set yang bisa diestimasi', () => {
    expect(bestEstimatedOneRepMax([{ weightKg: 0, reps: 10 }])).toBeNull();
  });
});
