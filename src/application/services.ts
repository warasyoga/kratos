import type { Clock } from '@/domain/common/clock';
import { makeAchievementUseCases } from './achievements/achievementUseCases';
import { makeEvaluation } from './achievements/evaluation';
import { makeBackupUseCases } from './backup/backupUseCases';
import type { AppDeps } from './deps';
import {
  makeInventoryUseCases,
  makeRemoveHealthCondition,
  makeSaveHealthCondition,
  makeSetEquipment,
} from './gym/gymUseCases';
import { makeNutritionUseCases } from './nutrition/nutritionUseCases';
import { makeCompleteOnboarding } from './profile/completeOnboarding';
import { makeGetProfileOverview } from './profile/getProfileOverview';
import { makeChangeTrainingDays, makeSubmitParq, makeUpdateProfile } from './profile/updateProfile';
import { makeCatalogUseCases } from './program/catalog';
import { makeCustomExerciseUseCases } from './program/customExercises';
import { makeGetActiveProgram } from './program/getActiveProgram';
import { createProgramEditor } from './program/programEditor';
import { makeSuggestionUseCases } from './program/suggestions';
import { makeBodyProgress } from './progress/bodyProgress';
import { makeMuscleMap } from './progress/muscleMap';
import { makePhotoUseCases } from './progress/photos';
import { makeStrengthProgress } from './progress/strengthProgress';
import { makeVolumeProgress } from './progress/volumeProgress';
import { makeReminderUseCases } from './reminders/reminderUseCases';
import { makeTodayUseCases } from './today/todayUseCases';
import { makeCheckInUseCases } from './workout/checkIn';
import { makeSessionLifecycle } from './workout/sessionLifecycle';
import { makeSetActions } from './workout/setActions';

/**
 * Semua use case dan query yang tersedia untuk UI, dikelompokkan per modul.
 * Dirakit dari port (AppDeps); di aplikasi oleh src/app/container.ts, di test dengan repository memori.
 */
export function createServices(deps: AppDeps) {
  const editor = createProgramEditor(deps);
  const suggestions = makeSuggestionUseCases(deps, editor);
  return {
    clock: deps.clock as Clock,
    profile: {
      getOverview: makeGetProfileOverview(deps),
      completeOnboarding: makeCompleteOnboarding(deps),
      update: makeUpdateProfile(deps),
      changeTrainingDays: makeChangeTrainingDays(deps),
      submitParq: makeSubmitParq(deps),
    },
    gym: {
      setEquipment: makeSetEquipment(deps),
      saveHealthCondition: makeSaveHealthCondition(deps),
      removeHealthCondition: makeRemoveHealthCondition(deps),
      inventory: makeInventoryUseCases(deps),
    },
    program: {
      getActive: makeGetActiveProgram(deps),
      edit: editor,
      suggestions,
    },
    catalog: { ...makeCatalogUseCases(deps), custom: makeCustomExerciseUseCases(deps) },
    today: makeTodayUseCases(deps),
    checkIn: makeCheckInUseCases(deps),
    workout: {
      ...makeSessionLifecycle(deps),
      sets: makeSetActions(deps),
    },
    nutrition: makeNutritionUseCases(deps),
    achievements: makeAchievementUseCases(deps),
    reminders: makeReminderUseCases(deps),
    backup: makeBackupUseCases(deps),
    evaluation: makeEvaluation(deps, suggestions.list),
    progress: {
      ...makeStrengthProgress(deps),
      ...makeBodyProgress(deps),
      volume: makeVolumeProgress(deps),
      muscles: makeMuscleMap(deps),
      photos: makePhotoUseCases(deps),
    },
    platform: deps.platform,
  };
}

export type Services = ReturnType<typeof createServices>;
