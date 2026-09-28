import { TEMPLATES } from '@/domain/program/templates';
import { FULL_GYM, TEST_EXERCISES } from '@/domain/testing/exercises';
import { findSubstitutes, whyUnavailable } from '@/domain/trainer/substitution';
import { EXERCISE_CATALOG } from './exerciseCatalog';

const exercises = EXERCISE_CATALOG.map((e) => e.exercise);
const byId = new Map(exercises.map((e) => [e.id, e]));
const ctx = {
  library: exercises,
  availableEquipment: FULL_GYM,
  conditions: [],
  experience: 'beginner' as const,
};

describe('EXERCISE_CATALOG', () => {
  it('ID unik dan nama tidak kosong', () => {
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
    expect(exercises.every((e) => e.name.trim().length > 0)).toBe(true);
  });

  it('memuat semua gerakan uji domain dengan data latihan yang identik', () => {
    for (const fixture of TEST_EXERCISES) {
      expect(byId.get(fixture.id), fixture.id).toEqual(fixture);
    }
  });

  it('setiap gerakan punya 2–6 langkah dan minimal 1 kesalahan umum', () => {
    for (const { exercise, guide } of EXERCISE_CATALOG) {
      expect(guide.exerciseId).toBe(exercise.id);
      expect(guide.instructions.length, exercise.id).toBeGreaterThanOrEqual(2);
      expect(guide.instructions.length, exercise.id).toBeLessThanOrEqual(6);
      expect(guide.commonMistakes.length, exercise.id).toBeGreaterThanOrEqual(1);
    }
  });

  it('setiap otot utama dan pendukung konsisten (tidak ganda)', () => {
    for (const e of exercises) {
      expect(
        e.primaryMuscles.filter((m) => e.secondaryMuscles.includes(m)),
        e.id,
      ).toEqual([]);
      expect(e.primaryMuscles.length, e.id).toBeGreaterThan(0);
    }
  });

  it('setiap slot template: pilihan pertama ada, bisa dipakai pemula, dan punya ≥ 1 pengganti', () => {
    for (const template of TEMPLATES) {
      for (const day of template.days) {
        for (const slot of day.slots) {
          const first = byId.get(slot.preferred[0] ?? '');
          expect(first, `${template.id}/${day.label}`).toBeDefined();
          if (!first) continue;
          expect(whyUnavailable(first, ctx), first.id).toBeNull();
          expect(findSubstitutes(first, ctx).results.length, first.id).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});
