import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import { parqAllNo, type ParqAnswers } from '@/domain/profile/parq';
import type { Weekday } from '@/domain/common/weekday';
import { startOfWeek } from '@/domain/common/weekday';
import { generateProgram, type ProgramWarning } from '@/domain/program/generateProgram';
import type { AppDeps } from '../deps';
import { reconcileActiveProgram, type ProgramChange } from '../program/programChanges';
import { validate } from '../validation';
import { parqSchema, profilePatchSchema, trainingDaysSchema } from './schemas';

const missingProfile = () => err({ code: 'profile_missing', message: 'Onboarding belum selesai' });

/**
 * Ubah data diri/tujuan. Berat baru dicatat sebagai pengukuran hari ini.
 * Perubahan pengalaman bisa mengganti gerakan yang terlalu sulit.
 */
export function makeUpdateProfile(deps: AppDeps) {
  return async function updateProfile(raw: unknown): Promise<Result<{ changes: ProgramChange[] }>> {
    const now = deps.clock.now();
    const parsed = validate(profilePatchSchema(toLocalDate(now)), raw);
    if (!parsed.ok) return parsed;
    const current = await deps.profiles.get();
    if (!current) return missingProfile();

    const { weightKg, ...fields } = parsed.value;
    const definedFields = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    ) as Partial<typeof current>;

    return deps.tx.run(async () => {
      await deps.profiles.save({ ...current, ...definedFields, updatedAt: now });
      if (weightKg !== undefined) {
        await deps.bodyMetrics.add({
          id: deps.newId(),
          logDate: toLocalDate(now),
          weightKg,
          createdAt: now,
        });
      }
      const changes =
        definedFields.experience && definedFields.experience !== current.experience
          ? await reconcileActiveProgram(deps)
          : [];
      return ok({ changes });
    });
  };
}

/**
 * Ganti hari latihan → program baru dari template (riwayat tetap tersimpan).
 * docs/mesin-trainer/01-pembuatan-program.md "Mengedit program"
 */
export function makeChangeTrainingDays(deps: AppDeps) {
  return async function changeTrainingDays(
    raw: unknown,
  ): Promise<Result<{ programName: string; warnings: ProgramWarning[] }>> {
    const parsed = validate(trainingDaysSchema, raw);
    if (!parsed.ok) return parsed;
    const days: Weekday[] = parsed.value;
    const profile = await deps.profiles.get();
    if (!profile) return missingProfile();

    const now = deps.clock.now();
    const [library, equipment, conditions] = await Promise.all([
      deps.exercises.list(),
      deps.gym.getEquipment(),
      deps.conditions.list(),
    ]);
    const generated = generateProgram({
      library,
      availableEquipment: equipment,
      conditions,
      experience: profile.experience,
      trainingDays: days,
      startDate: startOfWeek(toLocalDate(now)),
      createdAt: now,
      newId: deps.newId,
    });

    await deps.tx.run(async () => {
      await deps.profiles.save({ ...profile, trainingDays: days, updatedAt: now });
      await deps.programs.saveAsActive(generated);
    });
    return ok({ programName: generated.program.name, warnings: generated.warnings });
  };
}

/** Simpan hasil skrining PAR-Q+. */
export function makeSubmitParq(deps: AppDeps) {
  return async function submitParq(raw: unknown): Promise<Result<{ allNo: boolean }>> {
    const parsed = validate(parqSchema, raw);
    if (!parsed.ok) return parsed;
    const profile = await deps.profiles.get();
    if (!profile) return missingProfile();

    const now = deps.clock.now();
    const allNo = parqAllNo(parsed.value as ParqAnswers);
    await deps.profiles.save({
      ...profile,
      parqCompletedAt: now,
      parqAllNo: allNo,
      updatedAt: now,
    });
    return ok({ allNo });
  };
}
