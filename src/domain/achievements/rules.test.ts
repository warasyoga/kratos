import { addDays } from '../common/weekday';
import {
  ACHIEVEMENT_IDS,
  ACHIEVEMENT_RULES,
  earnedAchievements,
  longestRun,
  type AchievementFacts,
  type AchievementId,
} from './rules';

const none: AchievementFacts = {
  finishedSessions: 0,
  completeWeeks: 0,
  longestStreakWeeks: 0,
  prCount: 0,
  benchE1rmKg: null,
  squatE1rmKg: null,
  bodyWeightKg: 68.4,
  longestProteinStreakDays: 0,
  completedBlocks: 0,
  photoDates: 0,
};

/** Untuk tiap lencana: fakta yang pas di ambang (terbuka) dan satu langkah di bawahnya (terkunci). */
const cases: Record<AchievementId, [Partial<AchievementFacts>, Partial<AchievementFacts>]> = {
  first_session: [{ finishedSessions: 1 }, { finishedSessions: 0 }],
  week_complete: [{ completeWeeks: 1 }, { completeWeeks: 0 }],
  streak_4: [{ longestStreakWeeks: 4 }, { longestStreakWeeks: 3 }],
  streak_12: [{ longestStreakWeeks: 12 }, { longestStreakWeeks: 11 }],
  sessions_10: [{ finishedSessions: 10 }, { finishedSessions: 9 }],
  sessions_50: [{ finishedSessions: 50 }, { finishedSessions: 49 }],
  sessions_100: [{ finishedSessions: 100 }, { finishedSessions: 99 }],
  first_pr: [{ prCount: 1 }, { prCount: 0 }],
  pr_10: [{ prCount: 10 }, { prCount: 9 }],
  bench_bodyweight: [{ benchE1rmKg: 68.4 }, { benchE1rmKg: 68.3 }],
  squat_1_25x: [{ squatE1rmKg: 85.5 }, { squatE1rmKg: 85.4 }],
  protein_week: [{ longestProteinStreakDays: 7 }, { longestProteinStreakDays: 6 }],
  block_complete: [{ completedBlocks: 1 }, { completedBlocks: 0 }],
  photo_diary: [{ photoDates: 3 }, { photoDates: 2 }],
};

describe('syarat lencana', () => {
  it.each(ACHIEVEMENT_IDS)('%s: terbuka di ambang, terkunci di bawahnya', (id) => {
    const [met, unmet] = cases[id];
    expect(ACHIEVEMENT_RULES[id]({ ...none, ...met })).toBe(true);
    expect(ACHIEVEMENT_RULES[id]({ ...none, ...unmet })).toBe(false);
  });

  it('tanpa berat badan, lencana rasio berat tidak terbuka', () => {
    expect(
      ACHIEVEMENT_RULES.bench_bodyweight({ ...none, bodyWeightKg: null, benchE1rmKg: 200 }),
    ).toBe(false);
  });

  it('earnedAchievements mengikuti urutan daftar', () => {
    expect(earnedAchievements({ ...none, finishedSessions: 10, prCount: 1 })).toEqual([
      'first_session',
      'sessions_10',
      'first_pr',
    ]);
  });
});

describe('longestRun', () => {
  const nextDay = (d: string) => addDays(d, 1);
  it('rangkaian hari berturut-turut terpanjang', () => {
    expect(
      longestRun(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-05', '2026-09-06'], nextDay),
    ).toBe(3);
  });
  it('kosong → 0', () => {
    expect(longestRun([], nextDay)).toBe(0);
  });
});
