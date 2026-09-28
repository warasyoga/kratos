import { formatDayDate, formatKg, formatNumber, parseLocalDate } from './format';

describe('formatNumber', () => {
  it('memakai koma desimal dan titik ribuan', () => {
    expect(formatNumber(68.4)).toBe('68,4');
    expect(formatNumber(2880)).toBe('2.880');
  });

  it('membatasi digit desimal', () => {
    expect(formatNumber(82.333)).toBe('82,3');
  });
});

describe('formatKg', () => {
  it('menampilkan kelipatan pelat 1,25 kg dengan lengkap', () => {
    expect(formatKg(61.25)).toBe('61,25 kg');
    expect(formatKg(65)).toBe('65 kg');
  });
});

describe('parseLocalDate', () => {
  it('mengurai sebagai tanggal lokal', () => {
    const d = parseLocalDate('2026-09-28');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 8, 28]);
  });

  it('menolak format lain', () => {
    expect(() => parseLocalDate('28/09/2026')).toThrow(RangeError);
  });
});

describe('formatDayDate', () => {
  it('menampilkan hari dan tanggal dalam bahasa Indonesia', () => {
    expect(formatDayDate('2026-09-28')).toBe('Senin, 28 September');
  });
});
