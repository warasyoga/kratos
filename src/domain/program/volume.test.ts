import { testExercise } from '../testing/exercises';
import {
  classifyVolume,
  pushPullSets,
  weeklyFrequencyPerMuscle,
  weeklySetsPerMuscle,
} from './volume';

const bench = testExercise('barbell-bench-press');
const row = testExercise('barbell-row');

describe('weeklySetsPerMuscle', () => {
  it('contoh dokumen: 3 set Bench Press = dada 3, trisep 1,5, bahu depan 1,5', () => {
    const sets = weeklySetsPerMuscle([{ exercise: bench, sets: 3, dayKey: 'a' }]);
    expect(sets.get('chest')).toBe(3);
    expect(sets.get('triceps')).toBe(1.5);
    expect(sets.get('shoulder_front')).toBe(1.5);
  });
});

describe('weeklyFrequencyPerMuscle', () => {
  it('menghitung hari berbeda, bukan jumlah gerakan', () => {
    const freq = weeklyFrequencyPerMuscle([
      { exercise: bench, sets: 3, dayKey: 'a' },
      { exercise: testExercise('incline-dumbbell-press'), sets: 3, dayKey: 'a' },
      { exercise: testExercise('machine-chest-press'), sets: 2, dayKey: 'b' },
    ]);
    expect(freq.get('chest')).toBe(2);
  });
});

describe('classifyVolume', () => {
  it.each([
    [8, 'low'],
    [10, 'optimal'],
    [20, 'optimal'],
    [21, 'high'],
  ] as const)('%s set → %s', (sets, status) => {
    expect(classifyVolume(sets)).toBe(status);
  });
});

describe('pushPullSets', () => {
  it('menjumlah set dorong dan tarik', () => {
    expect(
      pushPullSets([
        { exercise: bench, sets: 3, dayKey: 'a' },
        { exercise: row, sets: 4, dayKey: 'a' },
        { exercise: testExercise('dumbbell-curl'), sets: 2, dayKey: 'a' },
      ]),
    ).toEqual({ push: 3, pull: 4 });
  });
});
