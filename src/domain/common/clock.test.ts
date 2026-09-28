import { createFixedClock, toLocalDate } from './clock';

describe('createFixedClock', () => {
  it('selalu mengembalikan waktu yang sama', () => {
    const clock = createFixedClock('2026-09-28T07:00:00');
    expect(clock.now()).toBe(clock.now());
    expect(toLocalDate(clock.now())).toBe('2026-09-28');
  });

  it('menolak waktu tidak valid', () => {
    expect(() => createFixedClock('bukan tanggal')).toThrow(RangeError);
  });
});

describe('toLocalDate', () => {
  it('memakai tanggal lokal, bukan UTC', () => {
    const lateNight = new Date(2026, 8, 28, 23, 30).getTime();
    expect(toLocalDate(lateNight)).toBe('2026-09-28');
  });
});
