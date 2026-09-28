import { decideCalorieAdjustment, weeklyGainTargetKg } from './recalibration';

describe('weeklyGainTargetKg', () => {
  it('contoh dokumen: 68,4 kg → 0,17–0,34 kg/minggu', () => {
    const target = weeklyGainTargetKg(68.4);
    expect(target.min).toBeCloseTo(0.171, 3);
    expect(target.max).toBeCloseTo(0.342, 3);
  });
});

describe('decideCalorieAdjustment', () => {
  const base = { bodyWeightKg: 68.4, weighInsInWindow: 8 };

  it.each([
    [0.1, { kind: 'increase', deltaKcal: 150 }],
    [0.25, { kind: 'keep' }],
    [0.5, { kind: 'decrease', deltaKcal: -150 }],
  ])('naik %s kg/minggu → %o', (weeklyGainKg, expected) => {
    expect(decideCalorieAdjustment({ ...base, weeklyGainKg })).toEqual(expected);
  });

  it('kurang dari 6 penimbangan → data belum cukup', () => {
    expect(decideCalorieAdjustment({ ...base, weeklyGainKg: 0, weighInsInWindow: 5 })).toEqual({
      kind: 'insufficient_data',
    });
  });
});
