# 09 · Roadmap

Setiap tahap berakhir dengan aplikasi yang **bisa dijalankan dan lulus semua test**.
Centang item saat selesai. Urutan disusun agar fondasi dan rumus selesai sebelum tampilan.

## Tahap 1 · Fondasi
- [ ] Inisialisasi Git dan proyek Vite + React + TypeScript (strict)
- [ ] ESLint (boundaries, a11y), Prettier, Husky, lint-staged
- [ ] Vitest, Testing Library, Playwright terpasang dengan satu contoh test
- [ ] Alias `@/`, struktur folder sesuai [04-struktur-folder.md](04-struktur-folder.md)
- [ ] Token warna & font, tema terang/gelap/ikuti HP
- [ ] Komponen `shared/ui` dasar: Button, Card, Chip, Meter, Stat, TabBar
- [ ] Layout 5 tab dengan layar kosong
- [ ] `Result`, `Clock`, `container.ts`, `ServicesProvider`
- **Selesai jika:** aplikasi tampil di HP dengan tab bar, lint menolak impor lintas lapisan yang dilarang

## Tahap 2 · Domain (otak trainer)
- [ ] `standards.ts` lengkap dengan sumber
- [ ] Nutrisi: BMR, TDEE, target kalori, makro, air
- [ ] Tubuh: BMI, lemak tubuh US Navy, tren berat
- [ ] Kekuatan: 1RM, deteksi PR, kalkulator pelat, pembulatan beban
- [ ] Program: template (3/4/5/6 hari), pembuatan program, hitung volume mingguan
- [ ] Trainer: readiness, progresi, deload, substitusi, aturan saran
- [ ] Pemanasan & durasi istirahat
- **Selesai jika:** semua contoh di `docs/sains-latihan` dan `docs/mesin-trainer` menjadi test yang lulus

## Tahap 3 · Data & Profil
- [ ] Skema Dexie v1, repository, mapper, test dengan fake-indexeddb
- [ ] Seed perpustakaan gerakan (±70 gerakan)
- [ ] Onboarding: data tubuh, tujuan, jadwal, alat, kondisi kesehatan, PAR-Q+
- [ ] Layar Profil: edit semua data, toggle alat, kelola kondisi kesehatan
- **Selesai jika:** onboarding menghasilkan profil tersimpan dan program pertama

## Tahap 4 · Program
- [ ] Layar Program: kalender minggu, daftar gerakan per hari
- [ ] Edit: ubah urutan (drag), ganti gerakan, ubah set/reps, tambah/hapus gerakan, pindah hari
- [ ] Kartu saran: terapkan/abaikan
- [ ] Perpustakaan gerakan + detail panduan

## Tahap 5 · Mode Latihan
- [ ] Check-in hari gym + hasil readiness
- [ ] Sesi aktif tersimpan (tahan terhadap aplikasi ditutup)
- [ ] Set pemanasan otomatis
- [ ] Tabel set dengan acuan minggu lalu, input stepper, centang
- [ ] Timer istirahat (berbasis `restEndsAt`), getaran, wake lock
- [ ] Pilihan RIR, kalkulator pelat, catatan trainer
- [ ] Ringkasan akhir sesi: volume, PR, beban minggu depan

## Tahap 6 · Hari Ini
- [ ] Mode hari gym vs hari pemulihan
- [ ] Ringkasan nutrisi, kalender minggu, streak

## Tahap 7 · Progres
- [ ] Grafik 1RM per gerakan, daftar PR
- [ ] Berat badan (tren rata-rata 7 hari) dan ukuran tubuh + estimasi lemak
- [ ] Volume per otot vs zona 10–20 set
- [ ] Foto progres (kompresi, perbandingan sebelum/sesudah)

## Tahap 8 · Nutrisi, Peta Otot, Pencapaian, Pengingat
- [ ] Catat makanan cepat, menu tersimpan, air minum
- [ ] Kalibrasi ulang kalori dari tren berat setiap 2 minggu
- [ ] Peta otot (status pemulihan)
- [ ] Lencana & evaluasi bulanan
- [ ] Pengingat (notifikasi + ekspor kalender .ics)

## Tahap 9 · Backup & Rilis
- [ ] Ekspor/impor `.zip` (JSON + foto) dengan validasi Zod
- [ ] PWA: manifest, ikon, offline, prompt update
- [ ] Audit Lighthouse (PWA, performa ≥ 90, aksesibilitas ≥ 95)
- [ ] Deploy ke Vercel/Netlify, pasang di HP
- **Selesai jika:** semua alur E2E di [08-pengujian.md](08-pengujian.md) lulus di HP sungguhan

## Setelah rilis (opsional)
- Sinkronisasi cloud / backend (Supabase atau Spring Boot) lewat repository baru
- Tujuan lain selain hipertrofi (kekuatan, turun berat)
- Database makanan Indonesia
