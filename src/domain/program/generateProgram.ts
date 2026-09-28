import type { IdGenerator } from '../common/id';
import { sortWeekdays, type Weekday } from '../common/weekday';
import type { Exercise } from '../exercise/types';
import { MESOCYCLE_WEEKS, TARGET_RIR, TRAINING_DAYS } from '../standards';
import { assessHealth } from '../trainer/health';
import { findSubstitutes, whyUnavailable, type SelectionContext } from '../trainer/substitution';
import { defaultRestSec } from '../workout/rest';
import { templateForDays, type TemplateSlot } from './templates';
import type { Program, ProgramDay, ProgramExercise, SubstitutionReason } from './types';

export interface GenerateProgramInput extends Omit<SelectionContext, 'excludeIds'> {
  trainingDays: readonly Weekday[];
  startDate: string;
  createdAt: number;
  newId: IdGenerator;
}

export type ProgramWarning = { code: 'slot_unfilled'; dayLabel: string; preferredId: string };

export interface GeneratedProgram {
  program: Program;
  days: ProgramDay[];
  exercises: ProgramExercise[];
  warnings: ProgramWarning[];
}

interface SlotChoice {
  exercise: Exercise;
  substitution?: { from: string; reason: SubstitutionReason };
}

function chooseForSlot(slot: TemplateSlot, ctx: SelectionContext): SlotChoice | null {
  const byId = (id: string) => ctx.library.find((e) => e.id === id);

  for (const id of slot.preferred) {
    const exercise = byId(id);
    if (exercise && !ctx.excludeIds?.includes(id) && whyUnavailable(exercise, ctx) === null) {
      return { exercise };
    }
  }

  const original = byId(slot.preferred[0] ?? '');
  if (!original) return null;
  const substitute = findSubstitutes(original, ctx).results[0];
  if (!substitute) return null;

  // Alasan pengganti yang ditampilkan ke pengguna; tingkat kesulitan diperlakukan sebagai alat.
  const reason: SubstitutionReason =
    whyUnavailable(original, ctx) === 'health' ? 'health' : 'equipment';
  return { exercise: substitute.exercise, substitution: { from: original.id, reason } };
}

/**
 * Susun program dari template sesuai jumlah hari, alat, kondisi kesehatan, dan pengalaman.
 * docs/mesin-trainer/01-pembuatan-program.md
 */
export function generateProgram(input: GenerateProgramInput): GeneratedProgram {
  const days = sortWeekdays([...new Set(input.trainingDays)]);
  if (days.length < TRAINING_DAYS.min || days.length > TRAINING_DAYS.max) {
    throw new RangeError(`Pilih ${TRAINING_DAYS.min}–${TRAINING_DAYS.max} hari latihan`);
  }
  const template = templateForDays(days.length);

  const program: Program = {
    id: input.newId(),
    name: template.name,
    templateId: template.id,
    startDate: input.startDate,
    mesocycleWeeks: MESOCYCLE_WEEKS,
    active: true,
    createdAt: input.createdAt,
  };

  const programDays: ProgramDay[] = [];
  const exercises: ProgramExercise[] = [];
  const warnings: ProgramWarning[] = [];

  template.days.forEach((templateDay, dayIndex) => {
    const day: ProgramDay = {
      id: input.newId(),
      programId: program.id,
      label: templateDay.label,
      weekday: days[dayIndex] as Weekday,
      order: dayIndex,
    };
    programDays.push(day);

    const usedIds: string[] = [];
    for (const slot of templateDay.slots) {
      const choice = chooseForSlot(slot, { ...input, excludeIds: usedIds });
      if (!choice) {
        warnings.push({
          code: 'slot_unfilled',
          dayLabel: day.label,
          preferredId: slot.preferred[0] ?? '',
        });
        continue;
      }
      usedIds.push(choice.exercise.id);
      exercises.push({
        id: input.newId(),
        programDayId: day.id,
        exerciseId: choice.exercise.id,
        order: usedIds.length - 1,
        sets: slot.sets,
        repMin: slot.repMin,
        repMax: slot.repMax,
        targetRir: TARGET_RIR.default,
        restSec: defaultRestSec(choice.exercise),
        currentWeightKg: null,
        progressionLocked: assessHealth(choice.exercise, input.conditions) === 'locked',
        ...(choice.substitution && {
          substitutedFrom: choice.substitution.from,
          substitutionReason: choice.substitution.reason,
        }),
      });
    }
  });

  return { program, days: programDays, exercises, warnings };
}
