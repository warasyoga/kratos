/**
 * Porsi referensi bahan makanan umum di Indonesia.
 * Nilai gizi per 100 g bagian yang dapat dimakan (BDD):
 * - [Standar] Tabel Komposisi Pangan Indonesia (TKPI) 2019, Kemenkes RI (kode TKPI di `code`).
 * - [Standar] USDA National Nutrient Database SR, untuk dada ayam tanpa kulit yang tidak ada di TKPI.
 * Berat porsi = perkiraan porsi rumah tangga [Internal]; pengguna bisa mengubah beratnya.
 * docs/fitur/08-nutrisi.md, docs/sains-latihan/01-nutrisi.md
 */
export interface NutrientsPer100g {
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export interface FoodReference {
  id: string;
  name: string;
  source: 'TKPI 2019' | 'USDA SR';
  code: string;
  per100g: NutrientsPer100g;
  /** Porsi umum dan beratnya dalam gram (BDD). */
  portion: { label: string; grams: number };
}

const ref = (
  id: string,
  name: string,
  source: FoodReference['source'],
  code: string,
  [kcal, proteinG, fatG, carbsG]: readonly [number, number, number, number],
  portion: FoodReference['portion'],
): FoodReference => ({
  id,
  name,
  source,
  code,
  per100g: { kcal, proteinG, fatG, carbsG },
  portion,
});

export const FOOD_REFERENCES: readonly FoodReference[] = [
  ref('nasi', 'Nasi putih', 'TKPI 2019', 'AP001', [180, 3.0, 0.3, 39.8], {
    label: '1 piring',
    grams: 150,
  }),
  ref('kentang', 'Kentang', 'TKPI 2019', 'BR013', [62, 2.1, 0.2, 13.5], {
    label: '2 buah sedang',
    grams: 200,
  }),
  ref('telur', 'Telur ayam', 'TKPI 2019', 'HR002', [154, 12.4, 10.8, 0.7], {
    label: '1 butir',
    grams: 55,
  }),
  ref('dada-ayam', 'Dada ayam tanpa kulit, panggang', 'USDA SR', '05064', [165, 31.0, 3.6, 0], {
    label: '1 potong',
    grams: 100,
  }),
  ref('ayam-goreng-dada', 'Ayam goreng, dada', 'TKPI 2019', 'FP029', [246, 37.9, 9.0, 0.7], {
    label: '1 potong',
    grams: 100,
  }),
  ref('ikan-tongkol', 'Ikan tongkol', 'TKPI 2019', 'GR080', [100, 13.7, 1.5, 8.0], {
    label: '1 potong',
    grams: 100,
  }),
  ref('udang', 'Udang', 'TKPI 2019', 'GR084', [91, 21.0, 0.2, 0.1], {
    label: '1 porsi',
    grams: 100,
  }),
  ref('tempe-goreng', 'Tempe goreng', 'TKPI 2019', 'CP076', [350, 24.5, 26.6, 10.4], {
    label: '2 potong sedang',
    grams: 50,
  }),
  ref(
    'tempe',
    'Tempe mentah (untuk dikukus/direbus)',
    'TKPI 2019',
    'CP077',
    [201, 20.8, 8.8, 13.5],
    {
      label: '2 potong sedang',
      grams: 50,
    },
  ),
  ref('tahu', 'Tahu', 'TKPI 2019', 'CP061', [80, 10.9, 4.7, 0.8], {
    label: '1 potong besar',
    grams: 100,
  }),
  ref('susu-sapi', 'Susu sapi segar', 'TKPI 2019', 'JR006', [61, 3.2, 3.5, 4.3], {
    label: '1 gelas',
    grams: 200,
  }),
  ref('pisang-ambon', 'Pisang ambon', 'TKPI 2019', 'ER074', [108, 1.0, 0.8, 24.3], {
    label: '1 buah',
    grams: 75,
  }),
];

/** Nilai gizi untuk berat tertentu, dibulatkan (kkal bulat, gram 1 desimal). */
export function nutrientsFor(food: FoodReference, grams: number = food.portion.grams) {
  const f = grams / 100;
  const g = (v: number) => Math.round(v * f * 10) / 10;
  return {
    kcal: Math.round(food.per100g.kcal * f),
    proteinG: g(food.per100g.proteinG),
    fatG: g(food.per100g.fatG),
    carbsG: g(food.per100g.carbsG),
  };
}
