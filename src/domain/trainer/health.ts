import type { Exercise } from '../exercise/types';
import type { HealthCondition } from '../profile/types';

export type HealthVerdict = 'ok' | 'locked' | 'rejected';

/**
 * Kecocokan gerakan dengan kondisi kesehatan aktif.
 * - ringan: tolak pola gerakan yang terasa sakit
 * - sedang: seperti ringan; gerakan yang membebani area itu boleh, tetapi progresi dikunci
 * - berat : tolak semua gerakan yang membebani area itu
 * docs/sains-latihan/05-keamanan-dan-pemulihan.md §6 · docs/mesin-trainer/05-substitusi-gerakan.md
 */
export function assessHealth(
  exercise: Exercise,
  conditions: readonly HealthCondition[],
): HealthVerdict {
  let verdict: HealthVerdict = 'ok';
  for (const c of conditions) {
    if (!c.active) continue;
    const stressesArea = exercise.stressedAreas.includes(c.area);
    const painfulPattern = c.painfulMovements.includes(exercise.pattern);

    if (c.severity === 'severe' && stressesArea) return 'rejected';
    if (painfulPattern) return 'rejected';
    if (c.severity === 'moderate' && stressesArea) verdict = 'locked';
  }
  return verdict;
}
