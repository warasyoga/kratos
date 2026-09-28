# Kratos

> Aplikasi trainer dan pemantau latihan gym pribadi yang dibuka lewat HP.

Kratos membantu pemula menjalankan program latihan menambah otot seperti didampingi trainer:
program dibuat otomatis, beban dinaikkan sesuai aturan progresi, dan semua latihan, tubuh,
serta nutrisi dipantau setiap hari. Semua perhitungan mengikuti pedoman internasional
(ACSM, NSCA, ISSN, WHO, EFSA) dan sumbernya dicatat.

- **Pengguna:** satu orang (pemilik aplikasi), tanpa login
- **Platform:** PWA, dipasang ke Home Screen Android/iPhone dan berjalan offline
- **Data:** tersimpan di HP (IndexedDB), bisa di-backup ke file
- **Mockup:** https://claude.ai/artifact/9qeF3ZsuGYqvtVjMsyUci6

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
