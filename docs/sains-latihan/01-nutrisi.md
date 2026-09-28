# 01 · Nutrisi

Kode: `src/domain/nutrition/`

## 1. BMR (energi basal): Mifflin-St Jeor · **Standar**

```
Pria   : BMR = 10 × berat(kg) + 6,25 × tinggi(cm) − 5 × umur(th) + 5
Wanita : BMR = 10 × berat(kg) + 6,25 × tinggi(cm) − 5 × umur(th) − 161
```
Sumber: Mifflin et al. 1990. Direkomendasikan Academy of Nutrition and Dietetics sebagai
rumus prediksi paling akurat untuk orang dewasa sehat.

**Contoh:** 10 × 68,4 + 6,25 × 175 − 5 × 24 + 5 = 684 + 1.093,75 − 120 + 5 = **1.662,75 kkal**

## 2. TDEE (energi harian total) · **Standar**

```
TDEE = BMR × faktor aktivitas
```

| Level | Faktor | Gambaran (di luar sesi gym) |
|---|---|---|
| `sedentary` | 1,2 | Kerja duduk, hampir tanpa olahraga |
| `light` | 1,375 | Olahraga ringan 1–3×/minggu |
| `moderate` | 1,55 | Olahraga 3–5×/minggu |
| `very` | 1,725 | Olahraga berat 6–7×/minggu |
| `extra` | 1,9 | Kerja fisik berat + latihan harian |

Faktor ini adalah faktor aktivitas yang dipakai luas bersama Mifflin-St Jeor. Rentangnya
sejalan dengan kategori PAL FAO/WHO/UNU 2004 (1,40–2,40 untuk orang dewasa aktif).
Latihan 4×/minggu → default `moderate`.

**Contoh:** 1.662,75 × 1,55 = **2.577,3 kkal**

Catatan: ini **estimasi awal**. Setelah 2 minggu, aplikasi mengkalibrasi ulang dari tren berat
badan nyata (bagian 7).

## 3. Target kalori menambah otot · **Bukti ilmiah**

```
Target = TDEE + surplus
surplus awal pemula = +300 kkal (rentang 250–500)
```
Tujuan surplus adalah laju naik berat **0,25–0,5% berat badan per minggu** (Iraki et al. 2019).
Pemula boleh di sisi atas rentang karena potensi pertumbuhan ototnya paling besar.

**Contoh:** 2.577,3 + 300 = 2.877,3 → dibulatkan ke 10 terdekat = **2.880 kkal**

## 4. Protein · **Bukti ilmiah**

```
Protein (g) = berat(kg) × 1,6–2,2      default 2,0
```
Sumber: ISSN Position Stand (Jäger et al. 2017) merekomendasikan 1,4–2,0 g/kg; meta-analisis
Morton et al. 2018 menemukan manfaat mendatar di ±1,6 g/kg dengan batas atas interval kepercayaan 2,2 g/kg.
Default 2,0 dipilih agar pemula aman berada di atas titik mendatar.

Distribusi: 0,4 g/kg per makan, minimal 4 kali makan (Schoenfeld & Aragon 2018).

**Contoh:** 68,4 × 2,0 = 136,8 → **137 g/hari**, atau ±27 g per makan × 5.

## 5. Lemak & karbohidrat · **Standar** + **Aturan internal**

```
Lemak (g)       = Target × 25% ÷ 9       (AMDR 20–35%, IOM 2005; default 25% = aturan internal)
Karbohidrat (g) = (Target − protein×4 − lemak×9) ÷ 4
```

**Contoh:**
- Lemak: 2.880 × 0,25 = 720 kkal ÷ 9 = **80 g**
- Karbohidrat: (2.880 − 137×4 − 720) ÷ 4 = (2.880 − 548 − 720) ÷ 4 = 1.612 ÷ 4 = **403 g**

Validasi: lemak tidak boleh < 20% kalori; jika pengguna mengubah protein sehingga karbohidrat
negatif, tampilkan peringatan.

## 6. Air minum · **Standar** + **Aturan internal**

EFSA 2010: asupan air **total** (minuman + makanan) 2,5 L/hari untuk pria dan 2,0 L/hari untuk wanita.
Sekitar 20% berasal dari makanan, sehingga target **minuman**:

```
Target minum dasar = EFSA total × 0,8        → pria 2,0 L, wanita 1,6 L
Hari gym           = + 0,5 L per jam latihan  (aturan internal, sejalan panduan cairan ACSM)
```

**Contoh:** hari gym ±60 menit → 2,0 + 0,5 = **2,5 L**; hari istirahat **2,0 L**.

## 7. Kalibrasi ulang kalori · **Aturan internal**

Setiap 14 hari, bandingkan tren berat (rata-rata bergerak, lihat [04-komposisi-tubuh.md](04-komposisi-tubuh.md)) dengan target:

| Laju naik nyata per minggu | Tindakan |
|---|---|
| < 0,25% berat | Target kalori +150 kkal |
| 0,25–0,5% | Tetap |
| > 0,5% | Target kalori −150 kkal |
| Data berat < 6 titik dalam 14 hari | Tidak diubah, minta pengguna menimbang lebih rutin |

Perubahan diusulkan sebagai **saran**, bukan otomatis.

**Contoh:** berat 68,4 kg → rentang target naik 0,17–0,34 kg/minggu.

## Konstanta (`standards.ts`)

```ts
export const MIFFLIN = { weight: 10, height: 6.25, age: 5, maleOffset: 5, femaleOffset: -161 } as const;
export const ACTIVITY_FACTOR = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, extra: 1.9 } as const;
export const SURPLUS_KCAL = { min: 250, default: 300, max: 500 } as const;
export const PROTEIN_G_PER_KG = { min: 1.6, default: 2.0, max: 2.2 } as const;
export const FAT_PCT_OF_KCAL = { min: 0.2, default: 0.25, max: 0.35 } as const;
export const WATER_TOTAL_L = { male: 2.5, female: 2.0 } as const;
export const WATER_FROM_DRINKS_RATIO = 0.8;
export const WATER_EXTRA_L_PER_TRAINING_HOUR = 0.5;
export const WEIGHT_GAIN_PCT_PER_WEEK = { min: 0.0025, max: 0.005 } as const;
export const CALORIE_RECALIBRATION = { everyDays: 14, stepKcal: 150, minWeighIns: 6 } as const;
```
