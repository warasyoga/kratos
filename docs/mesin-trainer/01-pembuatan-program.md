# 01 · Pembuatan Program

Fungsi: `generateProgram(input): Program`

## Input
```ts
interface GenerateProgramInput {
  trainingDays: Weekday[];          // 3–6 hari
  experience: Experience;
  equipment: Equipment[];           // yang tersedia
  conditions: HealthCondition[];    // yang aktif
  exercises: Exercise[];            // perpustakaan
  startDate: string;
}
```

## Langkah

1. **Pilih template** dari jumlah hari (lihat [03-desain-program.md](../sains-latihan/03-desain-program.md)):
   3 → Full Body, 4 → Upper/Lower, 5 → UL/PPL, 6 → PPL×2.
2. **Petakan hari**: urutan hari template ditempatkan ke `trainingDays` pengguna.
   Validasi: tidak ada otot yang sama dilatih berat pada hari berurutan jika bisa dihindari.
   Jika tidak bisa (mis. pengguna memilih Sen–Kam berturut-turut untuk 4 hari), tetap buat
   program tetapi keluarkan saran `consecutive_same_split`.
3. **Isi slot gerakan.** Template berisi *slot* (pola gerakan + otot target), bukan gerakan pasti:
   ```ts
   { pattern: 'horizontal_push', mechanics: 'compound', preferred: ['barbell-bench-press'] }
   ```
   Untuk setiap slot, pilih gerakan pertama dari `preferred` yang lolos filter; jika tidak ada,
   pakai [substitusi](05-substitusi-gerakan.md).
4. **Filter gerakan:**
   - semua `equipment` gerakan tersedia,
   - tidak membebani area kondisi kesehatan yang aktif sesuai tingkatnya,
   - `difficulty` ≤ 2 untuk pemula.
5. **Set parameter** (sets, repMin, repMax, targetRir, restSec) dari template dan [aturan ACSM](../sains-latihan/02-kekuatan-dan-progresi.md).
6. `currentWeightKg = null` → sesi pertama menjalankan kalibrasi beban.
7. **Hitung volume mingguan** per otot dan jalankan [mesin saran](04-saran-trainer.md) sekali, agar kekurangan terlihat sejak awal.

## Output
`Program` + `ProgramDay[]` + `ProgramExercise[]` + `Suggestion[]` awal.

## Mengedit program

Pengguna boleh:
- mengubah urutan gerakan, mengganti gerakan, menambah/menghapus gerakan,
- mengubah set, rentang repetisi, istirahat,
- memindahkan hari latihan atau mengubah jumlah hari.

Aturan:
- Mengganti gerakan dengan gerakan berpola sama **mempertahankan** `currentWeightKg` hanya jika `loadType` sama; jika berbeda, beban dikalibrasi ulang.
- Mengubah **jumlah hari** membuat program baru dari template (riwayat latihan tetap). Pengguna diberi konfirmasi karena editan manual pada program lama tidak dibawa.
- Setelah setiap edit, volume dihitung ulang dan saran diperbarui.
- Validasi keras (tidak bisa disimpan): set 1–6, repMin ≤ repMax, repMax ≤ 30, istirahat 30–300 dtk.

## Contoh kasus uji

| Input | Harapan |
|---|---|
| 4 hari, alat lengkap, tanpa kondisi | Upper/Lower, 24 gerakan, Bench Press di Upper A |
| 4 hari, tanpa `barbell` | Bench Press → Dumbbell Bench Press; Squat → Leg Press/Goblet Squat |
| 4 hari, bahu kiri ringan (sakit `vertical_push`) | Shoulder Press → Landmine Press |
| 3 hari | Full Body A/B/C, setiap otot 3×/minggu |
| Hari Sen, Sel, Rab, Kam | Program dibuat + saran `consecutive_same_split` tidak muncul (Upper/Lower bergantian aman) |
