import { PARQ_REPEAT_MONTHS } from '../standards';

/**
 * Tujuh pertanyaan umum PAR-Q+ (The PAR-Q+ Collaboration). Teks pertanyaan ada di i18n.
 * docs/sains-latihan/05-keamanan-dan-pemulihan.md §1
 */
export const PARQ_QUESTIONS = [
  'heart_condition',
  'chest_pain',
  'dizziness',
  'chronic_condition',
  'medication',
  'bone_joint',
  'supervised_only',
] as const;

export type ParqQuestion = (typeof PARQ_QUESTIONS)[number];
export type ParqAnswers = Record<ParqQuestion, boolean>;

/** true jika semua jawaban "tidak" (boleh mulai tanpa konsultasi dokter). */
export function parqAllNo(answers: ParqAnswers): boolean {
  return PARQ_QUESTIONS.every((q) => answers[q] === false);
}

export type ParqStatus = 'missing' | 'clear' | 'consult_doctor' | 'expired';

export function parqStatus(
  completedAt: number | undefined,
  allNo: boolean | undefined,
  now: number,
): ParqStatus {
  if (completedAt === undefined) return 'missing';
  const expiryMs = PARQ_REPEAT_MONTHS * 30.44 * 86_400_000;
  if (now - completedAt >= expiryMs) return 'expired';
  return allNo ? 'clear' : 'consult_doctor';
}
