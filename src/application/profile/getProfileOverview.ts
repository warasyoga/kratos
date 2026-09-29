import { calculateBmi, classifyBmi, classifyBmiAsia, type BmiCategory } from '@/domain/body/bmi';
import { toLocalDate } from '@/domain/common/clock';
import { calculateBmr, calculateCalorieTarget, calculateTdee } from '@/domain/nutrition/energy';
import {
  calculateMacros,
  calculateProteinTarget,
  type MacroTargets,
} from '@/domain/nutrition/macros';
import { calculateWaterTargetL } from '@/domain/nutrition/water';
import { parqStatus, type ParqStatus } from '@/domain/profile/parq';
import {
  ageOn,
  type Equipment,
  type HealthCondition,
  type UserProfile,
} from '@/domain/profile/types';
import type { AppDeps } from '../deps';

/** Durasi latihan yang dipakai untuk target air di hari gym (menit). */
const GYM_SESSION_MINUTES = 60;

export interface ProfileOverview {
  profile: UserProfile;
  ageYears: number;
  weightKg: number;
  bmi: number;
  bmiCategory: BmiCategory;
  bmiAsiaCategory: BmiCategory;
  targets: MacroTargets & {
    kcal: number;
    bmr: number;
    tdee: number;
    /** Koreksi dari kalibrasi tren berat, sudah termasuk di kcal. */
    calorieAdjustmentKcal: number;
    waterRestL: number;
    waterGymL: number;
  };
  conditions: HealthCondition[];
  equipment: Equipment[];
  parq: ParqStatus;
}

/**
 * Ringkasan profil + semua target yang dihitung dari rumus di docs/sains-latihan.
 * null jika onboarding belum selesai.
 */
export function makeGetProfileOverview(deps: AppDeps) {
  return async function getProfileOverview(): Promise<ProfileOverview | null> {
    const [profile, weightKg, conditions, equipment] = await Promise.all([
      deps.profiles.get(),
      deps.bodyMetrics.latestWeightKg(),
      deps.conditions.list(),
      deps.gym.getEquipment(),
    ]);
    if (!profile || weightKg === null) return null;

    const now = deps.clock.now();
    const ageYears = ageOn(profile.birthDate, toLocalDate(now));
    const bmi = calculateBmi(weightKg, profile.heightCm);
    const bmr = calculateBmr({ sex: profile.sex, weightKg, heightCm: profile.heightCm, ageYears });
    const tdee = calculateTdee(bmr, profile.activityLevel);
    const calorieAdjustmentKcal = profile.calorieAdjustmentKcal ?? 0;
    const kcal = calculateCalorieTarget(tdee) + calorieAdjustmentKcal;
    const proteinG = calculateProteinTarget(weightKg, profile.proteinGPerKg);

    return {
      profile,
      ageYears,
      weightKg,
      bmi,
      bmiCategory: classifyBmi(bmi),
      bmiAsiaCategory: classifyBmiAsia(bmi),
      targets: {
        ...calculateMacros(kcal, proteinG),
        kcal,
        bmr,
        tdee,
        calorieAdjustmentKcal,
        waterRestL: calculateWaterTargetL(profile.sex),
        waterGymL: calculateWaterTargetL(profile.sex, GYM_SESSION_MINUTES),
      },
      conditions,
      equipment,
      parq: parqStatus(profile.parqCompletedAt, profile.parqAllNo, now),
    };
  };
}
