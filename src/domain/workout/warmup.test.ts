import { DEFAULT_INVENTORY } from '../profile/inventory';
import { testExercise } from '../testing/exercises';
import { defaultRestSec, estimateSessionMinutes } from './rest';
import { generateWarmupSets, needsWarmup } from './warmup';

const inv = DEFAULT_INVENTORY;
const bench = testExercise('barbell-bench-press');

describe('generateWarmupSets', () => {
  it('contoh dokumen: bench 65 kg → 25 × 10, 40 × 5, 52,5 × 3', () => {
    expect(generateWarmupSets(bench, 65, inv)).toEqual([
      { weightKg: 25, reps: 10 },
      { weightKg: 40, reps: 5 },
      { weightKg: 52.5, reps: 3 },
    ]);
  });

  it('beban kerja ≤ bar + 10 kg → cukup 1 set bar kosong', () => {
    expect(generateWarmupSets(bench, 30, inv)).toEqual([{ weightKg: 20, reps: 10 }]);
  });

  it('bar kosong sebagai beban kerja → tanpa pemanasan beban', () => {
    expect(generateWarmupSets(bench, 20, inv)).toEqual([]);
  });

  it('dumbbell ringan: set yang sama atau ≥ beban kerja dibuang', () => {
    // 10 kg: 4 → 4, 6 → 6, 8 → 8
    expect(generateWarmupSets(testExercise('incline-dumbbell-press'), 10, inv)).toEqual([
      { weightKg: 4, reps: 10 },
      { weightKg: 6, reps: 5 },
      { weightKg: 8, reps: 3 },
    ]);
  });

  it('bodyweight tidak butuh set pemanasan beban', () => {
    expect(generateWarmupSets(testExercise('push-up'), 0, inv)).toEqual([]);
  });
});

describe('needsWarmup', () => {
  it('compound pertama untuk otot itu butuh pemanasan', () => {
    expect(needsWarmup(bench, [])).toBe(true);
  });

  it('otot sudah hangat dari gerakan sebelumnya', () => {
    expect(needsWarmup(testExercise('dumbbell-bench-press'), [bench])).toBe(false);
  });

  it('otot utama baru tetap butuh pemanasan', () => {
    expect(needsWarmup(testExercise('barbell-row'), [bench])).toBe(true);
  });

  it('isolasi tidak butuh pemanasan spesifik', () => {
    expect(needsWarmup(testExercise('dumbbell-lateral-raise'), [])).toBe(false);
  });
});

describe('defaultRestSec', () => {
  it.each([
    ['barbell-bench-press', 120],
    ['incline-dumbbell-press', 90],
    ['lat-pulldown', 90],
    ['dumbbell-lateral-raise', 60],
  ])('%s → %s dtk', (id, sec) => {
    expect(defaultRestSec(testExercise(id))).toBe(sec);
  });
});

describe('estimateSessionMinutes', () => {
  it('Σ set × (40 dtk + istirahat) + 5 menit pemanasan, dibulatkan ke 5 menit', () => {
    // 3×(40+120) + 3×(40+90) + 2×(40+60) = 480 + 390 + 200 = 1070 dtk ≈ 17,8 + 5 = 22,8 → 25
    expect(
      estimateSessionMinutes([
        { sets: 3, restSec: 120 },
        { sets: 3, restSec: 90 },
        { sets: 2, restSec: 60 },
      ]),
    ).toBe(25);
  });
});
