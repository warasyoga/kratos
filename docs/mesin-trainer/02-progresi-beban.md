# 02 · Progresi Beban

Fungsi: `decideNextLoad(input): LoadDecision`
Dasar ilmiah: [02-kekuatan-dan-progresi.md](../sains-latihan/02-kekuatan-dan-progresi.md)

## Input
```ts
interface DecideNextLoadInput {
  exercise: Exercise;
  prescription: { sets: number; repMin: number; repMax: number; targetRir: number };
  currentWeightKg: number;
  lastSessions: SetLog[][];       // set kerja 2 sesi terakhir gerakan ini, terbaru dulu
  equipment: PlateInventory;
  isDeloadWeek: boolean;
}
```

## Output
```ts
type LoadDecision =
  | { kind: 'increase'; weightKg: number; targetReps: number; reason: 'all_sets_hit_top' }
  | { kind: 'hold';     weightKg: number; targetReps: number; reason: 'building_reps' }
  | { kind: 'decrease'; weightKg: number; targetReps: number; reason: 'missed_min_twice' }
  | { kind: 'deload';   weightKg: number; targetReps: number; reason: 'deload_week' };
```

## Aturan (urutan dicek dari atas)

| # | Kondisi | Keputusan |
|---|---|---|
| 0 | `progressionLocked` (kondisi kesehatan sedang) | `hold` selalu, kecuali aturan 3 (turun) tetap berlaku |
| 1 | Minggu deload | `deload`: beban × 0,9 dibulatkan, target reps = repMin |
| 2 | Sesi terakhir: semua set kerja reps ≥ repMax **dan** RIR rata-rata ≥ 1 | `increase` 1 langkah; target reps = repMin |
| 3 | 2 sesi terakhir: masing-masing ≥ 2 set dengan reps < repMin | `decrease` ke beban terbesar yang bisa dipasang ≤ beban × 0,95; target reps = repMin |
| 4 | Lainnya | `hold`; target reps = reps terendah sesi terakhir + 1, maks. repMax |

Catatan:
- Langkah naik/turun dan pembulatan: lihat tabel langkah dan kalkulator pelat.
- Jika langkah > 10% beban saat ini, aturan 2 berubah menjadi: tahan beban, target reps = repMax + 2; baru naik jika itu tercapai.
- Set tanpa RIR dianggap RIR = targetRir (tidak memblokir kenaikan).
- Sesi dengan readiness **merah** (sesi ringan) tidak dipakai untuk aturan 2 dan 3.

## Contoh kasus uji

| Beban | Target | Sesi terakhir (reps @RIR) | Keputusan |
|---|---|---|---|
| Bench 65 | 3×8–12 | 12@2, 12@2, 12@1 | increase → **67,5**, target 8 |
| Bench 65 | 3×8–12 | 12@2, 12@1, 11@0 | hold 65, target 12 |
| Bench 65 | 3×8–12 | 9@2, 8@2, 8@1 | hold 65, target **9** |
| Squat 60 | 3×6–10 | 10@2, 10@2, 10@2 | increase → **65**, target 6 |
| Bench 65 | 3×8–12 | 2 sesi: (7,6,8) dan (7,7,6) | decrease → **60**, target 8 |
| DB Lateral 6 | 2×12–15 | 15@2, 15@2 | langkah ke 8 kg = +33% > 10% → hold 6, target **17** |
| Bench 65 (deload) | – | – | deload → **57,5** (65×0,9=58,5 → dibulatkan ke bawah) |
