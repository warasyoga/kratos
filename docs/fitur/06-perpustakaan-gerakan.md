# 06 · Perpustakaan Gerakan

## Tujuan
Mengajarkan cara melakukan setiap gerakan dengan benar, dan menjadi sumber pilihan saat mengedit program.

## User story
- Saya ingin melihat cara melakukan gerakan dan kesalahan yang harus dihindari.
- Saya ingin mencari gerakan berdasarkan otot atau alat.
- Saya ingin menambah gerakan sendiri jika gym saya punya mesin khusus.

## Tampilan
**Daftar:** kolom cari, filter chip (otot, alat, compound/isolasi), daftar gerakan dengan gambar kecil dan otot utama. Gerakan yang alatnya tidak tersedia diberi label "Alat tidak ada".

**Detail:**
1. Gambar/animasi gerakan
2. Otot utama & pendukung (diagram tubuh kecil)
3. Alat yang dibutuhkan
4. **Cara melakukan**: langkah bernomor (3–6 langkah)
5. **Kesalahan umum**: 2–4 poin
6. Catatan keamanan (jika ada area yang terbebani & kondisi pengguna)
7. Riwayat pribadi: 1RM estimasi, PR, sesi terakhir
8. Alternatif gerakan

## Isi awal (seed) ±70 gerakan
| Kelompok | Jumlah contoh |
|---|---|
| Dada | 8 (bench, incline, DB press, machine press, fly kabel, push-up, dips, …) |
| Punggung | 10 (row barbell/DB/kabel, pulldown, pull-up, face pull, …) |
| Bahu | 7 |
| Lengan | 10 |
| Kaki depan & glute | 12 |
| Paha belakang | 6 |
| Betis | 3 |
| Perut/core | 6 |
| Lainnya (landmine, trap bar, …) | 8 |

Konten ditulis ulang sendiri (bukan disalin dari situs lain) dan ditinjau terhadap panduan teknik NSCA/ACSM.
Gambar: ilustrasi sederhana buatan sendiri atau aset berlisensi bebas; dicatat sumbernya di `public/exercises/CREDITS.md`.

## Aturan
- Gerakan bawaan tidak bisa dihapus, hanya disembunyikan.
- Gerakan buatan pengguna wajib: nama, pola, otot utama, alat, jenis beban.

## Data
`Exercise` + `ExerciseGuide`. Katalog bawaan di `src/infrastructure/seed/exerciseCatalog.ts` (TypeScript, dicek
tipe saat build) berisi 61 gerakan. Test memastikan ID unik, panduan lengkap, data latihan identik dengan data uji
domain, dan setiap slot template punya pengganti. Katalog dimuat terpisah (lazy) hanya saat dipasang/diperbarui
(`CATALOG_VERSION`).

## Kriteria selesai
- [ ] Setiap gerakan bawaan punya pola, otot, alat, langkah, kesalahan umum, `stressedAreas`
- [ ] Pencarian menemukan nama Indonesia & Inggris ("dada" → Bench Press)
- [ ] Test memastikan setiap slot template punya ≥ 2 kandidat di alat lengkap
