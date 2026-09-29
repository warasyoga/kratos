# Kratos

> Aplikasi trainer dan pemantau latihan gym pribadi yang dibuka lewat HP.

Kratos membantu pemula menjalankan program latihan menambah otot seperti didampingi trainer:
program dibuat otomatis, beban dinaikkan sesuai aturan progresi, dan semua latihan, tubuh,
serta nutrisi dipantau setiap hari. Semua perhitungan mengikuti pedoman internasional
(ACSM, NSCA, ISSN, WHO, EFSA) dan sumbernya dicatat.

- **Pengguna:** satu orang (pemilik aplikasi), tanpa login
- **Platform:** PWA, dipasang ke Home Screen Android/iPhone dan berjalan offline
- **Data:** tersimpan di HP (IndexedDB), bisa di-backup ke file
- **Aplikasi:** https://kratos-aris.netlify.app (versi 1.0)
- **Mockup:** https://claude.ai/artifact/9qeF3ZsuGYqvtVjMsyUci6

## Fitur (versi 1.0)

- **Onboarding & profil**: data tubuh, pengalaman, hari gym, alat di gym, kondisi kesehatan, skrining PAR-Q+.
- **Program otomatis** (Upper/Lower, PPL, Full Body) yang bisa diedit, dengan **saran trainer** berdasar
  aturan ilmiah (volume 10–20 set, frekuensi ≥ 2×, stagnasi, kehadiran, protein, tidur, kalori, deload, backup).
- **Hari Ini**: apa yang harus dilakukan hari ini, kalender minggu & streak, hari pemulihan, nutrisi, peta otot.
- **Mode latihan**: check-in kesiapan, beban otomatis (progresi ganda), pemanasan, kalkulator pelat, timer istirahat.
- **Progres**: 1RM estimasi, rekor pribadi, tren berat, ukuran & % lemak (US Navy), volume, foto, lencana, evaluasi.
- **Nutrisi**: target kalori/protein/air, catat makan & air, menu favorit, porsi referensi TKPI 2019.
- **Pengingat**: file kalender HP (.ics) dan notifikasi saat aplikasi aktif.
- **Backup**: ekspor/impor .zip (termasuk foto) dan CSV riwayat set.

## Memakai di HP

1. Buka https://kratos-aris.netlify.app di Chrome (Android) atau Safari (iPhone).
2. Pasang ke layar utama: Android → tombol **Pasang aplikasi** di Profil; iPhone → **Bagikan → Tambah ke Layar Utama**.
3. Setelah terpasang, Kratos jalan tanpa internet. Versi baru ditawarkan lewat tombol **Muat ulang**.
4. **Backup rutin** (Profil → Data & backup → Ekspor) dan simpan file .zip di Google Drive/iCloud.
   Di HP baru, pilih **Impor backup** di layar pembuka.

## Dokumentasi

Semua rancangan ada di folder [`docs/`](docs/README.md). Mulai dari sana.

| Topik                          | Dokumen                                                  |
| ------------------------------ | -------------------------------------------------------- |
| Visi & ruang lingkup           | [docs/01-visi-produk.md](docs/01-visi-produk.md)         |
| Teknologi                      | [docs/02-tech-stack.md](docs/02-tech-stack.md)           |
| Arsitektur berlapis            | [docs/03-arsitektur.md](docs/03-arsitektur.md)           |
| Struktur folder                | [docs/04-struktur-folder.md](docs/04-struktur-folder.md) |
| Model data                     | [docs/05-model-data.md](docs/05-model-data.md)           |
| Design system                  | [docs/06-design-system.md](docs/06-design-system.md)     |
| Standar kode                   | [docs/07-standar-kode.md](docs/07-standar-kode.md)       |
| Pengujian                      | [docs/08-pengujian.md](docs/08-pengujian.md)             |
| Roadmap                        | [docs/09-roadmap.md](docs/09-roadmap.md)                 |
| Deploy & PWA                   | [docs/10-deploy-pwa.md](docs/10-deploy-pwa.md)           |
| Glosarium istilah              | [docs/11-glosarium.md](docs/11-glosarium.md)             |
| Sains latihan (rumus & sumber) | [docs/sains-latihan/](docs/sains-latihan/README.md)      |
| Mesin trainer (algoritma)      | [docs/mesin-trainer/](docs/mesin-trainer/README.md)      |
| Spesifikasi per fitur          | [docs/fitur/](docs/fitur/README.md)                      |
| Catatan keputusan (ADR)        | [docs/keputusan/](docs/keputusan/README.md)              |

## Menjalankan proyek

Butuh Node.js ≥ 22 dan **npm ≥ 11**. npm 10.9 punya bug saat memasang dependensi proyek ini
(`Cannot read properties of null (reading 'edgesOut')`); perbarui dengan `npm install -g npm@latest`
atau jalankan `npx npm@11 install`.

```bash
npm install
npx playwright install chromium   # sekali saja, untuk test E2E

npm run dev          # server pengembangan (buka alamat Network dari HP di Wi-Fi yang sama)
npm run test         # unit & komponen test
npm run e2e          # test end-to-end di viewport Android & iPhone
npm run lint         # kualitas kode + aturan lapisan
npm run typecheck    # cek tipe TypeScript
npm run build        # build produksi
npm run deploy       # build + unggah ke Netlify (butuh `npx netlify-cli login` sekali)
```

Setiap commit otomatis menjalankan lint, format, test terkait, dan typecheck (Husky + lint-staged).

## Peringatan kesehatan

Kratos bukan pengganti dokter atau pelatih bersertifikat. Isi skrining PAR-Q+ sebelum mulai.
Jika ada jawaban "ya", konsultasikan dengan tenaga medis.
