# 05 · Mode Latihan

## Tujuan
Layar yang dipakai di gym: mencatat setiap set secepat mungkin sambil dibimbing trainer.

## User story
- Saya ingin tahu beban dan repetisi yang harus saya lakukan di setiap set.
- Saya ingin mencatat set dengan satu ketukan dan istirahat saya diatur otomatis.
- Saya ingin tahu pelat apa yang dipasang.
- Saya ingin tahu setelah latihan apakah beban saya naik minggu depan.

## Tampilan
1. Header: chip "Upper A · 2/6", durasi sesi berjalan, progress bar, tombol ⋯ (akhiri, lewati gerakan)
2. Nama gerakan + otot + tautan "Panduan"
3. Kartu set: target (3 × 8–12 · RIR 2), tabel **Set · Sebelumnya · kg · Reps · ✓**
   - Set pemanasan di atas, berlabel "P", warna redup
   - kg/reps terisi otomatis dari rekomendasi; ketuk untuk stepper
4. Timer istirahat (setelah ✓): angka besar, bar, −15/+15 dtk, Lewati
5. Pilihan RIR (muncul setelah ✓ set kerja): 0 · 1 · 2 · 3 · 4+
6. Kalkulator pelat (barbell) / ukuran dumbbell
7. Catatan trainer (hasil progresi/kalibrasi)
8. Tombol "Terasa sakit" (kecil, di menu ⋯) → hentikan gerakan, tawarkan pengganti
9. Navigasi gerakan: geser kiri/kanan atau tombol "Gerakan berikutnya"

**Ringkasan sesi** (setelah selesai): durasi, total set, volume (kg × reps), PR baru, perubahan beban minggu depan per gerakan, tombol "Selesai".

## Aturan
- Sesi disimpan per set; menutup aplikasi tidak menghilangkan progres. Membuka lagi → "Lanjutkan latihan".
- Timer berbasis `restEndsAt` (waktu absolut), sehingga tetap benar setelah layar mati.
- Timer habis: getaran (Android), suara pendek opsional, tampilan berkedip sekali.
- Wake Lock aktif selama sesi.
- Kalibrasi beban untuk gerakan baru mengikuti [02-kekuatan-dan-progresi.md §7](../sains-latihan/02-kekuatan-dan-progresi.md).
- 1RM estimasi dan PR dihitung saat set dicentang.
- Sesi otomatis ditandai `abandoned` jika aktif > 4 jam tanpa aktivitas; set yang tercatat tetap disimpan.

## Data
`WorkoutSession`, `SetLog`. Use case: `startSession`, `completeSet`, `updateSet`, `skipExercise`, `substituteDuringSession`, `finishSession`.

## Kriteria selesai
- [ ] Mencentang set ≤ 1 ketukan jika angka sesuai rekomendasi
- [ ] Timer tepat walau aplikasi di-background 2 menit
- [ ] Ringkasan menampilkan keputusan progresi yang sama dengan tabel uji
- [ ] Bisa dipakai dalam mode pesawat

## Kasus tepi
- Pengguna mengubah beban di tengah set → rekomendasi set berikutnya memakai beban baru.
- Dua tab/jendela terbuka → hanya satu sesi aktif (dicek di use case).
