# 09 · Profil & Pengaturan

## Tujuan
Tempat mengubah semua data yang dipakai trainer, serta pengaturan aplikasi.

## Tampilan
1. Kepala: inisial, nama, ringkasan (jenis kelamin · umur · tinggi · berat)
2. Statistik: BMI + kategori, kalori/hari, protein/hari
3. **Tujuan & jadwal**: tujuan, pengalaman, hari gym, aktivitas harian, faktor protein (1,6–2,2)
4. **Alat di gym saya**: chip toggle + "+ Tambah alat"; **Pelat & dumbbell**: berat bar, daftar pelat, rentang dumbbell
5. **Kondisi kesehatan**: daftar (area, tingkat, gerakan sakit, jumlah gerakan yang diganti), tambah/edit/nonaktifkan
6. **Skrining PAR-Q+**: tanggal terakhir, status, "Isi ulang"
7. **Pengaturan**: tema (Ikuti HP/Terang/Gelap), getaran, suara timer, pengingat
8. **Data**: backup & ekspor, impor, hapus semua data (konfirmasi dua langkah di dalam halaman)
9. **Tentang**: versi, sumber ilmiah (tautan ke daftar pustaka), peringatan kesehatan

## Aturan
- Mengubah alat atau kondisi kesehatan → substitusi dijalankan, pengguna melihat ringkasan "3 gerakan diganti" sebelum disimpan.
- Mengubah hari gym → lihat aturan edit program.
- Mengubah berat/tinggi/umur/aktivitas → target nutrisi dihitung ulang.
- Satuan hanya kg (tidak ada pilihan lbs).

## Data
`UserProfile`, `HealthCondition`, `EquipmentItem`, `PlateInventory`, `Settings`.

## Kriteria selesai
- [ ] Setiap perubahan langsung tercermin di Program, Hari Ini, dan Nutrisi
- [ ] Hapus semua data benar-benar mengosongkan IndexedDB dan kembali ke onboarding
