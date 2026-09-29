import {
  AGE_RANGE,
  bodySchema,
  conditionSchema,
  trainingDaysSchema,
  type ConditionInput,
} from '@/application/profile/schemas';
import { validate } from '@/application/validation';
import type { Weekday } from '@/domain/common/weekday';
import { PARQ_QUESTIONS } from '@/domain/profile/parq';
import {
  ageOn,
  EQUIPMENT,
  type ActivityLevel,
  type Equipment,
  type Experience,
  type Sex,
} from '@/domain/profile/types';
import type { ParqDraft } from '../components/ParqForm';
import { parseDecimal } from '@/shared/lib/format';

/** Jawaban onboarding selama diisi. Angka disimpan sebagai teks agar input bisa kosong. */
export interface OnboardingDraft {
  name: string;
  sex?: Sex;
  birthDate: string;
  heightCm: string;
  weightKg: string;
  experience?: Experience;
  activityLevel?: ActivityLevel;
  trainingDays: Weekday[];
  equipment: Equipment[];
  conditions: ConditionInput[];
  parq: ParqDraft;
}

export const EMPTY_DRAFT: OnboardingDraft = {
  name: '',
  birthDate: '',
  heightCm: '',
  weightKg: '',
  trainingDays: ['mon', 'tue', 'thu', 'fri'],
  equipment: [...EQUIPMENT],
  conditions: [],
  parq: {},
};

export const STEPS = [
  'welcome',
  'body',
  'experience',
  'activity',
  'schedule',
  'equipment',
  'health',
  'parq',
  'summary',
  'install',
] as const;
export type Step = (typeof STEPS)[number];

/** Langkah yang berisi pertanyaan (untuk penanda kemajuan). */
export const QUESTION_STEPS: readonly Step[] = STEPS.slice(1, 8);

/** "68,4" dan "68.4" sama-sama diterima; kosong → undefined. */
export function toOnboardingInput(draft: OnboardingDraft) {
  return {
    ...draft,
    heightCm: parseDecimal(draft.heightCm),
    weightKg: parseDecimal(draft.weightKg),
  };
}

type Errors = Record<string, string>;

/** Validasi satu langkah sebelum lanjut. null = boleh lanjut. */
export function validateStep(step: Step, draft: OnboardingDraft, today: string): Errors | null {
  switch (step) {
    case 'body': {
      const input = toOnboardingInput(draft);
      const result = validate(bodySchema, {
        name: input.name,
        sex: input.sex,
        birthDate: input.birthDate,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
      });
      const errors: Errors = result.ok ? {} : { ...result.error.fields };
      if (!errors.birthDate && draft.birthDate) {
        const age = ageOn(draft.birthDate, today);
        if (age < AGE_RANGE.min || age > AGE_RANGE.max) errors.birthDate = 'age_range';
      }
      return Object.keys(errors).length > 0 ? errors : null;
    }
    case 'experience':
      return draft.experience ? null : { experience: 'choose_one' };
    case 'activity':
      return draft.activityLevel ? null : { activityLevel: 'choose_one' };
    case 'schedule': {
      const result = validate(trainingDaysSchema, draft.trainingDays);
      return result.ok ? null : { trainingDays: 'training_days_range' };
    }
    case 'parq': {
      const missing = PARQ_QUESTIONS.filter((q) => draft.parq[q] === undefined);
      return missing.length > 0
        ? Object.fromEntries(missing.map((q) => [q, 'answer_required']))
        : null;
    }
    default:
      return null;
  }
}

export function validateCondition(value: unknown) {
  return validate(conditionSchema, value);
}

/** Langkah tempat sebuah kolom error berada (untuk kembali ke sana). */
export function stepOfField(field: string): Step {
  const root = field.split('.')[0] ?? '';
  if (['name', 'sex', 'birthDate', 'heightCm', 'weightKg'].includes(root)) return 'body';
  if (root === 'experience') return 'experience';
  if (root === 'activityLevel') return 'activity';
  if (root === 'trainingDays') return 'schedule';
  if (root === 'equipment') return 'equipment';
  if (root === 'conditions') return 'health';
  return 'parq';
}
