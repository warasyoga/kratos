import { addDays, daysBetween, nextWeekday, sortWeekdays, startOfWeek, weekdayOf } from './weekday';

describe('weekday', () => {
  it('28 September 2026 adalah Senin', () => {
    expect(weekdayOf('2026-09-28')).toBe('mon');
    expect(weekdayOf('2026-10-04')).toBe('sun');
  });

  it('mengurutkan Senin → Minggu', () => {
    expect(sortWeekdays(['fri', 'mon', 'sun', 'tue'])).toEqual(['mon', 'tue', 'fri', 'sun']);
  });

  it('hari setelah Minggu adalah Senin', () => {
    expect(nextWeekday('sun')).toBe('mon');
  });

  it('menghitung dan menambah hari melewati akhir bulan', () => {
    expect(daysBetween('2026-09-28', '2026-10-12')).toBe(14);
    expect(addDays('2026-09-28', 7)).toBe('2026-10-05');
  });

  it('awal minggu adalah Senin', () => {
    expect(startOfWeek('2026-10-01')).toBe('2026-09-28'); // Kamis
    expect(startOfWeek('2026-10-04')).toBe('2026-09-28'); // Minggu
    expect(startOfWeek('2026-09-28')).toBe('2026-09-28');
  });
});
