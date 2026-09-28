import { WEEKDAYS } from '@/domain/common/weekday';
import { MOVEMENT_PATTERNS } from '@/domain/exercise/types';
import {
  ACTIVITY_LEVELS,
  BODY_AREAS,
  EXPERIENCES,
  SEVERITIES,
  SEXES,
} from '@/domain/profile/types';
import { t } from '@/shared/i18n/id';

/** Pilihan form yang dibangun dari daftar nilai domain + label i18n. */
export const sexOptions = SEXES.map((value) => ({ value, label: t.sex[value] }));
export const experienceOptions = EXPERIENCES.map((value) => ({ value, ...t.experience[value] }));
export const activityOptions = ACTIVITY_LEVELS.map((value) => ({ value, ...t.activity[value] }));
export const severityOptions = SEVERITIES.map((value) => ({ value, ...t.severity[value] }));
export const bodyAreaOptions = BODY_AREAS.map((value) => ({ value, label: t.bodyArea[value] }));
export const movementOptions = MOVEMENT_PATTERNS.map((value) => ({
  value,
  label: t.movement[value],
}));
export const weekdays = WEEKDAYS;
