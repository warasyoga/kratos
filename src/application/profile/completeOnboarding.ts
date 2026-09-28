import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import { startOfWeek } from '@/domain/common/weekday';
import { parqAllNo } from '@/domain/profile/parq';
import { DEFAULT_INVENTORY } from '@/domain/profile/inventory';
import type { HealthCondition, UserProfile } from '@/domain/profile/types';
import { generateProgram, type ProgramWarning } from '@/domain/program/generateProgram';
import { PROTEIN_G_PER_KG } from '@/domain/standards';
import type { AppDeps } from '../deps';
import { validate } from '../validation';
import { onboardingSchema } from './schemas';

export interface OnboardingResult {
  programName: string;
  warnings: ProgramWarning[];
}

/**
 * Simpan jawaban onboarding dan buat program pertama dalam satu transaksi.
 * docs/fitur/01-onboarding.md
 */
export function makeCompleteOnboarding(deps: AppDeps) {
  return async function completeOnboarding(raw: unknown): Promise<Result<OnboardingResult>> {
    const now = deps.clock.now();
    const today = toLocalDate(now);
    const parsed = validate(onboardingSchema(today), raw);
    if (!parsed.ok) return parsed;
    const input = parsed.value;

    if (await deps.profiles.get()) {
      return err({ code: 'already_onboarded', message: 'Profil sudah ada' });
    }

    const conditions: HealthCondition[] = input.conditions.map((c) => ({
      id: deps.newId(),
      ...c,
      active: true,
      createdAt: now,
    }));

    const profile: UserProfile = {
      id: 'me',
      name: input.name,
      sex: input.sex,
      birthDate: input.birthDate,
      heightCm: input.heightCm,
      goal: 'hypertrophy',
      experience: input.experience,
      activityLevel: input.activityLevel,
      trainingDays: input.trainingDays,
      proteinGPerKg: PROTEIN_G_PER_KG.default,
      parqCompletedAt: now,
      parqAllNo: parqAllNo(input.parq),
      createdAt: now,
      updatedAt: now,
    };

    const generated = generateProgram({
      library: await deps.exercises.list(),
      availableEquipment: input.equipment,
      conditions,
      experience: input.experience,
      trainingDays: input.trainingDays,
      startDate: startOfWeek(today),
      createdAt: now,
      newId: deps.newId,
    });

    await deps.tx.run(async () => {
      await deps.profiles.save(profile);
      for (const c of conditions) await deps.conditions.save(c);
      await deps.gym.setEquipment(input.equipment);
      await deps.gym.setInventory(DEFAULT_INVENTORY);
      await deps.bodyMetrics.add({
        id: deps.newId(),
        logDate: today,
        weightKg: input.weightKg,
        createdAt: now,
      });
      await deps.programs.saveAsActive(generated);
    });

    return ok({ programName: generated.program.name, warnings: generated.warnings });
  };
}
