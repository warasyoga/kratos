# 07 · Progres

## Tujuan
Membuktikan dengan data bahwa latihan berhasil: makin kuat, makin berotot, tetap konsisten.

## User story
- Saya ingin melihat kekuatan saya naik dari minggu ke minggu.
- Saya ingin tahu otot mana yang kurang dilatih.
- Saya ingin membandingkan foto dan ukuran tubuh.

## Tampilan
Segmen atas: **Kekuatan · Tubuh · Volume · Foto**, dengan pilihan rentang 4 mgg / 12 mgg / Semua.

**Kekuatan**
- Kartu PR terbaru
- Grafik 1RM estimasi gerakan utama (pilih gerakan), titik akhir ditonjolkan, perubahan (+12,3 kg)
- Daftar gerakan: 1RM saat ini, perubahan, sparkline → ketuk untuk detail (riwayat semua set)

**Tubuh**
- Grafik berat: titik timbangan harian (redup) + garis tren EMA, pita target laju naik
- Laju mingguan vs target 0,25–0,5%
- Ukuran tubuh (tabel + perubahan), estimasi % lemak (US Navy), BMI dengan catatan
- Tombol "+ Catat ukuran" (pengingat tiap 14 hari)

**Volume**
- Set per otot minggu ini vs zona 10–20 (bar dengan zona hijau)
- Total tonase per minggu (grafik batang)
- Kehadiran: sesi selesai / terjadwal

**Foto**
- Grid per tanggal & pose, tombol "+ Foto" (unggah file)
- Mode banding: pilih 2 tanggal → tampil berdampingan / geser-bandingkan

## Aturan
- Grafik memakai skala dan label dari data nyata; tanpa data → empty state yang menjelaskan cara mengisinya.
- Foto dikompres ke sisi terpanjang 1080 px JPEG kualitas 0,8 sebelum disimpan.
- Semua angka memakai rumus di [sains-latihan](../sains-latihan/README.md).

## Data
Query `getProgressSummary(range)`, `getExerciseHistory(id)`. Use case `logBodyMetric`, `addProgressPhoto`, `deleteProgressPhoto`.

## Kriteria selesai
- [ ] Grafik terbaca di terang/gelap, label tidak tumpang tindih di 360 px
- [ ] Data 1 tahun (±200 sesi) tampil < 500 ms
- [ ] Foto tidak pernah keluar dari perangkat kecuali lewat ekspor backup
