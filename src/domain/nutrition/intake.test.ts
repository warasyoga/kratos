import { computeWeightTrend } from '../body/weightTrend';
import { addDays } from '../common/weekday';
import { FOOD_REFERENCES, nutrientsFor } from './foodReferences';
import { intakeByDay, sumIntake, type NutritionLog } from './intake';
import { decideCalorieAdjustment, recalibrationInput } from './recalibration';

const food = (logDate: string, kcal: number, proteinG: number, extra = {}): NutritionLog => ({
  id: `${logDate}-${kcal}`,
  logDate,
  label: 'Makan',
  kcal,
  proteinG,
  createdAt: 0,
  ...extra,
});

describe('sumIntake', () => {
  it('menjumlahkan makan dan air; karbo/lemak kosong dihitung 0', () => {
    const total = sumIntake(
      [food('2026-09-29', 500, 30, { carbsG: 60, fatG: 10 }), food('2026-09-29', 300, 25)],
      [
        { id: 'w1', logDate: '2026-09-29', ml: 250, createdAt: 0 },
        { id: 'w2', logDate: '2026-09-29', ml: 500, createdAt: 0 },
      ],
    );
    expect(total).toEqual({ kcal: 800, proteinG: 55, carbsG: 60, fatG: 10, waterMl: 750 });
  });
});

describe('intakeByDay', () => {
  it('hari tanpa catatan dilewati', () => {
    const days = intakeByDay(
      [food('2026-09-27', 2000, 120), food('2026-09-29', 2500, 140)],
      ['2026-09-27', '2026-09-28', '2026-09-29'],
    );
    expect(days.map((d) => [d.logDate, d.intake.proteinG])).toEqual([
      ['2026-09-27', 120],
      ['2026-09-29', 140],
    ]);
  });
});

describe('porsi referensi TKPI', () => {
  it('nasi 1 piring 150 g = 270 kkal, protein 4,5 g (TKPI AP001: 180 kkal/100 g)', () => {
    const nasi = FOOD_REFERENCES.find((f) => f.code === 'AP001');
    expect(nasi && nutrientsFor(nasi)).toEqual({
      kcal: 270,
      proteinG: 4.5,
      fatG: 0.5,
      carbsG: 59.7,
    });
  });

  it('berat porsi bisa diubah: telur 2 butir 110 g', () => {
    const telur = FOOD_REFERENCES.find((f) => f.code === 'HR002');
    expect(telur && nutrientsFor(telur, 110)).toMatchObject({ kcal: 169, proteinG: 13.6 });
  });

  it('setiap referensi punya sumber dan kode', () => {
    for (const f of FOOD_REFERENCES) {
      expect(f.code).not.toBe('');
      expect(['TKPI 2019', 'USDA SR']).toContain(f.source);
      expect(f.portion.grams).toBeGreaterThan(0);
    }
  });
});

describe('recalibrationInput', () => {
  const days = (n: number, perDay: number) =>
    Array.from({ length: n }, (_, i) => ({
      logDate: addDays('2026-09-01', i),
      weightKg: 68 + perDay * i,
    }));

  it('null jika tren < 15 hari', () => {
    const weighIns = days(10, 0.02);
    expect(recalibrationInput(computeWeightTrend(weighIns), weighIns)).toBeNull();
  });

  it('laju mingguan dari tren 14 hari dan jumlah timbangan di jendela', () => {
    const weighIns = days(30, 0);
    const input = recalibrationInput(computeWeightTrend(weighIns), weighIns);
    expect(input).toEqual({ weeklyGainKg: 0, bodyWeightKg: 68, weighInsInWindow: 14 });
    // Berat datar → naik < 0,25%/minggu → +150 kkal (docs/sains-latihan/01-nutrisi.md §7).
    expect(input && decideCalorieAdjustment(input)).toEqual({ kind: 'increase', deltaKcal: 150 });
  });
});
