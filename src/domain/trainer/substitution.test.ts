import { condition } from '../testing/profiles';
import { FULL_GYM, TEST_EXERCISES, testExercise } from '../testing/exercises';
import { assessHealth } from './health';
import { findSubstitutes, type SelectionContext } from './substitution';

const ctx = (overrides: Partial<SelectionContext> = {}): SelectionContext => ({
  library: TEST_EXERCISES,
  availableEquipment: FULL_GYM,
  conditions: [],
  experience: 'beginner',
  ...overrides,
});
const without = (...removed: string[]) => FULL_GYM.filter((e) => !removed.includes(e));
const topName = (id: string, c: SelectionContext) =>
  findSubstitutes(testExercise(id), c).results[0]?.exercise.name;

describe('assessHealth', () => {
  const shoulderMild = condition({
    area: 'shoulder_left',
    severity: 'mild',
    painfulMovements: ['vertical_push'],
  });

  it('ringan: pola sakit ditolak, pola lain tetap boleh', () => {
    expect(assessHealth(testExercise('seated-dumbbell-shoulder-press'), [shoulderMild])).toBe(
      'rejected',
    );
    expect(assessHealth(testExercise('barbell-bench-press'), [shoulderMild])).toBe('ok');
  });

  it('sedang: membebani area → progresi dikunci', () => {
    const c = condition({ area: 'shoulder_left', severity: 'moderate' });
    expect(assessHealth(testExercise('barbell-bench-press'), [c])).toBe('locked');
  });

  it('berat: semua gerakan yang membebani area ditolak', () => {
    const c = condition({ area: 'knee_right', severity: 'severe' });
    expect(assessHealth(testExercise('leg-extension'), [c])).toBe('rejected');
    expect(assessHealth(testExercise('barbell-bench-press'), [c])).toBe('ok');
  });

  it('kondisi nonaktif diabaikan', () => {
    const c = condition({ area: 'knee_right', severity: 'severe', active: false });
    expect(assessHealth(testExercise('leg-extension'), [c])).toBe('ok');
  });
});

// Tabel kasus uji: docs/mesin-trainer/05-substitusi-gerakan.md
describe('findSubstitutes', () => {
  it('bahu kiri ringan (vertical_push sakit): Shoulder Press → Landmine Press', () => {
    const c = ctx({
      conditions: [
        condition({ area: 'shoulder_left', severity: 'mild', painfulMovements: ['vertical_push'] }),
      ],
      excludeIds: ['incline-dumbbell-press'], // sudah ada di Upper A
    });
    const { results, relaxed } = findSubstitutes(testExercise('seated-dumbbell-shoulder-press'), c);
    expect(relaxed).toBe(true);
    expect(results[0]?.exercise.name).toBe('Landmine Press');
  });

  it('tanpa barbell: Bench Press → Dumbbell Bench Press', () => {
    expect(topName('barbell-bench-press', ctx({ availableEquipment: without('barbell') }))).toBe(
      'Dumbbell Bench Press',
    );
  });

  it('tanpa squat rack: Back Squat → Goblet Squat, lalu Leg Press', () => {
    const { results } = findSubstitutes(
      testExercise('barbell-back-squat'),
      ctx({ availableEquipment: without('squat_rack') }),
    );
    expect(results.slice(0, 2).map((r) => r.exercise.name)).toEqual(['Goblet Squat', 'Leg Press']);
  });

  it('tanpa mesin pulldown: Lat Pulldown → Assisted Pull-up (Pull-up terlalu sulit untuk pemula)', () => {
    const { results } = findSubstitutes(
      testExercise('lat-pulldown'),
      ctx({ availableEquipment: without('lat_pulldown') }),
    );
    expect(results.map((r) => r.exercise.name)).toEqual(['Assisted Pull-up']);
  });

  it('lutut kanan sedang, squat sakit: pola squat ditolak → Bulgarian Split Squat terkunci', () => {
    const c = ctx({
      conditions: [
        condition({ area: 'knee_right', severity: 'moderate', painfulMovements: ['squat'] }),
      ],
    });
    const { results, relaxed } = findSubstitutes(testExercise('barbell-back-squat'), c);
    expect(relaxed).toBe(true);
    expect(results[0]).toMatchObject({ progressionLocked: true });
    expect(results[0]?.exercise.name).toBe('Bulgarian Split Squat');
  });

  it('lutut kanan berat: tidak ada gerakan yang membebani lutut', () => {
    const c = ctx({ conditions: [condition({ area: 'knee_right', severity: 'severe' })] });
    const { results } = findSubstitutes(testExercise('barbell-back-squat'), c);
    expect(results.every((r) => !r.exercise.stressedAreas.includes('knee_right'))).toBe(true);
  });

  it('hasil deterministik dan maksimal 5', () => {
    const a = findSubstitutes(testExercise('barbell-bench-press'), ctx()).results;
    const b = findSubstitutes(testExercise('barbell-bench-press'), ctx()).results;
    expect(a.map((r) => r.exercise.id)).toEqual(b.map((r) => r.exercise.id));
    expect(a.length).toBeLessThanOrEqual(5);
  });
});
