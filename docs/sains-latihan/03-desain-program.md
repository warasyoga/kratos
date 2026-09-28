# 03 · Desain Program

Kode: `src/domain/program/`

## 1. Volume mingguan · **Bukti ilmiah**

Satuan volume = **jumlah set kerja per otot per minggu** (set dengan RIR 0–4).

| Rentang | Arti |
|---|---|
| < 10 set | Di bawah rentang efektif; tetap menghasilkan otot tetapi kurang optimal |
| **10–20 set** | Zona target (Schoenfeld et al. 2017: ≥ 10 set/minggu lebih efektif) |
| > 20 set | Di atas kebutuhan pemula, risiko sulit pulih |

Pemula memulai di **10–12 set** per otot besar, lalu naik bertahap bila pemulihan baik.

### Cara menghitung set per otot · **Aturan internal**
- Otot **utama** (`primaryMuscles`) dihitung **1 set**.
- Otot **pendukung** (`secondaryMuscles`) dihitung **0,5 set**.

Contoh: 3 set Bench Press = dada 3, trisep 1,5, bahu depan 1,5.

## 2. Frekuensi · **Bukti ilmiah**

Setiap otot dilatih **minimal 2× per minggu** (Schoenfeld et al. 2016). Otot yang sama
tidak dilatih berat pada 2 hari berturut-turut; beri jeda ≥ 48 jam (ACSM).

## 3. Pilihan split berdasarkan jumlah hari

| Hari/minggu | Split | Frekuensi/otot |
|---|---|---|
| 3 | Full Body A / B / C | 3× |
| **4** | **Upper / Lower** (A/B) | **2×** |
| 5 | Upper / Lower / Push / Pull / Legs | 2× |
| 6 | Push / Pull / Legs ×2 | 2× |

WHO 2020 merekomendasikan latihan kekuatan **≥ 2 hari/minggu**; semua opsi memenuhi.

## 4. Template Upper/Lower 4 hari (default)

Jadwal default: Sen Upper A · Sel Lower A · Kam Upper B · Jum Lower B.
Hari gym boleh diubah asal tidak ada tiga hari gym berturut-turut dengan split yang sama.

Kode sumber template: `src/domain/program/templates.ts` (sumber kebenaran; tabel di bawah ringkasannya).
Setiap slot punya gerakan pilihan berurutan; jika alat/kondisi tidak memungkinkan, mesin memakai
[substitusi](../mesin-trainer/05-substitusi-gerakan.md). Istirahat mengikuti jenis gerakan
(barbell compound 120 dtk, compound lain 90 dtk, isolasi 60 dtk).

### Upper A
| # | Gerakan | Set × Reps |
|---|---|---|
| 1 | Barbell Bench Press | 3 × 8–12 |
| 2 | Barbell Row | 3 × 8–12 |
| 3 | Incline Dumbbell Press | 3 × 10–12 |
| 4 | Lat Pulldown | 3 × 10–12 |
| 5 | Dumbbell Lateral Raise | 2 × 12–15 |
| 6 | Dumbbell Curl | 2 × 10–12 |

### Lower A
| # | Gerakan | Set × Reps |
|---|---|---|
| 1 | Barbell Back Squat | 3 × 6–10 |
| 2 | Romanian Deadlift | 3 × 8–10 |
| 3 | Leg Press | 2 × 10–12 |
| 4 | Lying Leg Curl | 3 × 10–12 |
| 5 | Standing Calf Raise | 3 × 10–15 |
| 6 | Plank | 2 × 30–45 dtk |

### Upper B
| # | Gerakan | Set × Reps |
|---|---|---|
| 1 | Seated Dumbbell Shoulder Press | 3 × 8–12 |
| 2 | Seated Cable Row | 3 × 10–12 |
| 3 | Machine Chest Press | 2 × 10–12 |
| 4 | Assisted Pull-up | 3 × 6–10 |
| 5 | Cable Fly | 2 × 12–15 |
| 6 | Face Pull | 2 × 12–15 |
| 7 | Triceps Pushdown | 2 × 12–15 |

### Lower B
| # | Gerakan | Set × Reps |
|---|---|---|
| 1 | Trap Bar Deadlift | 3 × 5–8 |
| 2 | Bulgarian Split Squat | 3 × 8–12 / kaki |
| 3 | Leg Extension | 2 × 12–15 |
| 4 | Barbell Hip Thrust | 3 × 8–12 |
| 5 | Seated Calf Raise | 3 × 12–15 |
| 6 | Cable Crunch | 2 × 12–15 |

Hasil per minggu (alat lengkap): dada 10 · punggung (lats) 12 · paha depan 11,5 · paha belakang 14,5 ·
glute 17 set; setiap otot besar 2×/minggu; dorong 13 : tarik 14.

## 4b. Template lain

| Hari | Template | Isi per hari |
|---|---|---|
| 3 | Full Body A / B / C | Tiap hari: 1 gerakan kaki utama, dorong, tarik, + 2–4 aksesori. Dada 10 · lats 10 · paha depan 10 · paha belakang 10 · glute 11 set |
| 5 | Upper · Lower · Push · Pull · Legs | Dada 11 · lats 11 · paha depan 10 · paha belakang 10 · glute 10 set |
| 6 | Push · Pull · Legs × 2 | Hari kedua memakai varian gerakan lain dan repetisi lebih tinggi (10–15). Dada 10 · lats 12 · paha depan 10 · paha belakang 11 set |

**Jaminan kualitas:** test otomatis (`generateProgram.test.ts`) memastikan setiap template dengan alat
lengkap memberi 10–20 set/minggu untuk dada, punggung, paha depan, paha belakang, dan glute; setiap otot
besar dilatih ≥ 2×/minggu; dan set tarik ≥ set dorong. Karena itu program bawaan tidak memicu saran
perbaikan. Saran baru muncul saat pengguna mengedit program atau alat/kondisi kesehatan membatasi pilihan.

## 5. Keseimbangan · **Aturan internal**

| Pasangan | Rasio set yang dijaga |
|---|---|
| Dorong (push) : Tarik (pull) tubuh atas | 1 : 1 sampai 1 : 1,5 |
| Paha depan : Paha belakang | 1 : 0,75 sampai 1 : 1 |

## 6. Mesosiklus · **Bukti ilmiah** + **Aturan internal**

- Satu blok = **6 minggu**: 5 minggu progresif + 1 minggu deload.
- Deload setiap 4–8 minggu sesuai konsensus Bell et al. 2023. Detail di [05-keamanan-dan-pemulihan.md](05-keamanan-dan-pemulihan.md).
- Volume boleh naik +1 set per otot per minggu selama blok bila readiness selalu hijau dan target reps tercapai (maks. 20 set).

## Konstanta

```ts
export const WEEKLY_SETS_PER_MUSCLE = { min: 10, beginnerStart: 10, max: 20 } as const;
export const SECONDARY_MUSCLE_SET_WEIGHT = 0.5;
export const MIN_FREQUENCY_PER_MUSCLE = 2;
export const MIN_HOURS_BETWEEN_SAME_MUSCLE = 48;
export const MESOCYCLE_WEEKS = 6;
export const PUSH_PULL_RATIO = { min: 1, max: 1.5 } as const;     // pull ÷ push
export const QUAD_HAM_RATIO = { min: 0.75, max: 1 } as const;     // ham ÷ quad
```
