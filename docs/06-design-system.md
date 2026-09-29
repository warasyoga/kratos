# 06 · Design System

Acuan visual: mockup di https://claude.ai/artifact/9qeF3ZsuGYqvtVjMsyUci6.
Semua nilai di bawah menjadi token CSS di `src/shared/styles/tokens.css` dan dipetakan ke Tailwind.
Komponen **tidak boleh** memakai warna literal (`#2455D6`), hanya token.

## Tema

Tiga mode: **Ikuti HP** (default), Terang, Gelap. Disimpan di `localStorage` (`kratos:theme`) dan dipasang oleh skrip kecil di `index.html` sebelum halaman digambar.

```css
:root { /* terang */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* gelap */ } }
:root[data-theme="dark"] { /* gelap */ }
```

## Warna

Aksen diambil dari warna pelat angkat besi standar IWF (merah 25 kg, biru 20 kg, kuning 15 kg, hijau 10 kg).

| Token | Terang | Gelap | Pemakaian |
|---|---|---|---|
| `--ground` | `#EDF0F4` | `#0A0E14` | Latar aplikasi |
| `--surface` | `#FFFFFF` | `#141A23` | Kartu, tab bar |
| `--surface-2` | `#F3F5F8` | `#1B222D` | Isian, statistik kecil |
| `--ink` | `#121821` | `#E8EDF4` | Teks utama |
| `--muted` | `#5A6574` | `#94A1B3` | Teks sekunder, label |
| `--line` | `#DCE1E8` | `#273142` | Garis pemisah, border |
| `--accent` | `#2455D6` | `#7098FF` | Tombol utama, hari gym, grafik |
| `--accent-soft` | `#E3EAFB` | `#1A2644` | Latar chip aksen |
| `--gold` / `--gold-bg` | `#8F6300` / `#FFF4D6` | `#F2C14E` / `#2A220E` | Saran trainer, PR |
| `--good` / `--good-bg` | `#1B7F48` / `#E1F4E9` | `#4CC685` / `#12291D` | Selesai, siap, zona ideal |
| `--warn` / `--warn-bg` | `#A5560A` / `#FCEBD9` | `#F0A04B` / `#2E1E0C` | Kurang dari target, kondisi kesehatan |
| `--bad` | `#B8362A` | `#F0786A` | Error, readiness merah |
| `--plate-red/blue/yellow/green` | `#D63A2F` `#2455D6` `#E9B620` `#2E9E57` | sama | Kalkulator pelat, hari lower (kuning) |

Semua pasangan teks/latar wajib lulus **WCAG 2.2 AA** (kontras ≥ 4,5:1 untuk teks biasa, ≥ 3:1 untuk teks besar dan ikon).

## Tipografi

| Peran | Font | Pemakaian |
|---|---|---|
| Display | **Barlow Condensed** 600/700, huruf kapital | Judul layar, nama latihan hari ini, angka besar (timer, beban) |
| Body | **Figtree** 400/500/600/700 | Semua teks lain |

Skala (px): 11 label · 13 kecil · 15 body · 18 · 22 · 30 judul layar · 40 angka besar · 46 timer.
Angka yang berjajar (tabel set, statistik) memakai `font-variant-numeric: tabular-nums`.
Label huruf kapital memakai `letter-spacing: .11em`.

## Ruang & bentuk

- Skala spasi kelipatan 4 px: 4, 8, 12, 16, 20, 24, 32.
- Gutter samping layar: 16 px.
- Radius: 8 (chip kecil) · 10–14 (tombol, input) · 18 (kartu) · 999 (pill).
- Bayangan hanya untuk elemen melayang (sheet, tombol Latihan di tab bar).

## Sentuhan & responsif

- Target sentuh minimum **44 × 44 px** (Apple HIG; WCAG 2.5.8 menetapkan minimum 24 px, kita pakai standar yang lebih longgar).
- Aksi utama berada di separuh bawah layar agar terjangkau jempol.
- Mobile-first: desain untuk lebar 360–430 px. Di ≥ 768 px konten dibatasi `max-width: 560px` dan dipusatkan; tab bar tetap di bawah.
- Menghormati safe area iPhone: `env(safe-area-inset-*)` pada tab bar dan header.
- Respons sentuhan < 100 ms: tombol berubah status seketika (optimistic UI), penyimpanan berjalan di belakang.

## Anggaran kinerja

| Ukuran | Batas |
|---|---|
| JavaScript awal (gzip) | ≤ 200 KB, dihitung dari **semua** skrip yang dimuat `index.html` (file utama + chunk preload); layar selain Hari Ini dimuat terpisah. Tahap 6: 195 KB; Tahap 7 (setelah pindah ke `zod/mini`, grafik SVG sendiri): 188 KB, layar Progres 8 KB terpisah; Tahap 8: 198 KB setelah teks layar lazy dipisah dari `id.ts` ke `src/shared/i18n/{progress,library,workout,profile,onboarding}.ts` |
| Tampil pertama di HP menengah | ≤ 1,5 dtk (dari cache offline ≤ 0,5 dtk) |
| Lighthouse (HP simulasi, kunjungan pertama) | Tahap 9: aksesibilitas 100, best practices 100, SEO 100, performa ±80 (FCP ±2,2 dtk, LCP ±3,3 dtk). Target performa 90 **belum** tercapai: hambatan utama adalah eksekusi JS awal (±1,6 dtk pada CPU simulasi 4× lebih lambat), terutama React DOM, React Router, dan Dexie. Sudah dilakukan: layar pembuka di `index.html`, katalog gerakan dipasang tanpa menahan tampilan. Opsi berikutnya (butuh keputusan): Preact, router lebih ringan |
| Respons sentuhan (INP) | ≤ 200 ms |
| Gambar gerakan | WebP, ≤ 60 KB per gambar |

## Gerak & umpan balik

- Transisi layar 200–250 ms, ease-out. Nonaktif jika `prefers-reduced-motion: reduce`.
- Getaran (`navigator.vibrate`) saat set dicentang dan timer habis. **Tidak didukung di iPhone**, jadi selalu disertai perubahan visual dan suara opsional.
- Layar tetap menyala selama sesi latihan (Screen Wake Lock API, abaikan jika ditolak).

## Komponen dasar (`src/shared/ui`)

| Komponen | Varian | Catatan |
|---|---|---|
| `Button` | primary, ghost, small | Status loading & disabled |
| `Card` | default | Satu-satunya pemilik border + radius 18 |
| `Chip` | neutral, accent, good, warn | Status singkat |
| `Meter` | – | Label + nilai + bar progres |
| `Stat` | – | Angka besar + label kecil |
| `Stepper` | – | Input angka dengan tombol − / + (beban, reps) |
| `SegmentedControl` | – | Pilihan 2–5 opsi (RIR, tema) |
| `Sheet` | bottom | Panel dari bawah untuk form singkat |
| `TabBar` | – | 5 tab; tombol Latihan menonjol di tengah |
| `EmptyState` | – | Ilustrasi + kalimat + aksi |
| `Toast` | – | Konfirmasi singkat di **atas** layar (tidak menutupi timer, tab bar, atau tombol panel); bisa membawa tombol aksi ("Urungkan") |
| `Stepper` | – | Tombol −/+ 44 px; langkah khusus (mis. ke beban yang bisa dipasang) dan format koma |

## Aksesibilitas

- Semua kontrol punya label yang bisa dibaca screen reader.
- Fokus keyboard terlihat (outline 2 px aksen).
- Status tidak hanya dibedakan warna: chip memakai teks ("Siap penuh"), grafik memakai penanda.
- Dicek otomatis dengan `eslint-plugin-jsx-a11y` dan axe di test Playwright.

## Penulisan teks

- Bahasa Indonesia sehari-hari yang jelas, kalimat aktif, pendek.
- Tombol menyebut hasilnya: "Mulai latihan", "Simpan set", "Terapkan saran".
- Istilah gym yang umum dipakai tetap dalam bahasa Inggris (set, reps, bench press), dijelaskan di panduan saat pertama kali muncul.
- Semua teks disimpan di `src/shared/i18n/id.ts`.
