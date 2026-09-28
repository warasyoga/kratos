import { DEFAULT_INVENTORY } from '../profile/inventory';
import { testExercise } from '../testing/exercises';
import { adjacentLoad, barbellLoads, nextHeavierLoad, roundLoad } from './loads';

const inv = DEFAULT_INVENTORY;

describe('roundLoad', () => {
  it('barbell: kelipatan 2,5 kg dari bar 20 kg', () => {
    expect(roundLoad(66, 'barbell', inv, 'down')).toBe(65);
    expect(roundLoad(66, 'barbell', inv, 'up')).toBe(67.5);
    expect(roundLoad(66, 'barbell', inv, 'nearest')).toBe(65);
    expect(roundLoad(66.5, 'barbell', inv, 'nearest')).toBe(67.5);
  });

  it('barbell: seri dibulatkan ke bawah demi keamanan', () => {
    expect(roundLoad(66.25, 'barbell', inv, 'nearest')).toBe(65);
  });

  it('barbell: tidak pernah di bawah bar kosong', () => {
    expect(roundLoad(10, 'barbell', inv, 'down')).toBe(20);
  });

  it('dumbbell: ukuran yang tersedia saja', () => {
    expect(roundLoad(7, 'dumbbell', inv, 'down')).toBe(6);
    expect(roundLoad(7, 'dumbbell', inv, 'up')).toBe(8);
    expect(roundLoad(100, 'dumbbell', inv, 'up')).toBe(40);
  });

  it('mesin: kelipatan tumpukan 5 kg, minimal 5 kg', () => {
    expect(roundLoad(47, 'machine', inv, 'nearest')).toBe(45);
    expect(roundLoad(1, 'cable', inv, 'down')).toBe(5);
  });

  it('bodyweight selalu 0', () => {
    expect(roundLoad(10, 'bodyweight', inv, 'nearest')).toBe(0);
  });

  it('inventaris pelat tidak standar tetap benar', () => {
    const odd = { ...inv, barKg: 15, platesKg: [10, 5] };
    expect(barbellLoads(odd, 45)).toEqual([15, 25, 35, 45]);
    expect(roundLoad(42, 'barbell', odd, 'down')).toBe(35);
  });
});

describe('nextHeavierLoad', () => {
  it('bench (atas): +2,5 kg', () => {
    const next = nextHeavierLoad(testExercise('barbell-bench-press'), 65, inv);
    expect(next?.weightKg).toBe(67.5);
    expect(next?.stepPct).toBeCloseTo(0.0385, 3);
  });

  it('squat (bawah): +5 kg jika ≤ 10%', () => {
    expect(nextHeavierLoad(testExercise('barbell-back-squat'), 60, inv)?.weightKg).toBe(65);
  });

  it('squat ringan: +5 kg > 10% sehingga memakai +2,5 kg', () => {
    expect(nextHeavierLoad(testExercise('barbell-back-squat'), 40, inv)?.weightKg).toBe(42.5);
  });

  it('dumbbell: ukuran berikutnya, walau > 10%', () => {
    const next = nextHeavierLoad(testExercise('dumbbell-lateral-raise'), 6, inv);
    expect(next?.weightKg).toBe(8);
    expect(next?.stepPct).toBeCloseTo(0.333, 3);
  });

  it('dumbbell terberat: tidak ada langkah', () => {
    expect(nextHeavierLoad(testExercise('dumbbell-curl'), 40, inv)).toBeNull();
  });

  it('bodyweight: tidak ada langkah beban', () => {
    expect(nextHeavierLoad(testExercise('push-up'), 0, inv)).toBeNull();
  });
});

describe('adjacentLoad', () => {
  it.each([
    ['barbell', 65, 1, 67.5],
    ['barbell', 65, -1, 62.5],
    ['barbell', 20, -1, 20],
    ['dumbbell', 18, 1, 20],
    ['dumbbell', 2, -1, 2],
    ['machine', 45, 1, 50],
    ['bodyweight', 0, 1, 0],
  ] as const)('%s %s kg arah %s → %s kg', (type, kg, dir, expected) => {
    expect(adjacentLoad(type, kg, dir, inv)).toBe(expected);
  });
});
