# 03 · Autoregulasi dari Check-in

Fungsi: `assessReadiness(checkIn): Readiness` lalu `adjustSession(day, readiness): SessionPlan`
Label: **Aturan internal** berdasarkan prinsip autoregulasi (Helms et al. 2016; Zourdos et al. 2016).
Tidak ada standar internasional untuk skor kesiapan; ambang di bawah ditetapkan sendiri dan bisa diubah.

## Input check-in (hari gym, sebelum latihan)

| Field | Nilai |
|---|---|
| Tidur semalam | 0–12 jam (langkah 0,5) |
| Pegal otot | 1 (tidak) – 5 (sangat) |
| Energi | 1 (sangat lelah) – 5 (sangat bertenaga) |
| Nyeri tajam hari ini | daftar area tubuh (boleh kosong) |
| Berat badan | opsional, kg |

## Penilaian

| Status | Syarat (salah satu) |
|---|---|
| 🔴 **Merah** | pegal = 5 · energi = 1 · tidur < 4 jam |
| 🟡 **Kuning** | pegal = 4 · energi = 2 · tidur < 6 jam |
| 🟢 **Hijau** | selain di atas |

Nyeri tajam dinilai terpisah (lihat bawah) dan tidak mengubah warna.

## Penyesuaian sesi

| Status | Penyesuaian | Teks ke pengguna |
|---|---|---|
| Hijau | Tidak ada | "Siap latihan penuh. Beban sesuai rencana." |
| Kuning | Tiap gerakan −1 set (min. 2), target RIR +1 | "Pemulihan belum maksimal. Volume dikurangi sedikit." |
| Merah | Set −50% (min. 1), beban −10%, target RIR 3–4; tawarkan opsi pindah hari | "Tubuh butuh pemulihan. Sesi ringan disarankan, atau pindahkan latihan ke besok." |

Pengguna selalu bisa memilih **"Tetap latihan penuh"**. Pilihan ini dicatat.

## Nyeri tajam

Untuk setiap area di `painAreas`:
- gerakan dengan `stressedAreas` berisi area itu → ditandai dan ditawarkan pengganti (lihat [substitusi](05-substitusi-gerakan.md)),
- jika area yang sama dilaporkan pada **3 check-in berturut-turut**, muncul saran menambah kondisi kesehatan di Profil dan anjuran konsultasi.

## Contoh kasus uji

| Tidur | Pegal | Energi | Nyeri | Hasil |
|---|---|---|---|---|
| 7 | 2 | 4 | – | Hijau, tanpa perubahan |
| 5,5 | 2 | 4 | – | Kuning: Bench 3 set → 2 set, RIR 3 |
| 7 | 4 | 3 | – | Kuning |
| 7 | 5 | 4 | – | Merah: Bench 3 → 2 set (50% dibulatkan ke atas), 65 → 57,5 kg |
| 3,5 | 1 | 5 | – | Merah |
| 7 | 2 | 4 | bahu kiri | Hijau + Shoulder Press ditandai, tawarkan pengganti |
