import type { WorkingSetRecord } from '../workout/types';
import { e1rmSeries, exerciseTrend, prTimeline, sessionBests } from './strength';

const set = (
  sessionId: string,
  logDate: string,
  weightKg: number,
  reps: number,
  exerciseId = 'barbell-bench-press',
): WorkingSetRecord => ({ sessionId, logDate, exerciseId, weightKg, reps });

// Bench press 3 sesi: 50×10 (66,7) → 52,5×8 (66,5) → 52,5×10 (70,0)
const bench = [
  set('s1', '2026-09-07', 50, 10),
  set('s1', '2026-09-07', 50, 9),
  set('s2', '2026-09-14', 52.5, 8),
  set('s3', '2026-09-21', 52.5, 10),
];

describe('sessionBests', () => {
  it('set terbaik tiap sesi berdasarkan 1RM estimasi', () => {
    const bests = sessionBests(bench);
    expect(bests.map((b) => [b.sessionId, b.best.weightKg, b.best.reps])).toEqual([
      ['s1', 50, 10],
      ['s2', 52.5, 8],
      ['s3', 52.5, 10],
    ]);
    expect(bests[0]?.e1rmKg).toBeCloseTo(66.67, 2);
  });

  it('set > 10 repetisi tidak punya 1RM estimasi', () => {
    expect(sessionBests([set('s1', '2026-09-07', 20, 15)])[0]?.e1rmKg).toBeNull();
  });
});

describe('e1rmSeries', () => {
  it('satu titik per tanggal, Epley', () => {
    const series = e1rmSeries(bench);
    expect(series.map((p) => p.logDate)).toEqual(['2026-09-07', '2026-09-14', '2026-09-21']);
    expect(series[2]?.e1rmKg).toBeCloseTo(70, 5);
  });

  it('dua sesi di tanggal sama → nilai tertinggi', () => {
    const series = e1rmSeries([set('a', '2026-09-07', 40, 10), set('b', '2026-09-07', 60, 5)]);
    expect(series).toHaveLength(1);
    expect(series[0]?.e1rmKg).toBeCloseTo(70, 5);
  });
});

describe('prTimeline', () => {
  it('sesi pertama jadi patokan; rekor dihitung terhadap semua sesi sebelumnya', () => {
    const prs = prTimeline(bench);
    // s2: 52,5 × 8 → belum pernah 8 repetisi di ≥ 52,5 kg (rekor repetisi), 1RM turun.
    // s3: 52,5 × 10 → 1RM tertinggi dan repetisi terbanyak di 52,5 kg.
    expect(prs.map((p) => [p.sessionId, p.kinds])).toEqual([
      ['s2', ['reps_at_weight']],
      ['s3', ['estimated_1rm', 'reps_at_weight']],
    ]);
  });

  it('dipisah per gerakan dan diurutkan tanggal', () => {
    const prs = prTimeline([
      set('s1', '2026-09-07', 60, 5, 'barbell-back-squat'),
      set('s2', '2026-09-10', 65, 5, 'barbell-back-squat'),
      ...bench,
    ]);
    expect(prs.map((p) => `${p.exerciseId}@${p.logDate}`)).toEqual([
      'barbell-back-squat@2026-09-10',
      'barbell-bench-press@2026-09-14',
      'barbell-bench-press@2026-09-21',
    ]);
  });
});

describe('exerciseTrend', () => {
  it('perubahan = titik terakhir − titik pertama di rentang', () => {
    const trend = exerciseTrend('barbell-bench-press', bench, '2026-09-14');
    expect(trend.sessionCount).toBe(2);
    expect(trend.points).toHaveLength(2);
    expect(trend.changeKg).toBeCloseTo(70 - 66.5, 5);
    expect(trend.currentE1rmKg).toBeCloseTo(70, 5);
  });

  it('satu titik di rentang → perubahan null, nilai sekarang tetap ada', () => {
    const trend = exerciseTrend('barbell-bench-press', bench, '2026-09-21');
    expect(trend.changeKg).toBeNull();
    expect(trend.currentE1rmKg).toBeCloseTo(70, 5);
  });
});
