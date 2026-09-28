import { ageOn } from './types';

describe('ageOn', () => {
  it('menghitung umur penuh', () => {
    expect(ageOn('2002-05-10', '2026-09-28')).toBe(24);
  });

  it('belum ulang tahun di tahun berjalan', () => {
    expect(ageOn('2002-10-01', '2026-09-28')).toBe(23);
  });

  it('tepat di hari ulang tahun', () => {
    expect(ageOn('2002-09-28', '2026-09-28')).toBe(24);
  });
});
