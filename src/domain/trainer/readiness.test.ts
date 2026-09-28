import { assessReadiness } from './readiness';

// Tabel kasus uji: docs/mesin-trainer/03-autoregulasi-checkin.md
describe('assessReadiness', () => {
  it.each([
    [7, 2, 4, 'green'],
    [5.5, 2, 4, 'yellow'],
    [7, 4, 3, 'yellow'],
    [7, 2, 2, 'yellow'],
    [7, 5, 4, 'red'],
    [3.5, 1, 5, 'red'],
    [7, 1, 1, 'red'],
    [6, 3, 3, 'green'],
    [4, 3, 3, 'yellow'],
  ] as const)('tidur %s j, pegal %s, energi %s → %s', (sleepHours, soreness, energy, expected) => {
    expect(assessReadiness({ sleepHours, soreness, energy, painAreas: [] })).toBe(expected);
  });

  it('nyeri tajam tidak mengubah warna (ditangani per gerakan)', () => {
    expect(
      assessReadiness({ sleepHours: 7, soreness: 2, energy: 4, painAreas: ['shoulder_left'] }),
    ).toBe('green');
  });

  it('menolak nilai skala di luar 1–5', () => {
    expect(() => assessReadiness({ sleepHours: 7, soreness: 0, energy: 4, painAreas: [] })).toThrow(
      RangeError,
    );
  });
});
