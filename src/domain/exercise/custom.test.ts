import { buildCustomExercise } from './custom';

const input = {
  name: 'Cable Crossover',
  pattern: 'horizontal_push' as const,
  primaryMuscles: ['chest' as const],
  secondaryMuscles: ['shoulder_front' as const, 'chest' as const],
  equipment: ['cable' as const, 'cable' as const],
  loadType: 'cable' as const,
  measure: 'reps' as const,
};

describe('buildCustomExercise', () => {
  it('majemuk/isolasi dan area tubuh dari pola gerakan; duplikat dibuang', () => {
    const e = buildCustomExercise('custom-1', input);
    expect(e).toMatchObject({
      id: 'custom-1',
      mechanics: 'compound',
      equipment: ['cable'],
      secondaryMuscles: ['shoulder_front'],
      stressedAreas: ['shoulder_left', 'shoulder_right', 'wrist'],
      difficulty: 1,
      isCustom: true,
    });
  });

  it('pola satu sendi = isolasi', () => {
    expect(buildCustomExercise('custom-2', { ...input, pattern: 'elbow_flexion' }).mechanics).toBe(
      'isolation',
    );
  });
});
