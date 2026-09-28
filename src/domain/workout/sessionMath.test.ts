import { durationMinutes, tonnageOf, workingWeightOf } from './sessionMath';

describe('workingWeightOf', () => {
  it('beban yang paling sering dipakai', () => {
    expect(
      workingWeightOf([
        { weightKg: 65, reps: 9 },
        { weightKg: 65, reps: 8 },
        { weightKg: 60, reps: 8 },
      ]),
    ).toBe(65);
  });

  it('seri → yang lebih berat', () => {
    expect(
      workingWeightOf([
        { weightKg: 60, reps: 10 },
        { weightKg: 65, reps: 8 },
      ]),
    ).toBe(65);
  });

  it('tanpa set → null', () => {
    expect(workingWeightOf([])).toBeNull();
  });
});

describe('tonnageOf & durationMinutes', () => {
  it('Σ beban × repetisi', () => {
    expect(
      tonnageOf([
        { weightKg: 65, reps: 9 },
        { weightKg: 65, reps: 8 },
      ]),
    ).toBe(1105);
  });

  it('durasi dibulatkan ke menit', () => {
    expect(durationMinutes(0, 45 * 60_000 + 20_000)).toBe(45);
  });
});
