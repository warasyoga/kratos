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

## Implementasi (Tahap 5)
- Saat sesi dimulai, rencana tiap gerakan disalin ke sesi (`SessionExercisePlan`) dan semua set (pemanasan + kerja)
  dibuat sebagai rencana; mencentang = mengisi `completedAt`. Set yang tidak dicentang dihapus saat sesi selesai.
- Beban sesi = keputusan progresi (`decideNextLoad` dari 2 sesi terakhir) → penyesuaian deload/readiness → pemanasan.
- Gerakan tanpa beban tersimpan memulai **kalibrasi**: beban awal aman, lalu RIR tiap set menyesuaikan set berikutnya.
- Mengubah beban satu set kerja (lewat panel atau saat mencentang) ikut mengubah set kerja berikutnya yang belum dikerjakan.
- Skala RIR 0–5 (tombol "5+"); 5 dipakai kalibrasi (+20%).
- Selesai: beban kerja (beban paling sering di set kerja) disimpan ke program, kecuali sesi ringan/deload.
  Ringkasan menyimpan durasi, set, tonase, rekor pribadi, dan beban sesi berikutnya.
- Timer & jam di UI membaca `services.clock` yang sama dengan use case.
- Sesi > 4 jam tanpa aktivitas ditandai `abandoned`; set yang sudah dicentang tetap tersimpan.

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
