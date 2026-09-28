import { DEFAULT_INVENTORY } from '../profile/inventory';
import { plateLoadout } from './plates';

describe('plateLoadout', () => {
  it('contoh dokumen: 65 kg → 20 + 2,5 per sisi', () => {
    expect(plateLoadout(65, DEFAULT_INVENTORY)).toEqual({
      perSideKg: [20, 2.5],
      totalKg: 65,
      exact: true,
    });
  });

  it('contoh dokumen: 66 kg dibulatkan ke bawah menjadi 65 kg', () => {
    const result = plateLoadout(66, DEFAULT_INVENTORY);
    expect(result.totalKg).toBe(65);
    expect(result.exact).toBe(false);
  });

  it('bar kosong tanpa pelat', () => {
    expect(plateLoadout(20, DEFAULT_INVENTORY).perSideKg).toEqual([]);
  });

  it('memakai pelat 1,25 kg', () => {
    expect(plateLoadout(62.5, DEFAULT_INVENTORY).perSideKg).toEqual([20, 1.25]);
  });

  it('memakai pelat paling sedikit', () => {
    expect(plateLoadout(100, DEFAULT_INVENTORY).perSideKg).toEqual([25, 15]);
  });
});
