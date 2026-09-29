import { rangeStart, weekStarts } from './range';

describe('rangeStart', () => {
  // Selasa 29 Sep 2026; minggu ini mulai Senin 28 Sep.
  const today = '2026-09-29';

  it('4 minggu = minggu ini + 3 minggu sebelumnya', () => {
    expect(rangeStart('4w', today)).toBe('2026-09-07');
  });

  it('12 minggu', () => {
    expect(rangeStart('12w', today)).toBe('2026-07-13');
  });

  it('semua = Senin minggu data pertama', () => {
    expect(rangeStart('all', today, '2026-05-14')).toBe('2026-05-11');
  });

  it('semua tanpa data = minggu ini', () => {
    expect(rangeStart('all', today)).toBe('2026-09-28');
  });
});

describe('weekStarts', () => {
  it('daftar Senin dari awal rentang sampai minggu ini', () => {
    expect(weekStarts('2026-09-09', '2026-09-29')).toEqual([
      '2026-09-07',
      '2026-09-14',
      '2026-09-21',
      '2026-09-28',
    ]);
  });
});
