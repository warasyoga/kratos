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

### Upper A
| # | Gerakan | Set × Reps | Istirahat |
|---|---|---|---|
| 1 | Barbell Bench Press | 3 × 8–12 | 120 dtk |
| 2 | Barbell Row | 3 × 8–12 | 120 dtk |
| 3 | Incline Dumbbell Press | 3 × 10–12 | 90 dtk |
| 4 | Lat Pulldown | 3 × 10–12 | 90 dtk |
| 5 | Seated Dumbbell Shoulder Press | 3 × 10–12 | 90 dtk |
| 6 | Dumbbell Lateral Raise | 2 × 12–15 | 60 dtk |

### Lower A
| # | Gerakan | Set × Reps | Istirahat |
|---|---|---|---|
| 1 | Barbell Back Squat | 3 × 6–10 | 120 dtk |
| 2 | Romanian Deadlift | 3 × 8–10 | 120 dtk |
| 3 | Leg Press | 2 × 10–12 | 90 dtk |
| 4 | Lying/Seated Leg Curl | 3 × 10–12 | 60 dtk |
| 5 | Standing Calf Raise | 3 × 10–15 | 60 dtk |
| 6 | Plank | 2 × 30–45 dtk | 60 dtk |

### Upper B
| # | Gerakan | Set × Reps | Istirahat |
|---|---|---|---|
| 1 | Seated Dumbbell Shoulder Press | 3 × 8–12 | 90 dtk |
| 2 | Seated Cable Row | 3 × 10–12 | 90 dtk |
| 3 | Machine Chest Press | 2 × 10–12 | 90 dtk |
| 4 | Assisted/Lat Pull-up | 3 × 6–10 | 120 dtk |
| 5 | Cable Curl | 2 × 12–15 | 60 dtk |
| 6 | Triceps Pushdown | 2 × 12–15 | 60 dtk |

### Lower B
| # | Gerakan | Set × Reps | Istirahat |
|---|---|---|---|
| 1 | Trap Bar / Barbell Deadlift | 3 × 5–8 | 120 dtk |
| 2 | Bulgarian Split Squat | 3 × 8–12 / kaki | 90 dtk |
| 3 | Leg Extension | 2 × 12–15 | 60 dtk |
| 4 | Barbell Hip Thrust | 3 × 8–12 | 90 dtk |
| 5 | Seated Calf Raise | 3 × 12–15 | 60 dtk |
| 6 | Cable Crunch | 2 × 12–15 | 60 dtk |

Volume dada per minggu dari template ini = 3 + 3 (Upper A) + 2 (Upper B) = **8 set**
langsung, sehingga mesin saran akan mengusulkan tambahan 2 set (sesuai contoh di mockup).
Ini disengaja sebagai contoh kasus uji; template final boleh disesuaikan saat implementasi.

## 4b. Template lain (slot)

Ditulis sebagai slot pola gerakan; gerakan konkret dipilih mesin (lihat [01-pembuatan-program.md](../mesin-trainer/01-pembuatan-program.md)).

**Full Body 3 hari (A/B/C, mis. Sen–Rab–Jum)**, 5 slot per hari:

| Slot | A | B | C |
|---|---|---|---|
| 1 | squat 3×6–10 | hinge 3×6–10 | lunge 3×8–12 |
| 2 | horizontal_push 3×8–12 | vertical_push 3×8–12 | horizontal_push (incline) 3×8–12 |
| 3 | horizontal_pull 3×8–12 | vertical_pull 3×8–12 | horizontal_pull 3×10–12 |
| 4 | knee_flexion 2×10–15 | knee_extension 2×12–15 | shoulder_abduction 2×12–15 |
| 5 | elbow_flexion 2×12–15 | elbow_extension 2×12–15 | core / calf 2×12–15 |

**5 hari: Upper · Lower · Push · Pull · Legs.** Upper/Lower seperti template 4 hari dengan set dikurangi 1 pada gerakan kedua dan ketiga; Push (horizontal_push, vertical_push, shoulder_abduction, elbow_extension), Pull (vertical_pull, horizontal_pull, rear delt, elbow_flexion), Legs (squat, hinge, knee_flexion, calf).

**6 hari: Push · Pull · Legs × 2.** Hari kedua tiap jenis memakai varian gerakan berbeda (mis. barbell → dumbbell) dan rentang repetisi lebih tinggi (10–15).

Setelah template diisi, volume dicek terhadap 10–20 set/otot; kelebihan dikurangi dari isolasi, kekurangan menjadi saran.

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
