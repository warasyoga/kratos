import { PARQ_QUESTIONS, parqAllNo, parqStatus, type ParqAnswers } from './parq';

const allNo = Object.fromEntries(PARQ_QUESTIONS.map((q) => [q, false])) as ParqAnswers;
const DAY = 86_400_000;
const NOW = new Date('2026-09-28T07:00:00').getTime();

describe('PAR-Q+', () => {
  it('memiliki 7 pertanyaan umum', () => {
    expect(PARQ_QUESTIONS).toHaveLength(7);
  });

  it('semua tidak → boleh mulai', () => {
    expect(parqAllNo(allNo)).toBe(true);
    expect(parqAllNo({ ...allNo, bone_joint: true })).toBe(false);
  });

  it.each([
    [undefined, undefined, 'missing'],
    [NOW - 10 * DAY, true, 'clear'],
    [NOW - 10 * DAY, false, 'consult_doctor'],
    [NOW - 370 * DAY, true, 'expired'],
  ] as const)('selesai %s, semua tidak %s → %s', (completedAt, all, status) => {
    expect(parqStatus(completedAt, all, NOW)).toBe(status);
  });
});
