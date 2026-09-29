# 09 · Roadmap

Setiap tahap berakhir dengan aplikasi yang **bisa dijalankan dan lulus semua test**.
Centang item saat selesai. Urutan disusun agar fondasi dan rumus selesai sebelum tampilan.

## Tahap 1 · Fondasi
- [x] Inisialisasi Git dan proyek Vite + React + TypeScript (strict)
- [x] ESLint (boundaries, a11y), Prettier, Husky, lint-staged
- [x] Vitest, Testing Library, Playwright terpasang dengan satu contoh test
- [x] Alias `@/`, struktur folder sesuai [04-struktur-folder.md](04-struktur-folder.md)
- [x] Token warna & font, tema terang/gelap/ikuti HP
- [x] Komponen `shared/ui` dasar: Button, Card, Chip, Meter, Stat, TabBar
- [x] Layout 5 tab dengan layar kosong
- [x] `Result`, `Clock`, `container.ts`, `AppProviders` + `useServices`
- [x] Test E2E navigasi di viewport Android & iPhone
- **Selesai jika:** aplikasi tampil di HP dengan tab bar, lint menolak impor lintas lapisan yang dilarang

## Tahap 2 · Domain (otak trainer)
- [x] `standards.ts` lengkap dengan sumber
- [x] Nutrisi: BMR, TDEE, target kalori, makro, air
- [x] Tubuh: BMI, lemak tubuh US Navy, tren berat
- [x] Kekuatan: 1RM, deteksi PR, kalkulator pelat, pembulatan beban
- [x] Program: template (3/4/5/6 hari), pembuatan program, hitung volume mingguan
- [x] Trainer: readiness, progresi, deload, substitusi, aturan saran
- [x] Pemanasan & durasi istirahat
- [x] Perencanaan sesi (`planSession`): progresi + readiness/deload + pemanasan + tanda nyeri
- [x] 235 test, cakupan domain 98% baris
- **Selesai jika:** semua contoh di `docs/sains-latihan` dan `docs/mesin-trainer` menjadi test yang lulus

## Tahap 3 · Data & Profil
- [x] Skema Dexie v1, repository, test dengan fake-indexeddb
- [x] Perpustakaan 61 gerakan dengan panduan bahasa Indonesia
- [x] Onboarding: data tubuh, tujuan, jadwal, alat, kondisi kesehatan, PAR-Q+ (draft tersimpan jika aplikasi tertutup)
- [x] Layar Profil: edit data diri, ubah jadwal (program baru), toggle alat, kelola kondisi kesehatan, PAR-Q+
- [x] Program disesuaikan otomatis saat alat/kondisi berubah, dengan ringkasan perubahan
- [x] Layar Program (baca saja) dan Hari Ini membaca program sungguhan
- [x] Layar dimuat terpisah (lazy); JavaScript awal 179 KB gzip
- [ ] Edit inventaris pelat & dumbbell → dipindah ke Tahap 5 (dipakai kalkulator pelat)
- **Selesai jika:** onboarding menghasilkan profil tersimpan dan program pertama

## Tahap 4 · Program
- [x] Layar Program: kalender minggu, daftar gerakan per hari, volume per otot besar
- [x] Edit: ubah urutan (tombol naik/turun), ganti gerakan, ubah set/reps/RIR/istirahat, tambah/hapus gerakan, pindah hari
- [x] Kartu saran: terapkan/abaikan/"Kenapa?", jeda 14 hari setelah diabaikan
- [x] Urungkan perubahan terakhir dari toast
- [x] Perpustakaan gerakan: cari (nama/otot/alat), filter kelompok otot, status ketersediaan, detail panduan, alternatif
- [ ] Geser (drag) untuk ubah urutan → ditunda; tombol naik/turun lebih andal di layar sentuh dan keyboard
- [ ] Gerakan buatan pengguna → Tahap 8

## Tahap 5 · Mode Latihan
- [x] Check-in hari gym + hasil readiness
- [x] Sesi aktif tersimpan (tahan terhadap aplikasi ditutup)
- [x] Set pemanasan otomatis
- [x] Tabel set dengan acuan minggu lalu, input stepper, centang
- [x] Timer istirahat (berbasis `restEndsAt`), getaran, wake lock
- [x] Pilihan RIR, kalkulator pelat, catatan trainer
- [x] Edit inventaris pelat & dumbbell di Profil (dari Tahap 3)
- [x] Ringkasan akhir sesi: volume, PR, beban minggu depan
- [x] Pilih latihan hari lain; "Tetap latihan penuh" mengabaikan readiness
- [x] Sesi > 4 jam tanpa aktivitas ditutup otomatis (set tercatat tetap disimpan)
- [ ] Tombol "Terasa sakit" + ganti gerakan di tengah sesi → ditunda (sementara: tanda nyeri dari check-in + lewati gerakan)
- [ ] Suara saat timer habis → ditunda (getaran Android + tampilan "Istirahat selesai" sudah ada)

## Tahap 6 · Hari Ini
- [x] Mode hari gym vs hari pemulihan
- [x] Ringkasan nutrisi, kalender minggu, streak
- [x] Check-in & tombol latihan kontekstual (Check-in sekarang / Mulai / Lanjutkan / Lihat ringkasan)
- [x] Latihan terlewat minggu ini bisa dikerjakan hari ini
- [x] Aktivitas pemulihan (jalan kaki, mobilitas) + menit aerobik vs WHO 150 menit; saran aerobik aktif
- [x] Migrasi database pertama (v1 → v2, tabel `activityLogs`) dengan test
- [ ] Ringkasan nutrisi harian (konsumsi vs target) → Tahap 8; sementara tampil target saja

## Tahap 7 · Progres
- [x] Grafik 1RM per gerakan, daftar PR, detail riwayat gerakan
- [x] Berat badan (tren EMA + pita laju naik 0,25–0,5%/minggu) dan ukuran tubuh + estimasi lemak
- [x] Volume per otot vs zona 10–20 set, tonase mingguan, kehadiran
- [x] Foto progres (kompresi 1080 px + thumbnail, perbandingan geser/berdampingan)

## Tahap 8 · Nutrisi, Peta Otot, Pencapaian, Pengingat
- [ ] Catat makanan cepat, menu tersimpan, air minum
- [ ] Kalibrasi ulang kalori dari tren berat setiap 2 minggu
- [ ] Peta otot (status pemulihan)
- [ ] Lencana & evaluasi bulanan
- [ ] Pengingat (notifikasi + ekspor kalender .ics)

## Tahap 9 · Backup & Rilis
- [ ] Ekspor/impor `.zip` (JSON + foto) dengan validasi Zod
- [x] PWA: manifest, ikon, offline, prompt update, tombol pasang Android (dikerjakan lebih awal, setelah Tahap 3)
- [ ] Audit Lighthouse (PWA, performa ≥ 90, aksesibilitas ≥ 95)
- [ ] Deploy ke Vercel/Netlify, pasang di HP
- **Selesai jika:** semua alur E2E di [08-pengujian.md](08-pengujian.md) lulus di HP sungguhan

## Setelah rilis (opsional)
- Sinkronisasi cloud / backend (Supabase atau Spring Boot) lewat repository baru
- Tujuan lain selain hipertrofi (kekuatan, turun berat)
- Database makanan Indonesia
