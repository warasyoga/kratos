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

| Topik | Dokumen |
|---|---|
| Visi & ruang lingkup | [docs/01-visi-produk.md](docs/01-visi-produk.md) |
| Teknologi | [docs/02-tech-stack.md](docs/02-tech-stack.md) |
| Arsitektur berlapis | [docs/03-arsitektur.md](docs/03-arsitektur.md) |
| Struktur folder | [docs/04-struktur-folder.md](docs/04-struktur-folder.md) |
| Model data | [docs/05-model-data.md](docs/05-model-data.md) |
| Design system | [docs/06-design-system.md](docs/06-design-system.md) |
| Standar kode | [docs/07-standar-kode.md](docs/07-standar-kode.md) |
| Pengujian | [docs/08-pengujian.md](docs/08-pengujian.md) |
| Roadmap | [docs/09-roadmap.md](docs/09-roadmap.md) |
| Deploy & PWA | [docs/10-deploy-pwa.md](docs/10-deploy-pwa.md) |
| Glosarium istilah | [docs/11-glosarium.md](docs/11-glosarium.md) |
| Sains latihan (rumus & sumber) | [docs/sains-latihan/](docs/sains-latihan/README.md) |
| Mesin trainer (algoritma) | [docs/mesin-trainer/](docs/mesin-trainer/README.md) |
| Spesifikasi per fitur | [docs/fitur/](docs/fitur/README.md) |
| Catatan keputusan (ADR) | [docs/keputusan/](docs/keputusan/README.md) |

## Menjalankan proyek

Bagian ini diisi setelah Tahap 1 (fondasi) selesai. Rencananya:

```bash
npm install
npm run dev        # server pengembangan
npm run test       # unit test
npm run lint       # cek kualitas kode & aturan lapisan
npm run build      # build produksi PWA
```

## Peringatan kesehatan

Kratos bukan pengganti dokter atau pelatih bersertifikat. Isi skrining PAR-Q+ sebelum mulai.
Jika ada jawaban "ya", konsultasikan dengan tenaga medis.
