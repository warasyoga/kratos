import type { Clock } from '@/domain/common/clock';
import type { AppDeps } from './deps';
import {
  makeRemoveHealthCondition,
  makeSaveHealthCondition,
  makeSetEquipment,
} from './gym/gymUseCases';
import { makeCompleteOnboarding } from './profile/completeOnboarding';
import { makeGetProfileOverview } from './profile/getProfileOverview';
import { makeChangeTrainingDays, makeSubmitParq, makeUpdateProfile } from './profile/updateProfile';
import { makeGetActiveProgram } from './program/getActiveProgram';

/**
 * Semua use case dan query yang tersedia untuk UI, dikelompokkan per modul.
 * Dirakit dari port (AppDeps); di aplikasi oleh src/app/container.ts, di test dengan repository memori.
 */
export function createServices(deps: AppDeps) {
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
    },
    program: {
      getActive: makeGetActiveProgram(deps),
    },
    catalog: {
      exercises: () => deps.exercises.list(),
    },
    platform: deps.platform,
  };
}

export type Services = ReturnType<typeof createServices>;
