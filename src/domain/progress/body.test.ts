import type { BodyMetric } from '../body/types';
import { computeWeightTrend } from '../body/weightTrend';
import {
  bodyFatSeries,
  gainTargetBand,
  measurementChanges,
  measurementDue,
  weighInsOf,
  weightRate,
} from './body';

let n = 0;
const metric = (logDate: string, fields: Omit<BodyMetric, 'id' | 'logDate' | 'createdAt'>) => ({
  id: `m${++n}`,
  logDate,
  createdAt: n,
  ...fields,
});

/** Tren datar lalu naik: berat tetap `base` selama 8 hari, lalu `next` setiap hari. */
function trendOf(values: number[]) {
  return computeWeightTrend(
    values.map((weightKg, i) => ({
      logDate: `2026-09-${String(i + 1).padStart(2, '0')}`,
      weightKg,
    })),
  );
}

describe('weighInsOf', () => {
  it('hanya catatan dengan berat, urut waktu', () => {
    const list = weighInsOf([
      metric('2026-09-03', { weightKg: 69 }),
      metric('2026-09-01', { weightKg: 68 }),
      metric('2026-09-02', { waistCm: 80 }),
    ]);
    expect(list).toEqual([
      { logDate: '2026-09-01', weightKg: 68 },
      { logDate: '2026-09-03', weightKg: 69 },
    ]);
  });
});

describe('weightRate', () => {
  it('null jika data < 8 hari', () => {
    expect(weightRate(trendOf([68, 68, 68]))).toBeNull();
  });

  it('tren datar → di bawah target naik', () => {
    const rate = weightRate(trendOf(Array(10).fill(68)));
    expect(rate).toEqual({ weeklyChangeKg: 0, weeklyPct: 0, status: 'below' });
  });

  it('naik ±0,3%/minggu → sesuai target', () => {
    // Tren linear sempurna: 68 kg + 0,03 kg/hari ≈ 0,21 kg/minggu ≈ 0,31%.
    const trend = Array.from({ length: 15 }, (_, i) => ({
      logDate: `2026-09-${String(i + 1).padStart(2, '0')}`,
      trendKg: 68 + 0.03 * i,
    }));
    const rate = weightRate(trend);
    expect(rate?.weeklyPct).toBeCloseTo(0.21 / 68.21, 4);
    expect(rate?.status).toBe('on_target');
  });

  it('naik > 0,5%/minggu → terlalu cepat', () => {
    const trend = Array.from({ length: 8 }, (_, i) => ({
      logDate: `2026-09-0${i + 1}`,
      trendKg: 68 + 0.1 * i,
    }));
    expect(weightRate(trend)?.status).toBe('above');
  });
});

describe('gainTargetBand', () => {
  it('0,25–0,5% per minggu dari titik awal', () => {
    const band = gainTargetBand({ logDate: '2026-09-01', trendKg: 68 }, [
      '2026-09-01',
      '2026-09-15',
    ]);
    expect(band[0]).toEqual({ logDate: '2026-09-01', loKg: 68, hiKg: 68 });
    expect(band[1]?.loKg).toBeCloseTo(68 * 1.005, 6);
    expect(band[1]?.hiKg).toBeCloseTo(68 * 1.01, 6);
  });
});

describe('measurementChanges', () => {
  const metrics = [
    metric('2026-08-01', { waistCm: 82, armCm: 32 }),
    metric('2026-09-01', { waistCm: 81, armCm: 33 }),
    metric('2026-09-15', { waistCm: 80.5, armCm: 34 }),
  ];

  it('nilai terbaru dan perubahan sejak catatan pertama di rentang', () => {
    const changes = measurementChanges(metrics, '2026-08-31');
    expect(changes.map((c) => [c.field, c.latestCm, c.changeCm])).toEqual([
      ['armCm', 34, 1],
      ['waistCm', 80.5, -0.5],
    ]);
  });

  it('satu catatan di rentang → perubahan null', () => {
    const changes = measurementChanges(metrics, '2026-09-10');
    expect(changes.every((c) => c.changeCm === null)).toBe(true);
  });
});

describe('bodyFatSeries', () => {
  it('pria: US Navy dari leher + pinggang (contoh dokumen 13,7%)', () => {
    const series = bodyFatSeries([metric('2026-09-01', { neckCm: 37, waistCm: 80 })], {
      sex: 'male',
      heightCm: 175,
    });
    expect(series[0]?.pct).toBeCloseTo(13.7, 1);
  });

  it('wanita tanpa pinggul dan ukuran tidak masuk akal dilewati', () => {
    expect(
      bodyFatSeries([metric('2026-09-01', { neckCm: 32, waistCm: 72 })], {
        sex: 'female',
        heightCm: 165,
      }),
    ).toEqual([]);
    expect(
      bodyFatSeries([metric('2026-09-01', { neckCm: 40, waistCm: 38 })], {
        sex: 'male',
        heightCm: 175,
      }),
    ).toEqual([]);
  });
});

describe('measurementDue', () => {
  it('belum pernah mengukur → waktunya mengukur', () => {
    expect(measurementDue([metric('2026-09-01', { weightKg: 68 })], '2026-09-02')).toBe(true);
  });

  it('14 hari setelah ukuran terakhir', () => {
    const metrics = [metric('2026-09-01', { waistCm: 80 })];
    expect(measurementDue(metrics, '2026-09-14')).toBe(false);
    expect(measurementDue(metrics, '2026-09-15')).toBe(true);
  });
});
