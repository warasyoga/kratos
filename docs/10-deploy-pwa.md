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

## Hosting (Netlify, tanpa GitHub)

Konfigurasi ada di `netlify.toml`: aturan aplikasi satu halaman (`/* → /index.html`), `sw.js` tidak di-cache
agar versi baru terdeteksi, dan file `/assets/*` di-cache permanen (namanya berisi hash).

Deploy dari laptop (build lokal, lalu unggah `dist`), sehingga GitHub belum diperlukan:

```bash
npx netlify-cli login     # sekali saja, membuka browser untuk login akun Netlify
npm run deploy            # build + unggah ke alamat produksi
```

Deploy pertama menanyakan nama situs; pilih nama permanen (mis. `kratos-aris` → `https://kratos-aris.netlify.app`).
**Alamat tidak boleh diganti setelah dipakai**, karena data di HP terikat ke alamat itu.
Build dilakukan di laptop, bukan di server Netlify, sehingga bug npm 10 (lihat README) tidak berpengaruh.

Setelah kode ada di GitHub (saat aplikasi selesai), Netlify bisa dihubungkan ke repository agar setiap push ke
`main` otomatis deploy. Karena tidak ada server/data di cloud, hosting hanya menyajikan file statis.

## Detail implementasi PWA

- Plugin: `vite-plugin-pwa` (Workbox), konfigurasi di `vite.config.ts`; ikon di `public/icons/` (sumber: `kratos.svg`).
- Seluruh aplikasi di-precache (±780 KB, 29 file), termasuk layar yang dimuat terpisah dan katalog gerakan.
- Font hanya subset Latin agar unduhan pertama kecil.
- `src/app/UpdatePrompt.tsx`: mendaftarkan service worker, memberi tahu "siap offline", menawarkan versi baru.
- `src/shared/lib/installPrompt.ts`: menangkap tawaran pemasangan Chrome/Android untuk tombol "Pasang aplikasi".
- Test E2E `tests/e2e/pwa.spec.ts`: manifest dan ikon valid, aplikasi terbuka dan data tampil saat offline.

## Checklist sebelum rilis

- [ ] Lighthouse: PWA installable, Performance ≥ 90, Accessibility ≥ 95
- [ ] Uji offline (mode pesawat) di Android dan iPhone
- [ ] Uji pasang ke Home Screen di kedua platform
- [ ] Uji update versi saat sesi latihan aktif (tidak boleh memuat ulang)
- [ ] Uji ekspor → hapus data → impor
