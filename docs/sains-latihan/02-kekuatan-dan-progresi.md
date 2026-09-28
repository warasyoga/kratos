# 02 · Kekuatan & Progresi

Kode: `src/domain/strength/`, `src/domain/workout/`

## 1. Estimasi 1RM · **Standar**

1RM (one-rep max) = beban maksimal untuk 1 repetisi. Pemula **tidak** diuji 1RM langsung
(berisiko); aplikasi mengestimasinya dari set biasa.

```
Epley   : 1RM = beban × (1 + reps / 30)          dipakai untuk reps 2–10
Brzycki : 1RM = beban × 36 / (37 − reps)         pembanding, tidak ditampilkan
reps = 1 → 1RM = beban
reps > 10 → tidak dihitung (akurasi turun), set tetap tercatat
```

**Contoh:** 65 kg × 8 → 65 × (1 + 8/30) = 65 × 1,2667 = **82,3 kg**
(Brzycki: 65 × 36/29 = 80,7 kg)

Yang ditampilkan per sesi: **1RM estimasi tertinggi** dari set kerja gerakan tersebut.

## 2. Rekor pribadi (PR) · **Aturan internal**

Sebuah set adalah PR jika salah satu terpenuhi, dibanding semua riwayat gerakan yang sama:
1. 1RM estimasi tertinggi, atau
2. repetisi terbanyak pada beban yang sama atau lebih berat.

Set pemanasan tidak dihitung.

## 3. Intensitas: RIR · **Bukti ilmiah**

RIR (Repetitions in Reserve) = sisa repetisi sebelum gagal. Skala Zourdos et al. 2016.

| RIR | Arti | RPE setara |
|---|---|---|
| 0 | Gagal, tidak bisa satu repetisi lagi | 10 |
| 1 | Masih bisa 1 lagi | 9 |
| 2 | Masih bisa 2 lagi | 8 |
| 3 | Masih bisa 3 lagi | 7 |
| 4+ | Terlalu ringan untuk hipertrofi | ≤ 6 |

Target default pemula: **RIR 2** (rentang 1–3). Set RIR 0 tidak dianjurkan untuk gerakan
barbell besar (squat, deadlift, bench) demi keamanan.

## 4. Set, repetisi, istirahat · **Standar** (ACSM 2009)

| Parameter | Pemula hipertrofi | Di aplikasi |
|---|---|---|
| Beban | 60–70% 1RM | Dikalibrasi dari RIR, bukan persen |
| Repetisi | 8–12 | Compound 8–12 (squat/deadlift 6–10), isolasi 10–15 |
| Set per gerakan | 1–3 | 2–3 |
| Istirahat | 1–2 menit; 2–3 menit untuk gerakan inti berat | Lihat tabel di bawah |
| Tempo | Lambat–sedang | Turun terkontrol ±2 detik |

Istirahat default (`restDuration`):

| Jenis gerakan | Istirahat |
|---|---|
| Compound barbell (squat, deadlift, bench, row) | 120 dtk |
| Compound lain (dumbbell press, pulldown, leg press) | 90 dtk |
| Isolasi | 60 dtk |

## 5. Kenaikan beban: double progression · **Standar** + **Aturan internal**

Dasar: ACSM 2009, naikkan beban **2–10%** bila pengguna bisa melakukan 1–2 repetisi di atas
target pada sesi berturut-turut.

Aturan aplikasi:
```
Jika SEMUA set kerja mencapai repMax DAN RIR rata-rata ≥ 1
   → beban naik 1 langkah, repetisi target kembali ke repMin
Jika tidak
   → beban tetap, kejar +1 repetisi per set di sesi berikutnya
Jika gagal mencapai repMin di ≥ 2 set pada 2 sesi berturut-turut
   → beban turun 1 langkah (lihat 02-progresi-beban.md di mesin-trainer)
```

Langkah kenaikan (**aturan internal**, tetap dalam rentang 2–10% ACSM):

| Jenis beban | Langkah |
|---|---|
| Barbell tubuh atas | +2,5 kg |
| Barbell tubuh bawah | +5 kg |
| Dumbbell | ke ukuran berikutnya yang tersedia (biasanya +2 kg per tangan) |
| Mesin/kabel | ke tumpukan berikutnya (default +5 kg) |

Jika langkah > 10% beban saat ini (sering pada dumbbell ringan), naikkan repetisi dulu
sampai repMax + 2 sebelum naik beban.

**Contoh:** Bench 65 kg, 3 set × 12 reps di RIR 2 → minggu depan **67,5 kg** × 8
(+2,5 kg = +3,8%, dalam rentang 2–10%).

## 6. Kalkulator pelat · **Aturan internal**

```
per sisi = (target − berat bar) / 2
isi per sisi secara greedy dari pelat terbesar yang tersedia
jika sisa ≠ 0 → bulatkan target ke bawah ke beban terdekat yang bisa dipasang
```
Pelat default: 25, 20, 15, 10, 5, 2,5, 1,25 kg. Bar 20 kg. Bisa diubah di Profil.

**Contoh:** 65 kg → per sisi 22,5 → **20 + 2,5**.
**Contoh pembulatan:** 66 kg → per sisi 23 → 20 + 2,5 = 22,5, sisa 0,5 → target dibulatkan ke **65 kg**.

## 7. Beban awal (kalibrasi) · **Aturan internal**

Pemula belum tahu bebannya. Sesi pertama tiap gerakan:
1. Mulai dengan beban ringan yang disarankan (bar kosong / dumbbell terkecil yang wajar).
2. Setelah set 1, pengguna mengisi RIR.
3. Beban set berikut disesuaikan:

| RIR set tadi (target 2) | Perubahan beban set berikutnya |
|---|---|
| ≥ 5 | +20% |
| 4 | +10% |
| 3 | +5% |
| 1–2 | tetap |
| 0 | −10% |

Beban dibulatkan dengan kalkulator pelat/ukuran dumbbell. Beban dari set terakhir yang
mencapai RIR 1–3 menjadi `currentWeightKg`.

## Konstanta

```ts
export const EPLEY_DIVISOR = 30;
export const E1RM_MAX_REPS = 10;
export const TARGET_RIR = { min: 1, default: 2, max: 3 } as const;
export const REST_SEC = { compoundBarbell: 120, compound: 90, isolation: 60 } as const;
export const PROGRESSION_PCT = { min: 0.02, max: 0.10 } as const;
export const LOAD_STEP_KG = { barbellUpper: 2.5, barbellLower: 5, machine: 5 } as const;
export const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const DEFAULT_BAR_KG = 20;
```
