# ADR-003 · Arsitektur Berlapis yang Ditegakkan Lint

- Status: Diterima
- Tanggal: 2026-09-28

## Konteks
Prioritas utama pengguna: kode mudah dirawat, mudah dibaca, mengikuti best practice, dan
alur lapisannya jelas. Aplikasi memiliki banyak logika (rumus, mesin trainer) yang harus benar.

## Keputusan
- Empat lapisan: domain, application, infrastructure, UI (features + shared), dirakit di `app/`.
- Ketergantungan hanya ke arah domain. Detail di [03-arsitektur.md](../03-arsitektur.md).
- Aturan ditegakkan `eslint-plugin-boundaries`; pelanggaran menggagalkan lint dan commit.
- DI sederhana: fungsi pabrik + React Context, tanpa framework DI.

## Alternatif yang dipertimbangkan
| Opsi | Alasan tidak dipilih |
|---|---|
| Struktur React biasa (components/, hooks/, utils/) | Logika tersebar di komponen, sulit diuji, sulit dicari |
| Clean Architecture penuh (entity, use case class, presenter, gateway) | Terlalu banyak boilerplate untuk aplikasi satu orang |
| Feature-Sliced Design | Bagus, tetapi istilahnya lebih asing untuk pemula; lapisan domain eksplisit lebih mudah dijelaskan |

## Konsekuensi
- ✅ Rumus bisa diuji tanpa browser; ganti database/tampilan tanpa menyentuh logika.
- ✅ Letak setiap kode bisa ditebak.
- ⚠️ Sedikit kode tambahan (interface repository, mapper). Diterima demi keterbacaan.
