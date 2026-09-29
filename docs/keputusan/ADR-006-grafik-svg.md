# ADR-006 · Grafik SVG Sendiri, Bukan Recharts

- Status: Diterima
- Tanggal: 2026-09-29

## Konteks
[02-tech-stack.md](../02-tech-stack.md) semula memilih Recharts untuk grafik progres. Saat Tahap 7
dikerjakan, kebutuhan grafik ternyata sempit: satu grafik garis (1RM estimasi, tren berat dengan
titik timbangan dan pita target), satu grafik batang (tonase mingguan), dan sparkline di daftar.
Recharts 3 membawa ±100 KB gzip tambahan (termasuk Redux Toolkit) untuk layar Progres, dan
pengukuran lebar via `ResponsiveContainer` tidak berjalan di jsdom sehingga grafik tidak bisa diuji
di test komponen.

## Keputusan
- Komponen grafik SVG sendiri di `src/shared/ui/charts` (`LineChart`, `BarChart`, `Sparkline`),
  dengan skala di `src/shared/lib/chartScale.ts` (sumbu "rapi" 1/2/2,5/5 × 10ⁿ, diuji unit).
- Warna hanya dari token tema; label sumbu x hanya di ujung (garis) atau setiap n batang agar tidak
  tumpang tindih di layar 360 px; setiap grafik punya `role="img"` dengan ringkasan nilai.
- Recharts tidak dipasang.

## Alternatif yang dipertimbangkan
| Opsi | Alasan tidak dipilih |
|---|---|
| Recharts (dimuat lazy di layar Progres) | ±100 KB gzip untuk 3 jenis grafik sederhana; sulit diuji di jsdom |
| uPlot / Chart.js | Berbasis canvas: warna tema dan aksesibilitas harus diatur manual, tetap ±40–70 KB |

## Konsekuensi
- ✅ Layar Progres ±12 KB gzip, grafik bisa diuji di test komponen lewat label aksesibelnya.
- ✅ Tampilan persis mengikuti design system (terang/gelap).
- ⚠️ Fitur interaktif (tooltip saat disentuh, zoom) harus dibuat sendiri jika dibutuhkan kelak.
