import type { Clock } from '@/domain/common/clock';
import type { AppDeps } from './deps';
import {
  makeInventoryUseCases,
  makeRemoveHealthCondition,
  makeSaveHealthCondition,
  makeSetEquipment,
} from './gym/gymUseCases';
import { makeCompleteOnboarding } from './profile/completeOnboarding';
import { makeGetProfileOverview } from './profile/getProfileOverview';
import { makeChangeTrainingDays, makeSubmitParq, makeUpdateProfile } from './profile/updateProfile';
import { makeCatalogUseCases } from './program/catalog';
import { makeGetActiveProgram } from './program/getActiveProgram';
import { createProgramEditor } from './program/programEditor';
import { makeSuggestionUseCases } from './program/suggestions';
import { makeCheckInUseCases } from './workout/checkIn';
import { makeSessionLifecycle } from './workout/sessionLifecycle';
import { makeSetActions } from './workout/setActions';

/**
 * Semua use case dan query yang tersedia untuk UI, dikelompokkan per modul.
 * Dirakit dari port (AppDeps); di aplikasi oleh src/app/container.ts, di test dengan repository memori.
 */
export function createServices(deps: AppDeps) {
  const editor = createProgramEditor(deps);
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
      suggestions: makeSuggestionUseCases(deps, editor),
    },
    catalog: makeCatalogUseCases(deps),
    checkIn: makeCheckInUseCases(deps),
    workout: {
      ...makeSessionLifecycle(deps),
      sets: makeSetActions(deps),
    },
    platform: deps.platform,
  };
}

export type Services = ReturnType<typeof createServices>;
