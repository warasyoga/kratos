import { createSequentialIds } from '../common/id';
import { condition, must } from '../testing/profiles';
import { FULL_GYM, TEST_EXERCISES, testExercise } from '../testing/exercises';
import {
  applyProgramEdit,
  defaultPrescription,
  trainingDaysOf,
  type ProgramEdit,
} from './editProgram';
import { generateProgram } from './generateProgram';
import type { ProgramBundle } from './types';

function setup() {
  const bundle = generateProgram({
    library: TEST_EXERCISES,
    availableEquipment: FULL_GYM,
    conditions: [],
    experience: 'beginner',
    trainingDays: ['mon', 'tue', 'thu', 'fri'],
    startDate: '2026-09-28',
    createdAt: 0,
    newId: createSequentialIds('p'),
  });
  const upperA = must(bundle.days[0]);
  const dayExercises = () => bundle.exercises.filter((e) => e.programDayId === upperA.id);
  return { bundle, upperA, dayExercises };
}

const ctx = { newId: createSequentialIds('new'), conditions: [] };

function apply(bundle: ProgramBundle, edit: ProgramEdit) {
  const result = applyProgramEdit(bundle, edit, ctx);
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}

describe('applyProgramEdit', () => {
  it('mengubah set, repetisi, istirahat', () => {
    const { bundle, dayExercises } = setup();
    const bench = must(dayExercises()[0]);
    const next = apply(bundle, {
      kind: 'update_prescription',
      programExerciseId: bench.id,
      patch: { sets: 4, repMin: 6, repMax: 10, restSec: 150 },
    });
    expect(next.exercises.find((e) => e.id === bench.id)).toMatchObject({
      sets: 4,
      repMin: 6,
      repMax: 10,
      restSec: 150,
    });
    // Fungsi murni: program asal tidak berubah.
    expect(bench.sets).toBe(3);
  });

  it.each([
    [{ sets: 7 }, 'sets', 'sets_range'],
    [{ sets: 0 }, 'sets', 'sets_range'],
    [{ repMin: 12, repMax: 8 }, 'repMax', 'rep_order'],
    [{ repMax: 31 }, 'repMax', 'reps_range'],
    [{ restSec: 20 }, 'restSec', 'rest_range'],
    [{ targetRir: 0 }, 'targetRir', 'rir_range'],
  ])('menolak %o', (patch, field, code) => {
    const { bundle, dayExercises } = setup();
    const result = applyProgramEdit(
      bundle,
      { kind: 'update_prescription', programExerciseId: must(dayExercises()[0]).id, patch },
      ctx,
    );
    expect(result).toMatchObject({ ok: false, error: { fields: { [field]: code } } });
  });

  it('tombol ± set', () => {
    const { bundle, dayExercises } = setup();
    const id = must(dayExercises()[0]).id;
    expect(
      apply(bundle, { kind: 'change_sets', programExerciseId: id, delta: 1 }).exercises.find(
        (e) => e.id === id,
      )?.sets,
    ).toBe(4);
  });

  it('mengubah urutan', () => {
    const { bundle, upperA, dayExercises } = setup();
    const ids = dayExercises().map((e) => e.id);
    const reversed = [...ids].reverse();
    const next = apply(bundle, { kind: 'reorder', programDayId: upperA.id, orderedIds: reversed });
    const order = next.exercises
      .filter((e) => e.programDayId === upperA.id)
      .sort((a, b) => a.order - b.order)
      .map((e) => e.id);
    expect(order).toEqual(reversed);
  });

  it('urutan yang tidak lengkap ditolak', () => {
    const { bundle, upperA, dayExercises } = setup();
    const result = applyProgramEdit(
      bundle,
      {
        kind: 'reorder',
        programDayId: upperA.id,
        orderedIds: dayExercises()
          .slice(1)
          .map((e) => e.id),
      },
      ctx,
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'invalid_order' } });
  });

  it('menambah gerakan dengan resep bawaan di urutan terakhir', () => {
    const { bundle, upperA, dayExercises } = setup();
    const next = apply(bundle, {
      kind: 'add_exercise',
      programDayId: upperA.id,
      exercise: testExercise('face-pull'),
    });
    const added = next.exercises.find(
      (e) => e.exerciseId === 'face-pull' && e.programDayId === upperA.id,
    );
    expect(added).toMatchObject({
      sets: 2,
      repMin: 12,
      repMax: 15,
      restSec: 60,
      targetRir: 2,
      order: dayExercises().length,
      currentWeightKg: null,
    });
  });

  it('gerakan ganda di hari yang sama ditolak', () => {
    const { bundle, upperA } = setup();
    const result = applyProgramEdit(
      bundle,
      {
        kind: 'add_exercise',
        programDayId: upperA.id,
        exercise: testExercise('barbell-bench-press'),
      },
      ctx,
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'duplicate_exercise' } });
  });

  it('menghapus gerakan dan merapikan urutan', () => {
    const { bundle, upperA, dayExercises } = setup();
    const next = apply(bundle, {
      kind: 'remove_exercise',
      programExerciseId: must(dayExercises()[0]).id,
    });
    const orders = next.exercises
      .filter((e) => e.programDayId === upperA.id)
      .map((e) => e.order)
      .sort();
    expect(orders).toEqual([0, 1, 2, 3, 4]);
  });

  it('gerakan terakhir di satu hari tidak bisa dihapus', () => {
    const { bundle, upperA, dayExercises } = setup();
    let current: ProgramBundle = bundle;
    for (const pe of dayExercises().slice(1)) {
      current = apply(current, { kind: 'remove_exercise', programExerciseId: pe.id });
    }
    const last = must(current.exercises.find((e) => e.programDayId === upperA.id));
    expect(
      applyProgramEdit(current, { kind: 'remove_exercise', programExerciseId: last.id }, ctx),
    ).toMatchObject({
      ok: false,
      error: { code: 'last_exercise' },
    });
  });

  it('mengganti gerakan: beban dikalibrasi ulang, asal dicatat sebagai pilihan pengguna', () => {
    const { bundle, dayExercises } = setup();
    const bench = { ...must(dayExercises()[0]), currentWeightKg: 65 };
    const withWeight = {
      ...bundle,
      exercises: bundle.exercises.map((e) => (e.id === bench.id ? bench : e)),
    };
    const next = apply(withWeight, {
      kind: 'swap_exercise',
      programExerciseId: bench.id,
      exercise: testExercise('dumbbell-bench-press'),
      reason: 'user',
    });
    expect(next.exercises.find((e) => e.id === bench.id)).toMatchObject({
      exerciseId: 'dumbbell-bench-press',
      currentWeightKg: null,
      substitutedFrom: 'barbell-bench-press',
      substitutionReason: 'user',
      sets: 3,
    });
  });

  it('mengganti kembali ke gerakan asal menghapus catatan pengganti', () => {
    const { bundle, dayExercises } = setup();
    const id = must(dayExercises()[0]).id;
    const swapped = apply(bundle, {
      kind: 'swap_exercise',
      programExerciseId: id,
      exercise: testExercise('dumbbell-bench-press'),
      reason: 'user',
    });
    const back = apply(swapped, {
      kind: 'swap_exercise',
      programExerciseId: id,
      exercise: testExercise('barbell-bench-press'),
      reason: 'user',
    });
    const pe = back.exercises.find((e) => e.id === id);
    expect(pe?.substitutedFrom).toBeUndefined();
    expect(pe?.substitutionReason).toBeUndefined();
  });

  it('gerakan pengganti yang membebani area sakit (sedang) dikunci progresinya', () => {
    const { bundle, dayExercises } = setup();
    const next = applyProgramEdit(
      bundle,
      {
        kind: 'swap_exercise',
        programExerciseId: must(dayExercises()[0]).id,
        exercise: testExercise('dumbbell-bench-press'),
        reason: 'user',
      },
      { ...ctx, conditions: [condition({ area: 'shoulder_left', severity: 'moderate' })] },
    );
    expect(
      next.ok &&
        next.value.exercises.find((e) => e.exerciseId === 'dumbbell-bench-press')
          ?.progressionLocked,
    ).toBe(true);
  });

  it('pindah ke hari kosong', () => {
    const { bundle, upperA } = setup();
    const next = apply(bundle, { kind: 'move_day', programDayId: upperA.id, weekday: 'wed' });
    expect(trainingDaysOf(next)).toEqual(['tue', 'wed', 'thu', 'fri']);
  });

  it('pindah ke hari yang terpakai → kedua hari bertukar', () => {
    const { bundle, upperA } = setup();
    const next = apply(bundle, { kind: 'move_day', programDayId: upperA.id, weekday: 'tue' });
    expect(next.days.map((d) => [d.label, d.weekday])).toEqual([
      ['Upper A', 'tue'],
      ['Lower A', 'mon'],
      ['Upper B', 'thu'],
      ['Lower B', 'fri'],
    ]);
  });
});

describe('defaultPrescription', () => {
  it.each([
    ['barbell-bench-press', { sets: 3, repMin: 8, repMax: 12 }],
    ['dumbbell-lateral-raise', { sets: 2, repMin: 12, repMax: 15 }],
    ['plank', { sets: 2, repMin: 30, repMax: 45 }],
  ])('%s', (id, expected) => {
    expect(defaultPrescription(testExercise(id))).toEqual(expected);
  });
});
