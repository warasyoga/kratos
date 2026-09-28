import { estimateBodyFatNavy } from './bodyFat';

describe('estimateBodyFatNavy', () => {
  it('contoh dokumen: pria 175 cm, leher 37, pinggang 80 → 13,7%', () => {
    expect(
      estimateBodyFatNavy({ sex: 'male', heightCm: 175, neckCm: 37, waistCm: 80 }),
    ).toBeCloseTo(13.7, 1);
  });

  it('wanita memakai pinggul', () => {
    const result = estimateBodyFatNavy({
      sex: 'female',
      heightCm: 165,
      neckCm: 32,
      waistCm: 72,
      hipCm: 98,
    });
    // 495 / (1,29579 − 0,35004·log10(138) + 0,221·log10(165)) − 450
    // = 495 / 1,03682 − 450
    expect(result).toBeCloseTo(27.4, 1);
  });

  it('wanita tanpa pinggul ditolak', () => {
    expect(() =>
      estimateBodyFatNavy({ sex: 'female', heightCm: 165, neckCm: 32, waistCm: 72 }),
    ).toThrow(RangeError);
  });

  it('pinggang tidak boleh ≤ leher', () => {
    expect(() =>
      estimateBodyFatNavy({ sex: 'male', heightCm: 175, neckCm: 40, waistCm: 38 }),
    ).toThrow(RangeError);
  });
});
