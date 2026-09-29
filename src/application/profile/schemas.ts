import { z } from 'zod/mini';
import { WEEKDAYS } from '@/domain/common/weekday';
import { MOVEMENT_PATTERNS } from '@/domain/exercise/types';
import { PARQ_QUESTIONS } from '@/domain/profile/parq';
import {
  ACTIVITY_LEVELS,
  ageOn,
  BODY_AREAS,
  EQUIPMENT,
  EXPERIENCES,
  SEVERITIES,
  SEXES,
} from '@/domain/profile/types';
import { PROTEIN_G_PER_KG, TRAINING_DAYS } from '@/domain/standards';

/**
 * Skema input profil. Pesan error adalah kode i18n (lihat t.errors di src/shared/i18n/id.ts).
 * Batas nilai: docs/fitur/01-onboarding.md
 */
export const AGE_RANGE = { min: 16, max: 80 } as const;

/** Angka dalam rentang [min, max]; di luar rentang → kode error `code`. */
export const numberInRange = (min: number, max: number, code: string) =>
  z
    .number({ error: 'number_required' })
    .check(z.minimum(min, { error: code }), z.maximum(max, { error: code }));
const number = numberInRange;

export const bodySchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, { error: 'name_required' }),
      z.maxLength(30, { error: 'name_too_long' }),
    ),
  sex: z.enum(SEXES, { error: 'choose_one' }),
  birthDate: z.iso.date({ error: 'birth_date_invalid' }),
  heightCm: number(120, 230, 'height_range'),
  weightKg: number(30, 250, 'weight_range'),
});

export const trainingDaysSchema = z.array(z.enum(WEEKDAYS)).check(
  z.minLength(TRAINING_DAYS.min, { error: 'training_days_range' }),
  z.maxLength(TRAINING_DAYS.max, { error: 'training_days_range' }),
  z.refine((days) => new Set(days).size === days.length, { error: 'training_days_range' }),
);

export const conditionSchema = z.object({
  area: z.enum(BODY_AREAS, { error: 'choose_one' }),
  severity: z.enum(SEVERITIES, { error: 'choose_one' }),
  painfulMovements: z.array(z.enum(MOVEMENT_PATTERNS)),
  note: z.string().check(z.trim(), z.maxLength(200, { error: 'note_too_long' })),
});

export const parqSchema = z.object(
  Object.fromEntries(
    PARQ_QUESTIONS.map((q) => [q, z.boolean({ error: 'answer_required' })]),
  ) as Record<(typeof PARQ_QUESTIONS)[number], z.ZodMiniBoolean>,
);

export const equipmentSchema = z.array(z.enum(EQUIPMENT));

/** Umur dihitung terhadap tanggal hari ini, jadi skema dibuat per pemanggilan. */
function withAgeCheck<T extends { birthDate?: string | undefined }>(today: string) {
  return (value: T, ctx: z.core.$RefinementCtx<T>) => {
    if (!value.birthDate) return;
    const age = ageOn(value.birthDate, today);
    if (age < AGE_RANGE.min || age > AGE_RANGE.max) {
      ctx.addIssue({ code: 'custom', path: ['birthDate'], message: 'age_range' });
    }
  };
}

export function onboardingSchema(today: string) {
  return z
    .extend(bodySchema, {
      experience: z.enum(EXPERIENCES, { error: 'choose_one' }),
      activityLevel: z.enum(ACTIVITY_LEVELS, { error: 'choose_one' }),
      trainingDays: trainingDaysSchema,
      equipment: equipmentSchema,
      conditions: z.array(conditionSchema),
      parq: parqSchema,
    })
    .check(z.superRefine(withAgeCheck(today)));
}

export type OnboardingInput = z.infer<ReturnType<typeof onboardingSchema>>;
export type ConditionInput = z.infer<typeof conditionSchema>;

export function profilePatchSchema(today: string) {
  return z
    .partial(
      z.extend(bodySchema, {
        experience: z.enum(EXPERIENCES),
        activityLevel: z.enum(ACTIVITY_LEVELS),
        proteinGPerKg: number(PROTEIN_G_PER_KG.min, PROTEIN_G_PER_KG.max, 'protein_range'),
      }),
    )
    .check(z.superRefine(withAgeCheck(today)));
}

export type ProfilePatch = z.infer<ReturnType<typeof profilePatchSchema>>;
