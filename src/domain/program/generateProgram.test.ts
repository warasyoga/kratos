import { createSequentialIds } from '../common/id';
import type { Weekday } from '../common/weekday';
import { condition } from '../testing/profiles';
import { FULL_GYM, TEST_EXERCISES, testExercise } from '../testing/exercises';
import { generateProgram, type GenerateProgramInput } from './generateProgram';
import {
  pushPullSets,
  weeklyFrequencyPerMuscle,
  weeklySetsPerMuscle,
  type VolumeEntry,
} from './volume';

const FOUR_DAYS: Weekday[] = ['mon', 'tue', 'thu', 'fri'];

const input = (overrides: Partial<GenerateProgramInput> = {}): GenerateProgramInput => ({
  library: TEST_EXERCISES,
  availableEquipment: FULL_GYM,
  conditions: [],
  experience: 'beginner',
  trainingDays: FOUR_DAYS,
  startDate: '2026-09-28',
  createdAt: 0,
  newId: createSequentialIds('p'),
  ...overrides,
});

function exercisesOfDay(result: ReturnType<typeof generateProgram>, label: string) {
  const day = result.days.find((d) => d.label === label);
  return result.exercises.filter((e) => e.programDayId === day?.id);
}

function volumeEntries(result: ReturnType<typeof generateProgram>): VolumeEntry[] {
  return result.exercises.map((e) => ({
    exercise: testExercise(e.exerciseId),
    sets: e.sets,
    dayKey: e.programDayId,
  }));
}

// Tabel kasus uji: docs/mesin-trainer/01-pembuatan-program.md
describe('generateProgram', () => {
  it('4 hari, alat lengkap → Upper/Lower, 25 gerakan, Bench Press di Upper A', () => {
    const result = generateProgram(input());
    expect(result.program.templateId).toBe('upper-lower-4');
    expect(result.days.map((d) => [d.label, d.weekday])).toEqual([
      ['Upper A', 'mon'],
      ['Lower A', 'tue'],
      ['Upper B', 'thu'],
      ['Lower B', 'fri'],
    ]);
    expect(result.exercises).toHaveLength(25);
    expect(result.warnings).toEqual([]);
    expect(exercisesOfDay(result, 'Upper A')[0]).toMatchObject({
      exerciseId: 'barbell-bench-press',
      sets: 3,
      repMin: 8,
      repMax: 12,
      targetRir: 2,
      restSec: 120,
      currentWeightKg: null,
      progressionLocked: false,
    });
  });

  it.each([3, 4, 5, 6])(
    '%s hari alat lengkap: otot besar 10–20 set/minggu, ≥ 2×/minggu, tarik ≥ dorong',
    (n) => {
      const days: Weekday[] =
        n === 3
          ? ['mon', 'wed', 'fri']
          : n === 4
            ? FOUR_DAYS
            : (['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].slice(0, n) as Weekday[]);
      const entries = volumeEntries(generateProgram(input({ trainingDays: days })));
      const sets = weeklySetsPerMuscle(entries);
      const frequency = weeklyFrequencyPerMuscle(entries);
      for (const muscle of ['chest', 'back_lats', 'quads', 'hamstrings', 'glutes'] as const) {
        expect(sets.get(muscle), muscle).toBeGreaterThanOrEqual(10);
        expect(sets.get(muscle), muscle).toBeLessThanOrEqual(20);
        expect(frequency.get(muscle), muscle).toBeGreaterThanOrEqual(2);
      }
      const { push, pull } = pushPullSets(entries);
      expect(pull).toBeGreaterThanOrEqual(push);
    },
  );

  it('tanpa barbell: pilihan kedua dipakai, sisanya diganti dengan alasan alat', () => {
    const result = generateProgram(
      input({ availableEquipment: FULL_GYM.filter((e) => e !== 'barbell') }),
    );
    expect(exercisesOfDay(result, 'Upper A')[0]?.exerciseId).toBe('dumbbell-bench-press');
    expect(exercisesOfDay(result, 'Lower A')[0]?.exerciseId).toBe('goblet-squat');
    expect(exercisesOfDay(result, 'Lower B')).toContainEqual(
      expect.objectContaining({
        substitutedFrom: 'barbell-hip-thrust',
        substitutionReason: 'equipment',
      }),
    );
    const usesBarbell = result.exercises.some((e) =>
      testExercise(e.exerciseId).equipment.includes('barbell'),
    );
    expect(usesBarbell).toBe(false);
  });

  it('bahu kiri ringan (vertical_push sakit): Shoulder Press di Upper B → Landmine Press', () => {
    const result = generateProgram(
      input({
        conditions: [
          condition({
            area: 'shoulder_left',
            severity: 'mild',
            painfulMovements: ['vertical_push'],
          }),
        ],
      }),
    );
    expect(exercisesOfDay(result, 'Upper B')).toContainEqual(
      expect.objectContaining({
        exerciseId: 'landmine-press',
        substitutedFrom: 'seated-dumbbell-shoulder-press',
        substitutionReason: 'health',
      }),
    );
    const anyVerticalPush = result.exercises.some(
      (e) => testExercise(e.exerciseId).pattern === 'vertical_push',
    );
    expect(anyVerticalPush).toBe(false);
  });

  it('kondisi sedang: gerakan yang membebani area dikunci progresinya', () => {
    const result = generateProgram(
      input({ conditions: [condition({ area: 'lower_back', severity: 'moderate' })] }),
    );
    const row = result.exercises.find((e) => e.exerciseId === 'barbell-row');
    expect(row?.progressionLocked).toBe(true);
  });

  it('lutut kanan berat: tidak ada gerakan yang membebani lutut; slot kosong dilaporkan', () => {
    const result = generateProgram(
      input({ conditions: [condition({ area: 'knee_right', severity: 'severe' })] }),
    );
    const stressesKnee = result.exercises.some((e) =>
      testExercise(e.exerciseId).stressedAreas.includes('knee_right'),
    );
    expect(stressesKnee).toBe(false);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'slot_unfilled', preferredId: 'lying-leg-curl' }),
    );
  });

  it('3 hari → Full Body, setiap otot besar dilatih ≥ 2×/minggu', () => {
    const result = generateProgram(input({ trainingDays: ['mon', 'wed', 'fri'] }));
    expect(result.program.templateId).toBe('full-body-3');
    const frequency = weeklyFrequencyPerMuscle(volumeEntries(result));
    for (const muscle of ['chest', 'back_lats', 'quads', 'hamstrings', 'glutes'] as const) {
      expect(frequency.get(muscle)).toBeGreaterThanOrEqual(2);
    }
  });

  it.each([5, 6])('%s hari memakai template yang sesuai tanpa slot kosong', (n) => {
    const days: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].slice(0, n) as Weekday[];
    const result = generateProgram(input({ trainingDays: days }));
    expect(result.days).toHaveLength(n);
    expect(result.warnings).toEqual([]);
  });

  it('tidak ada gerakan ganda dalam satu hari', () => {
    const result = generateProgram(input({ trainingDays: ['mon', 'tue', 'wed', 'thu', 'fri'] }));
    for (const day of result.days) {
      const ids = result.exercises
        .filter((e) => e.programDayId === day.id)
        .map((e) => e.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('hari diurutkan Senin → Minggu apa pun urutan input', () => {
    const result = generateProgram(input({ trainingDays: ['fri', 'mon', 'thu', 'tue'] }));
    expect(result.days.map((d) => d.weekday)).toEqual(['mon', 'tue', 'thu', 'fri']);
  });

  it('menolak kurang dari 3 hari', () => {
    expect(() => generateProgram(input({ trainingDays: ['mon', 'thu'] }))).toThrow(RangeError);
  });
});
