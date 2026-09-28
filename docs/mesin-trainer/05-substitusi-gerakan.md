# 05 · Substitusi Gerakan

Fungsi: `findSubstitutes(exercise, ctx): RankedExercise[]`

Dipakai saat: alat tidak tersedia, kondisi kesehatan, pengguna menekan "Ganti", stagnasi, atau nyeri saat latihan.

## Syarat kandidat (wajib semua)
1. `pattern` sama dengan gerakan asal (mis. `vertical_push`).
2. Semua `equipment` kandidat tersedia.
3. Tidak membebani area kondisi kesehatan aktif sesuai tingkatnya (sejalan dengan [tabel kondisi kesehatan](../sains-latihan/05-keamanan-dan-pemulihan.md)):
   - **ringan:** tolak kandidat yang pola gerakannya ada di `painfulMovements`,
   - **sedang:** sama dengan ringan; kandidat yang `stressedAreas`-nya berisi area itu tetap boleh, tetapi diberi `progressionLocked: true` (beban tidak naik otomatis),
   - **berat:** tolak semua kandidat yang `stressedAreas`-nya berisi area tersebut.
4. `difficulty` ≤ tingkat pengalaman (pemula ≤ 2).

## Skor peringkat (**aturan internal**)

```
skor = 3 × (jumlah primaryMuscles yang sama)
     − 2 × (jumlah primaryMuscles kandidat yang tidak ada di gerakan asal)
     + 1 × (jumlah secondaryMuscles yang sama)
     + 2 jika mechanics sama
     + 1 jika loadType sama
     − 1 × difficulty
```

Urutkan skor tertinggi; seri dipecah dengan nama (agar deterministik). Tampilkan 5 teratas.

## Jika tidak ada kandidat

1. Longgarkan syarat 1: cari gerakan dengan `primaryMuscles` sama walau pola berbeda.
2. Jika tetap kosong: hapus slot dari hari itu dan keluarkan saran `low_weekly_volume` untuk otot terkait.

## Pencatatan
`ProgramExercise.substitutedFrom` dan `substitutionReason` diisi, sehingga layar Program bisa
menampilkan "pengganti Overhead Press (bahu kiri)". Jika kondisi kesehatan dinonaktifkan atau
alat kembali tersedia, aplikasi menawarkan kembali ke gerakan asal.

## Contoh kasus uji

| Asal | Konteks | Pengganti teratas |
|---|---|---|
| Seated Dumbbell Shoulder Press | Bahu kiri ringan, `vertical_push` sakit | semua pola `vertical_push` ditolak → longgarkan → Landmine Press (Incline Press kalah skor karena melatih dada sebagai otot utama tambahan) |
| Barbell Bench Press | Tanpa barbell | Dumbbell Bench Press |
| Barbell Back Squat | Tanpa squat rack | Goblet Squat / Leg Press |
| Barbell Back Squat | Lutut kanan sedang, `squat` sakit | Pola `squat` (termasuk Leg Press) ditolak → longgarkan ke otot utama yang sama → Bulgarian Split Squat dengan `progressionLocked` |
| Barbell Back Squat | Lutut kanan berat | Semua gerakan yang membebani lutut ditolak → slot dihapus + saran konsultasi fisioterapis |
| Lat Pulldown | Tanpa mesin pulldown | Assisted Pull-up (Pull-up tingkat kesulitan 3, tidak untuk pemula) |
