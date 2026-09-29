/**
 * Lencana: aturan internal untuk motivasi, berdasarkan kemajuan nyata. docs/fitur/11-pencapaian.md
 * Setiap syarat punya test terpenuhi & belum terpenuhi (rules.test.ts).
 */
export const ACHIEVEMENT_IDS = [
  'first_session',
  'week_complete',
  'streak_4',
  'streak_12',
  'sessions_10',
  'sessions_50',
  'sessions_100',
  'first_pr',
  'pr_10',
  'bench_bodyweight',
  'squat_1_25x',
  'protein_week',
  'block_complete',
  'photo_diary',
] as const;
export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

/** Lencana yang sudah terbuka (tersimpan; tidak pernah terbuka dua kali). */
export interface UnlockedAchievement {
  id: string;
  achievementId: AchievementId;
  unlockedAt: number;
}

/** Ringkasan riwayat yang dibutuhkan semua syarat lencana. */
export interface AchievementFacts {
  finishedSessions: number;
  /** Minggu dengan semua sesi terjadwal selesai. */
  completeWeeks: number;
  /** Streak minggu lengkap terpanjang sepanjang riwayat. */
  longestStreakWeeks: number;
  prCount: number;
  benchE1rmKg: number | null;
  squatE1rmKg: number | null;
  bodyWeightKg: number | null;
  /** Hari berturut-turut terpanjang dengan protein ≥ target. */
  longestProteinStreakDays: number;
  completedBlocks: number;
  photoDates: number;
}

/** [Internal] Ambang lencana. */
export const ACHIEVEMENT_THRESHOLDS = {
  streakMonth: 4,
  streakQuarter: 12,
  sessions: [10, 50, 100],
  prCollector: 10,
  benchBodyweightRatio: 1,
  squatBodyweightRatio: 1.25,
  proteinDays: 7,
  photoDates: 3,
} as const;

const T = ACHIEVEMENT_THRESHOLDS;

const ratioAtLeast = (liftKg: number | null, bodyKg: number | null, ratio: number) =>
  liftKg !== null && bodyKg !== null && bodyKg > 0 && liftKg >= bodyKg * ratio;

export const ACHIEVEMENT_RULES: Record<AchievementId, (f: AchievementFacts) => boolean> = {
  first_session: (f) => f.finishedSessions >= 1,
  week_complete: (f) => f.completeWeeks >= 1,
  streak_4: (f) => f.longestStreakWeeks >= T.streakMonth,
  streak_12: (f) => f.longestStreakWeeks >= T.streakQuarter,
  sessions_10: (f) => f.finishedSessions >= T.sessions[0],
  sessions_50: (f) => f.finishedSessions >= T.sessions[1],
  sessions_100: (f) => f.finishedSessions >= T.sessions[2],
  first_pr: (f) => f.prCount >= 1,
  pr_10: (f) => f.prCount >= T.prCollector,
  bench_bodyweight: (f) => ratioAtLeast(f.benchE1rmKg, f.bodyWeightKg, T.benchBodyweightRatio),
  squat_1_25x: (f) => ratioAtLeast(f.squatE1rmKg, f.bodyWeightKg, T.squatBodyweightRatio),
  protein_week: (f) => f.longestProteinStreakDays >= T.proteinDays,
  block_complete: (f) => f.completedBlocks >= 1,
  photo_diary: (f) => f.photoDates >= T.photoDates,
};

/** Lencana yang syaratnya terpenuhi. */
export function earnedAchievements(facts: AchievementFacts): AchievementId[] {
  return ACHIEVEMENT_IDS.filter((id) => ACHIEVEMENT_RULES[id](facts));
}

/** Rangkaian berurutan terpanjang dari kumpulan kunci yang diurutkan (minggu/hari). */
export function longestRun(keys: readonly string[], next: (key: string) => string): number {
  const set = new Set(keys);
  let best = 0;
  for (const key of set) {
    let length = 1;
    for (let k = next(key); set.has(k); k = next(k)) length += 1;
    best = Math.max(best, length);
  }
  return best;
}
