import { linearScale, niceStep, niceTicks } from './chartScale';

describe('niceStep', () => {
  it.each([
    [10, 4, 2.5],
    [3.3, 4, 1],
    [1000, 4, 250],
    [0.8, 4, 0.2],
  ])('rentang %s dibagi ≤ %s → langkah %s', (span, count, step) => {
    expect(niceStep(span, count)).toBeCloseTo(step, 10);
  });
});

describe('niceTicks', () => {
  it('mencakup data dengan langkah rapi', () => {
    expect(niceTicks(66.7, 70)).toEqual([66, 67, 68, 69, 70]);
  });

  it('dimulai dari nol untuk tonase', () => {
    expect(niceTicks(0, 3450)).toEqual([0, 1000, 2000, 3000, 4000]);
  });

  it('nilai datar diperlebar', () => {
    const ticks = niceTicks(68.4, 68.4);
    expect(ticks[0]).toBeLessThan(68.4);
    expect(ticks.at(-1)).toBeGreaterThan(68.4);
  });
});

describe('linearScale', () => {
  it('memetakan domain ke rentang piksel (sumbu y terbalik)', () => {
    const y = linearScale([60, 70], [100, 0]);
    expect(y(60)).toBe(100);
    expect(y(65)).toBe(50);
    expect(y(70)).toBe(0);
  });

  it('domain nol → tengah rentang', () => {
    expect(linearScale([5, 5], [0, 100])(5)).toBe(50);
  });
});
