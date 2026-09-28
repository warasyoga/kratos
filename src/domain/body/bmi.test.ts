import { calculateBmi, classifyBmi, classifyBmiAsia } from './bmi';

describe('calculateBmi', () => {
  it('contoh dokumen: 68,4 kg, 175 cm → 22,3 (normal)', () => {
    const bmi = calculateBmi(68.4, 175);
    expect(bmi).toBeCloseTo(22.33, 2);
    expect(classifyBmi(bmi)).toBe('normal');
  });
});

describe('classifyBmi', () => {
  it.each([
    [18.4, 'underweight'],
    [18.5, 'normal'],
    [24.9, 'normal'],
    [25, 'overweight'],
    [30, 'obese'],
  ] as const)('WHO: %s → %s', (bmi, category) => {
    expect(classifyBmi(bmi)).toBe(category);
  });

  it.each([
    [22.9, 'normal'],
    [23, 'overweight'],
    [27.5, 'obese'],
  ] as const)('Asia: %s → %s', (bmi, category) => {
    expect(classifyBmiAsia(bmi)).toBe(category);
  });
});
