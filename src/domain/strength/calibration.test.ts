import { DEFAULT_INVENTORY } from '../profile/inventory';
import { testExercise } from '../testing/exercises';
import { nextCalibrationLoad, startingLoad } from './calibration';

const inv = DEFAULT_INVENTORY;

describe('startingLoad', () => {
  it.each([
    ['barbell-bench-press', 20],
    ['incline-dumbbell-press', 6],
    ['dumbbell-lateral-raise', 4],
    ['leg-press', 10],
    ['triceps-pushdown', 5],
    ['push-up', 0],
  ])('%s mulai dari %s kg', (id, kg) => {
    expect(startingLoad(testExercise(id), inv)).toBe(kg);
  });
});

describe('nextCalibrationLoad (target RIR 2)', () => {
  const bench = testExercise('barbell-bench-press');

  it.each([
    [5, 40, 47.5], // +20% = 48 → 47,5
    [4, 40, 45], // +10% = 44 → 45
    [3, 40, 42.5], // +5% = 42 → 42,5
    [2, 40, 40],
    [1, 40, 40],
    [0, 40, 35], // −10% = 36 → 35
  ])('RIR %s pada %s kg → %s kg', (rir, current, expected) => {
    expect(nextCalibrationLoad(bench, current, rir, inv)).toBe(expected);
  });

  it('kenaikan terlalu kecil tetap naik satu langkah', () => {
    // Bar 20 kg + 5% = 21 → dibulatkan 20; seharusnya tetap naik ke 22,5.
    expect(nextCalibrationLoad(bench, 20, 3, inv)).toBe(22.5);
  });
});
