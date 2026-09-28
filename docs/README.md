# Dokumentasi Kratos

Dokumen dipecah per topik agar mudah dicari dan diperbarui. Setiap perubahan besar pada kode
harus diikuti perubahan pada dokumen terkait di commit yang sama.

## Urutan baca yang disarankan

1. [Visi produk](01-visi-produk.md): apa yang dibangun dan untuk siapa
2. [Tech stack](02-tech-stack.md): teknologi dan alasannya
3. [Arsitektur](03-arsitektur.md): lapisan dan aturan ketergantungan
4. [Struktur folder](04-struktur-folder.md): letak setiap jenis kode
5. [Model data](05-model-data.md): entitas dan skema database
6. [Design system](06-design-system.md): warna, huruf, komponen
7. [Standar kode](07-standar-kode.md): konvensi penulisan
8. [Pengujian](08-pengujian.md): strategi test
9. [Roadmap](09-roadmap.md): urutan pengerjaan dan checklist
10. [Deploy & PWA](10-deploy-pwa.md): pemasangan ke HP dan hosting
11. [Glosarium](11-glosarium.md): arti istilah gym dan teknis

## Folder detail

| Folder | Isi |
|---|---|
| [sains-latihan/](sains-latihan/README.md) | Rumus dan pedoman ilmiah, lengkap dengan sumber dan contoh hitung. Menjadi acuan unit test |
| [mesin-trainer/](mesin-trainer/README.md) | Algoritma "otak trainer": pembuatan program, progresi, autoregulasi, saran, substitusi |
| [fitur/](fitur/README.md) | Spesifikasi setiap fitur: user story, tampilan, aturan, kriteria selesai |
| [keputusan/](keputusan/README.md) | Architecture Decision Records: alasan di balik keputusan penting |

## Konvensi dokumen

- Bahasa dokumen: Indonesia. Nama kode (fungsi, file, variabel): Inggris.
- Angka dalam rumus dan kode memakai titik desimal (`68.4`). Angka yang tampil di aplikasi memakai format Indonesia (`68,4`).
- Setiap rumus wajib mencantumkan sumber. Aturan buatan sendiri (bukan standar) wajib diberi label **Aturan internal**.
- Profil contoh yang dipakai di semua dokumen: pria, 24 tahun, 175 cm, 68,4 kg, aktivitas sedang, latihan 4×/minggu.
