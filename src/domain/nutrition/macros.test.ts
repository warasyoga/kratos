import { calculateMacros, calculateProteinTarget } from './macros';

describe('calculateProteinTarget', () => {
  it('contoh dokumen: 68,4 × 2,0 → 137 g', () => {
    expect(calculateProteinTarget(68.4)).toBe(137);
  });

  it('batas bawah 1,6 g/kg', () => {
    expect(calculateProteinTarget(68.4, 1.6)).toBe(109);
  });

  it('menolak di luar 1,6–2,2 g/kg', () => {
    expect(() => calculateProteinTarget(68.4, 3)).toThrow(RangeError);
  });
});

describe('calculateMacros', () => {
  it('contoh dokumen: 2.880 kkal, protein 137 g → lemak 80 g, karbo 403 g', () => {
    expect(calculateMacros(2880, 137)).toEqual({
      proteinG: 137,
      fatG: 80,
      carbsG: 403,
      carbsClamped: false,
    });
  });

  it('karbohidrat tidak pernah negatif', () => {
    const result = calculateMacros(1200, 250, 0.35);
    expect(result.carbsG).toBe(0);
    expect(result.carbsClamped).toBe(true);
  });

  it('lemak di bawah 20% ditolak', () => {
    expect(() => calculateMacros(2880, 137, 0.1)).toThrow(RangeError);
  });
});
