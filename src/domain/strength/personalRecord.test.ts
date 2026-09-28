import { detectPersonalRecord } from './personalRecord';

const history = [
  { weightKg: 62.5, reps: 10 },
  { weightKg: 62.5, reps: 9 },
  { weightKg: 60, reps: 12 },
];

describe('detectPersonalRecord', () => {
  it('set pertama kali adalah patokan, bukan PR', () => {
    expect(detectPersonalRecord([], { weightKg: 60, reps: 8 })).toEqual([]);
  });

  it('contoh mockup: 65 kg × 8 memecahkan rekor 1RM estimasi dan beban', () => {
    // 62,5 × 10 → 83,3; 65 × 8 → 82,3 (tidak lebih tinggi), tetapi belum pernah 8 reps di ≥ 65 kg.
    expect(detectPersonalRecord(history, { weightKg: 65, reps: 8 })).toEqual(['reps_at_weight']);
  });

  it('1RM estimasi lebih tinggi', () => {
    expect(detectPersonalRecord(history, { weightKg: 65, reps: 10 })).toEqual([
      'estimated_1rm',
      'reps_at_weight',
    ]);
  });

  it('repetisi lebih banyak di beban yang sama', () => {
    expect(detectPersonalRecord(history, { weightKg: 60, reps: 13 })).toContain('reps_at_weight');
  });

  it('bukan PR jika sama atau lebih rendah', () => {
    expect(detectPersonalRecord(history, { weightKg: 62.5, reps: 10 })).toEqual([]);
  });
});
