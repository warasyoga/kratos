import { calculateWaterTargetL } from './water';

describe('calculateWaterTargetL', () => {
  it('contoh dokumen: hari istirahat pria 2,0 L', () => {
    expect(calculateWaterTargetL('male')).toBeCloseTo(2.0, 5);
  });

  it('contoh dokumen: hari gym 60 menit 2,5 L', () => {
    expect(calculateWaterTargetL('male', 60)).toBeCloseTo(2.5, 5);
  });

  it('wanita hari istirahat 1,6 L', () => {
    expect(calculateWaterTargetL('female')).toBeCloseTo(1.6, 5);
  });
});
