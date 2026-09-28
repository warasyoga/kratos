# 10 · Deploy & PWA

## Syarat PWA

| Syarat | Cara |
|---|---|
| HTTPS | Otomatis di Vercel/Netlify |
| Web App Manifest | Dibuat `vite-plugin-pwa`: nama, ikon 192/512/maskable, `display: standalone`, `theme_color`, `background_color` |
| Service worker | Workbox dari `vite-plugin-pwa`, strategi *precache* semua aset aplikasi |
| Offline | Seluruh aplikasi, font, dan gambar gerakan di-precache. Data ada di IndexedDB |

## Strategi update

- `registerType: 'prompt'`: saat versi baru tersedia, muncul toast "Versi baru tersedia · Muat ulang".
- **Tidak** memuat ulang otomatis saat sesi latihan aktif.
- Nomor versi aplikasi tampil di Profil → Tentang.

## Memasang di HP

**Android (Chrome):** buka URL → menu ⋮ → *Instal aplikasi* / *Tambahkan ke layar utama*.
Aplikasi juga menampilkan tombol pasang sendiri (event `beforeinstallprompt`).

**iPhone (Safari):** buka URL → tombol Bagikan → *Tambah ke Layar Utama*.
iOS tidak punya prompt otomatis, jadi onboarding menampilkan panduan bergambar.

## Keterbatasan platform yang harus diketahui

| Fitur | Android (Chrome) | iPhone (Safari) |
|---|---|---|
| Offline | ✅ | ✅ |
| Getaran | ✅ | ❌ (diganti umpan balik visual) |
| Notifikasi | ✅ saat terpasang | ✅ hanya jika dipasang ke Home Screen (iOS 16.4+) |
| Notifikasi terjadwal saat aplikasi tertutup | ⚠️ Terbatas tanpa server push | ⚠️ Terbatas tanpa server push |
| Data aman jika lama tidak dibuka | ✅ dengan `storage.persist()` | ✅ jika dipasang; ❌ di tab Safari biasa (dihapus setelah 7 hari) |
| Layar tetap menyala | ✅ Wake Lock | ✅ Wake Lock (iOS 16.4+) |

Karena notifikasi terjadwal tanpa server tidak andal, pengingat utama memakai **ekspor jadwal
ke kalender HP (.ics)**. Lihat [ADR-005](keputusan/ADR-005-pengingat.md).

## Hosting

1. Push repository ke GitHub.
2. Hubungkan ke Vercel/Netlify: build command `npm run build`, output `dist`.
3. Setiap push ke `main` otomatis deploy; branch lain mendapat URL pratinjau.
4. Karena tidak ada server/data di cloud, hosting hanya menyajikan file statis.

## Checklist sebelum rilis

- [ ] Lighthouse: PWA installable, Performance ≥ 90, Accessibility ≥ 95
- [ ] Uji offline (mode pesawat) di Android dan iPhone
- [ ] Uji pasang ke Home Screen di kedua platform
- [ ] Uji update versi saat sesi latihan aktif (tidak boleh memuat ulang)
- [ ] Uji ekspor → hapus data → impor
