import { createSequentialIds } from '../common/id';
import { condition } from '../testing/profiles';
import { FULL_GYM, TEST_EXERCISES } from '../testing/exercises';
import { generateProgram } from './generateProgram';
import { reconcileProgram } from './reconcileProgram';

const base = { library: TEST_EXERCISES, conditions: [], experience: 'beginner' as const };

function program() {
  return generateProgram({
    ...base,
    availableEquipment: FULL_GYM,
    trainingDays: ['mon', 'tue', 'thu', 'fri'],
    startDate: '2026-09-28',
    createdAt: 0,
    newId: createSequentialIds('p'),
  }).exercises;
}

describe('reconcileProgram', () => {
  it('tanpa perubahan alat/kondisi → tidak ada perubahan', () => {
    const { changes } = reconcileProgram(program(), { ...base, availableEquipment: FULL_GYM });
    expect(changes).toEqual([]);
  });

  it('barbell dimatikan → gerakan barbell diganti dan beban dikalibrasi ulang', () => {
    const exercises = program().map((e) =>
      e.exerciseId === 'barbell-bench-press' ? { ...e, currentWeightKg: 65 } : e,
    );
    const result = reconcileProgram(exercises, {
      ...base,
      availableEquipment: FULL_GYM.filter((e) => e !== 'barbell'),
    });
    const bench = result.exercises.find((e) => e.substitutedFrom === 'barbell-bench-press');
    expect(bench).toMatchObject({
      exerciseId: 'dumbbell-bench-press',
      substitutionReason: 'equipment',
      currentWeightKg: null,
    });
    expect(result.changes).toContainEqual(
      expect.objectContaining({
        kind: 'substituted',
        fromId: 'barbell-bench-press',
        reason: 'equipment',
      }),
    );
  });

  it('barbell dinyalakan lagi → gerakan asal dikembalikan', () => {
    const noBarbell = { ...base, availableEquipment: FULL_GYM.filter((e) => e !== 'barbell') };
    const substituted = reconcileProgram(program(), noBarbell).exercises;
    const restored = reconcileProgram(substituted, { ...base, availableEquipment: FULL_GYM });
    expect(restored.exercises.map((e) => e.exerciseId)).toEqual(program().map((e) => e.exerciseId));
    expect(restored.changes.every((c) => c.kind === 'restored')).toBe(true);
    expect(restored.exercises.some((e) => e.substitutedFrom)).toBe(false);
  });

  it('kondisi kesehatan baru → gerakan diganti dengan alasan kesehatan', () => {
    const result = reconcileProgram(program(), {
      ...base,
      availableEquipment: FULL_GYM,
      conditions: [
        condition({ area: 'shoulder_left', severity: 'mild', painfulMovements: ['vertical_push'] }),
      ],
    });
    expect(result.changes).toContainEqual(
      expect.objectContaining({
        fromId: 'seated-dumbbell-shoulder-press',
        toId: 'landmine-press',
        reason: 'health',
      }),
    );
  });

  it('kondisi sedang → progresi dikunci tanpa mengganti gerakan', () => {
    const result = reconcileProgram(program(), {
      ...base,
      availableEquipment: FULL_GYM,
      conditions: [condition({ area: 'lower_back', severity: 'moderate' })],
    });
    expect(result.changes).toEqual([]);
    expect(result.exercises.find((e) => e.exerciseId === 'barbell-row')?.progressionLocked).toBe(
      true,
    );
  });

  it('pengganti pilihan pengguna tidak dikembalikan otomatis', () => {
    const exercises = program().map((e) =>
      e.exerciseId === 'barbell-bench-press'
        ? {
            ...e,
            exerciseId: 'dumbbell-bench-press',
            substitutedFrom: 'barbell-bench-press',
            substitutionReason: 'user' as const,
          }
        : e,
    );
    const result = reconcileProgram(exercises, { ...base, availableEquipment: FULL_GYM });
    expect(result.changes).toEqual([]);
  });

  it('tidak ada pengganti → dilaporkan', () => {
    const result = reconcileProgram(program(), {
      ...base,
      library: TEST_EXERCISES.filter(
        (e) => e.pattern !== 'shoulder_abduction' || e.id === 'dumbbell-lateral-raise',
      ),
      availableEquipment: FULL_GYM.filter((e) => e !== 'dumbbell'),
    });
    expect(result.changes).toContainEqual(
      expect.objectContaining({ kind: 'unavailable', exerciseId: 'dumbbell-lateral-raise' }),
    );
  });
});
