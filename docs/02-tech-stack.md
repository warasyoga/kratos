# 02 · Tech Stack

Versi dikunci di `package-lock.json` saat setup (memakai versi stabil terbaru saat itu).
Setiap penambahan library baru harus dicatat di tabel ini beserta alasannya.

## Inti

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Bahasa | **TypeScript** (mode `strict`) | Tipe data mencegah kesalahan hitung, misalnya string `"65"` dijumlahkan dengan angka |
| UI | **React** | Ekosistem terbesar, banyak referensi untuk dipelajari |
| Build tool | **Vite** | Cepat, konfigurasi sederhana |
| PWA | **vite-plugin-pwa** (Workbox) | Service worker, offline, manifest untuk pasang ke Home Screen |
| Routing | **React Router** | Standar de facto untuk React |

## Tampilan

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Styling | **Tailwind CSS** | Mobile-first, token warna/tema dipusatkan di satu konfigurasi |
| Animasi | **Motion** (Framer Motion) | Transisi layar dan umpan balik sentuhan yang halus, mendukung `prefers-reduced-motion` |
| Grafik | **Recharts** | Grafik garis/batang yang cukup untuk progres, API deklaratif |
| Font | **@fontsource** (Barlow Condensed, Figtree) | Font ikut dibundel sehingga tetap tampil saat offline |
| Ikon | **Lucide React** | Konsisten, ringan, bisa di-tree-shake |

## Data & logika

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Database lokal | **Dexie.js** (IndexedDB) | API rapi, mendukung migrasi skema berversi, bisa menyimpan foto (Blob) |
| Pengambilan data di UI | **TanStack Query** | Cache, status loading/error, dan invalidasi setelah perubahan data tanpa kode manual |
| State UI sementara | **Zustand** | Hanya untuk state layar yang tidak perlu disimpan (mis. panel terbuka) |
| Form | **React Hook Form** + **Zod** | Validasi input dengan skema yang sama dengan validasi impor data |
| Tanggal | **date-fns** + locale `id` | Fungsi murni, mudah diuji, format Indonesia |
| Backup | **JSZip** | Ekspor data JSON + foto dalam satu file `.zip` |

## Kualitas

| Kebutuhan | Pilihan |
|---|---|
| Unit & integration test | **Vitest** + **fake-indexeddb** |
| Test komponen | **Testing Library** (React) |
| Test end-to-end | **Playwright** (alur kritis, mode mobile) |
| Lint | **ESLint** + `typescript-eslint` + `eslint-plugin-boundaries` (aturan lapisan) + `eslint-plugin-jsx-a11y` |
| Format | **Prettier** |
| Git hooks | **Husky** + **lint-staged** |

## Hosting

- **Vercel** atau **Netlify** (gratis, HTTPS otomatis, wajib untuk PWA). Detail di [10-deploy-pwa.md](10-deploy-pwa.md).

## Yang sengaja tidak dipakai

| Tidak dipakai | Alasan |
|---|---|
| Backend (Spring Boot, dsb.) | Satu pengguna, data lokal cukup. Jalur penambahan disiapkan lewat interface repository. Lihat [ADR-002](keputusan/ADR-002-local-first.md) |
| Redux | Terlalu banyak boilerplate untuk kebutuhan ini; TanStack Query + Zustand sudah cukup |
| Library komponen besar (MUI, dsb.) | Design system sendiri lebih ringan dan sesuai mockup |
| `useLiveQuery` Dexie langsung di komponen | Membuat UI bergantung pada database, melanggar aturan lapisan |
