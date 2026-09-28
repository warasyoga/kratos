# 03 · Check-in Hari Gym

## Tujuan
Menilai kesiapan tubuh sebelum latihan agar beban hari itu tepat. Hanya muncul di hari gym.

## User story
- Sebelum latihan, saya ingin mengisi kondisi saya dalam ±10 detik.
- Jika saya kurang tidur, saya ingin latihan hari itu disesuaikan otomatis.

## Tampilan (bottom sheet)
1. Tidur semalam: stepper jam (default 7, langkah 0,5)
2. Pegal otot: 5 pilihan dengan ikon wajah + teks
3. Energi: 5 pilihan
4. "Ada nyeri tajam hari ini?" Tidak / Ya → pilih area
5. Berat badan (opsional): stepper kg, default nilai terakhir, catatan "timbang pagi hari"
6. Tombol "Simpan" → hasil: chip Hijau/Kuning/Merah + penjelasan + perubahan sesi
7. Jika Merah: pilihan "Sesi ringan" / "Pindah ke besok" / "Tetap latihan penuh"

## Aturan
Lihat [03-autoregulasi-checkin.md](../mesin-trainer/03-autoregulasi-checkin.md).
- Satu check-in per tanggal (`logDate` unik); mengisi ulang menimpa.
- Check-in boleh dilewati; sesi berjalan sebagai Hijau dan dicatat "tanpa check-in".
- Berat badan dari check-in juga disimpan sebagai `BodyMetric`.

## Data
`CheckIn`, `BodyMetric`. Use case `submitCheckIn`.

## Kriteria selesai
- [ ] Bisa diselesaikan dalam ≤ 6 ketukan jika kondisi normal
- [ ] Semua kasus di tabel uji autoregulasi lulus
- [ ] Sesi yang dimulai memakai penyesuaian readiness

## Kasus tepi
- Check-in diisi setelah sesi dimulai → penyesuaian hanya berlaku untuk set yang belum dikerjakan.
