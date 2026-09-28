# 01 · Visi Produk

## Masalah

Pemula di gym biasanya tidak tahu:
- gerakan apa yang harus dilakukan dan berapa set/repetisi,
- kapan harus menaikkan beban,
- apakah latihannya benar-benar membuat badan berkembang,
- berapa yang harus dimakan agar otot bertambah.

Trainer pribadi menjawab semua itu, tapi mahal dan tidak selalu ada.

## Solusi

Aplikasi di HP yang berperan sebagai **trainer** sekaligus **pemantau**:

| Peran | Yang dilakukan aplikasi |
|---|---|
| Trainer | Menyusun program, menentukan beban, menaikkan/menurunkan beban, memberi saran, mengganti gerakan yang berisiko |
| Pemantau | Mencatat setiap set, berat badan, ukuran tubuh, foto, nutrisi; menampilkan grafik dan ringkasan |

## Pengguna

Satu orang: pemilik aplikasi.
- Pemula (pengalaman 0–6 bulan)
- Tujuan: menambah massa otot (hipertrofi) agar bentuk badan lebih bagus
- Ke gym 4× seminggu dengan alat lengkap, tetapi ingin membuka aplikasi setiap hari
- Mungkin punya kondisi kesehatan (mis. keluhan bahu) yang harus diperhitungkan

## Prinsip produk

1. **Tepat secara ilmiah.** Setiap angka berasal dari rumus/pedoman yang diakui dan sumbernya tercatat. Lihat [sains-latihan/](sains-latihan/README.md).
2. **Pengguna tetap memegang kendali.** Trainer memberi saran; pengguna boleh mengedit program dan menolak saran.
3. **Cepat dipakai di gym.** Mencatat satu set cukup 1–2 ketukan. Tombol besar, bisa satu tangan.
4. **Berguna setiap hari.** Hari gym berisi latihan; hari istirahat berisi pemulihan, nutrisi, dan pemantauan.
5. **Offline dan privat.** Semua data di HP. Tidak ada akun, tidak ada server.
6. **Mudah dirawat.** Kode berlapis, rumus terpisah dari tampilan, semua rumus diuji.

## Ruang lingkup

Semua fitur berikut masuk rencana (detail di [fitur/](fitur/README.md)):

| Kelompok | Fitur |
|---|---|
| Inti | Onboarding & PAR-Q+, Profil (tubuh, alat, kondisi kesehatan), Program otomatis + edit + saran, Mode latihan, Perpustakaan gerakan, Hari Ini, Check-in hari gym |
| Pemantauan | Progres (1RM, PR, volume), berat & ukuran tubuh, foto progres, peta otot |
| Pendukung | Nutrisi (kalori, protein, makro, air), pengingat, pencapaian/lencana, evaluasi bulanan, backup & ekspor |

## Di luar ruang lingkup (untuk saat ini)

- Banyak pengguna, login, sinkronisasi cloud (disiapkan jalurnya, lihat [ADR-002](keputusan/ADR-002-local-first.md))
- Deteksi postur dengan kamera
- Database makanan lengkap dengan barcode
- Integrasi jam pintar

## Ukuran keberhasilan

- Pengguna berlatih ≥ 90% dari sesi yang dijadwalkan dalam 8 minggu pertama
- Estimasi 1RM gerakan utama naik setiap bulan selama fase pemula
- Berat badan naik 0,25–0,5% per minggu (laju menambah otot yang sehat)
- Mencatat satu set rata-rata < 5 detik
