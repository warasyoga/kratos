# ADR-001 · PWA dengan React + TypeScript

- Status: Diterima
- Tanggal: 2026-09-28

## Konteks
Aplikasi harus dibuka lewat HP, dipakai satu orang, bisa offline di gym, dan dikembangkan
oleh pemula dengan biaya rendah.

## Keputusan
Membangun **Progressive Web App** dengan React + TypeScript + Vite, dipasang lewat
"Add to Home Screen".

## Alternatif yang dipertimbangkan
| Opsi | Alasan tidak dipilih |
|---|---|
| Flutter / React Native | Butuh build per platform, akun developer, proses rilis di toko aplikasi |
| Kotlin/Swift native | Dua basis kode |
| Spring Boot + web | Spring Boot hanya backend; tetap butuh frontend. Lihat ADR-002 |

## Konsekuensi
- ✅ Satu basis kode untuk Android, iPhone, laptop; hosting gratis; update instan.
- ⚠️ Keterbatasan API di iPhone (getaran, notifikasi terjadwal). Ditangani lewat desain alternatif (ADR-005).
- ⚠️ Pengguna harus memasang ke Home Screen agar data aman di Safari. Onboarding wajib memandu.
