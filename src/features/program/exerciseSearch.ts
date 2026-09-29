import type { CatalogItem } from '@/application/program/catalog';
import type { Exercise, Muscle } from '@/domain/exercise/types';
import { t } from '@/shared/i18n/id';
import { tLibrary } from '@/shared/i18n/library';

export type MuscleGroup = keyof typeof tLibrary.groups;

const GROUP_MUSCLES: Record<Exclude<MuscleGroup, 'all'>, readonly Muscle[]> = {
  chest: ['chest'],
  back: ['back_lats', 'back_upper'],
  shoulders: ['shoulder_front', 'shoulder_side', 'shoulder_rear'],
  arms: ['biceps', 'triceps', 'forearm'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
  core: ['abs'],
};

export const MUSCLE_GROUPS = Object.keys(tLibrary.groups) as MuscleGroup[];

/** Huruf kecil tanpa aksen, agar pencarian tidak peka tanda baca. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

/** Teks yang bisa dicari: nama, otot (Indonesia), pola gerakan, alat. "dada" → Bench Press. */
function searchableText(e: Exercise): string {
  return normalize(
    [
      e.name,
      ...e.primaryMuscles.map((m) => t.muscle[m]),
      ...e.secondaryMuscles.map((m) => t.muscle[m]),
      t.movement[e.pattern],
      ...e.equipment.map((q) => t.equipment[q]),
    ].join(' '),
  );
}

export interface SearchOptions {
  query: string;
  group: MuscleGroup;
  onlyAvailable: boolean;
}

export function searchExercises(
  items: readonly CatalogItem[],
  { query, group, onlyAvailable }: SearchOptions,
) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return items.filter(({ exercise, unavailable }) => {
    if (onlyAvailable && unavailable) return false;
    if (group !== 'all' && !exercise.primaryMuscles.some((m) => GROUP_MUSCLES[group].includes(m)))
      return false;
    const text = searchableText(exercise);
    return words.every((w) => text.includes(w));
  });
}
