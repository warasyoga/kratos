# 06 · Deload

Fungsi: `shouldDeload(ctx): DeloadDecision` dan `applyDeload(program): SessionPlan[]`
Dasar: Bell et al. 2023, lihat [05-keamanan-dan-pemulihan.md](../sains-latihan/05-keamanan-dan-pemulihan.md).

## Deload terjadwal
- Minggu ke-6 setiap mesosiklus (5 minggu progresif + 1 deload).
- Ditampilkan sejak awal minggu di layar Hari Ini dan Program: "Minggu deload: beban lebih ringan agar tubuh pulih dan siap naik lagi".

## Deload lebih awal (diusulkan, bukan otomatis)

Minimal minggu ke-4 blok, dan **salah satu** terpenuhi:

| Sinyal | Ambang |
|---|---|
| Performa turun | 1RM estimasi turun ≥ 5% pada ≥ 3 gerakan dalam 2 sesi terakhir masing-masing |
| Readiness buruk | ≥ 3 check-in kuning/merah dalam 7 hari |
| Keputusan `decrease` | ≥ 3 gerakan berbeda dalam 1 minggu |

Jika diterima: minggu ini menjadi deload, blok berikutnya dimulai minggu depan.
Implementasi: `Program.startDate` digeser sehingga minggu ini = minggu ke-6 blok (`start_deload`).
Jika diabaikan: tidak ditawarkan lagi sampai minggu depan.

## Isi minggu deload

| Parameter | Nilai |
|---|---|
| Set per gerakan | × 0,5, dibulatkan ke atas, minimal 1 |
| Beban | × 0,9, dibulatkan ke bawah ke beban yang bisa dipasang |
| Target RIR | 3–4 |
| Gerakan | sama (tidak diganti) |
| Progresi | dibekukan; setelah deload, beban kembali ke nilai sebelum deload |

## Setelah deload
- Evaluasi blok: perubahan 1RM, berat badan, ukuran, kehadiran. Ditampilkan sebagai ringkasan.
- Volume blok berikutnya boleh naik +1–2 set pada otot yang tertinggal (tetap ≤ 20).

## Contoh kasus uji

| Konteks | Hasil |
|---|---|
| Minggu 6, Bench 3×8–12 @65 | 2 set, 57,5 kg, RIR 3 |
| Minggu 3, performa turun di 4 gerakan | Tidak diusulkan (< minggu 4) |
| Minggu 4, 3 check-in merah/kuning dalam 7 hari | Diusulkan |
| Minggu 7 setelah deload | Bench kembali 65 kg, progresi berlanjut |
