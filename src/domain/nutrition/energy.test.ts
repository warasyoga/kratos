import { calculateBmr, calculateCalorieTarget, calculateTdee } from './energy';

// Profil contoh docs: pria, 24 th, 175 cm, 68,4 kg, aktivitas sedang.
const example = { sex: 'male', weightKg: 68.4, heightCm: 175, ageYears: 24 } as const;

describe('calculateBmr (Mifflin-St Jeor)', () => {
  it('contoh dokumen: 1.662,75 kkal', () => {
    expect(calculateBmr(example)).toBeCloseTo(1662.75, 2);
  });

  it('wanita memakai offset −161', () => {
    expect(calculateBmr({ ...example, sex: 'female' })).toBeCloseTo(1662.75 - 5 - 161, 2);
  });

  it('menolak berat 0', () => {
    expect(() => calculateBmr({ ...example, weightKg: 0 })).toThrow(RangeError);
  });
});

describe('calculateTdee', () => {
  it('contoh dokumen: 1.662,75 × 1,55 = 2.577,3 kkal', () => {
    expect(calculateTdee(1662.75, 'moderate')).toBeCloseTo(2577.26, 2);
  });

  it.each([
    ['sedentary', 1.2],
    ['light', 1.375],
    ['very', 1.725],
    ['extra', 1.9],
  ] as const)('faktor %s = %s', (level, factor) => {
    expect(calculateTdee(1000, level)).toBeCloseTo(1000 * factor, 5);
  });
});

describe('calculateCalorieTarget', () => {
  it('contoh dokumen: 2.577,3 + 300 → 2.880 kkal', () => {
    expect(calculateCalorieTarget(2577.26)).toBe(2880);
  });

  it('surplus di luar 250–500 ditolak', () => {
    expect(() => calculateCalorieTarget(2577, 800)).toThrow(RangeError);
  });
});
