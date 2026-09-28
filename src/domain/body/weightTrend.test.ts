import { computeWeightTrend, weeklyTrendChangeKg } from './weightTrend';

describe('computeWeightTrend', () => {
  it('kosong jika tidak ada timbangan', () => {
    expect(computeWeightTrend([])).toEqual([]);
  });

  it('titik pertama = berat pertama, lalu dihaluskan 10%', () => {
    const trend = computeWeightTrend([
      { logDate: '2026-09-28', weightKg: 68.4 },
      { logDate: '2026-09-29', weightKg: 69.4 },
    ]);
    expect(trend[0]?.trendKg).toBe(68.4);
    expect(trend[1]?.trendKg).toBeCloseTo(68.5, 5);
  });

  it('hari tanpa timbangan mempertahankan tren', () => {
    const trend = computeWeightTrend([
      { logDate: '2026-09-28', weightKg: 68 },
      { logDate: '2026-10-01', weightKg: 69 },
    ]);
    expect(trend.map((p) => p.logDate)).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
    ]);
    expect(trend[2]).toEqual({ logDate: '2026-09-30', trendKg: 68 });
    expect(trend[3]?.trendKg).toBeCloseTo(68.1, 5);
  });

  it('lonjakan satu hari tidak menggeser tren banyak', () => {
    const days = Array.from({ length: 10 }, (_, i) => ({
      logDate: `2026-09-${String(10 + i).padStart(2, '0')}`,
      weightKg: i === 9 ? 70 : 68,
    }));
    const trend = computeWeightTrend(days);
    expect(trend.at(-1)?.trendKg).toBeCloseTo(68.2, 5);
  });
});

describe('weeklyTrendChangeKg', () => {
  it('null jika data kurang dari 8 hari', () => {
    expect(
      weeklyTrendChangeKg(computeWeightTrend([{ logDate: '2026-09-28', weightKg: 68 }])),
    ).toBeNull();
  });

  it('selisih tren hari ini dengan 7 hari lalu', () => {
    const trend = computeWeightTrend([
      { logDate: '2026-09-21', weightKg: 68 },
      { logDate: '2026-09-28', weightKg: 69 },
    ]);
    expect(weeklyTrendChangeKg(trend)).toBeCloseTo(0.1, 5);
  });
});
