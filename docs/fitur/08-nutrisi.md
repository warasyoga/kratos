# 08 · Nutrisi

## Tujuan
Memastikan asupan kalori dan protein cukup untuk menambah otot, dengan pencatatan yang cepat.

## User story
- Saya ingin tahu target kalori dan protein harian saya.
- Saya ingin mencatat makan dengan cepat tanpa mencari database makanan.
- Saya ingin mencatat air minum dengan satu ketukan.

## Tampilan
1. Ringkasan hari ini: kalori, protein, lemak, karbohidrat (meter), air (gelas)
2. Tombol cepat air: +250 ml, +500 ml
3. Daftar makan hari ini (bisa diedit/hapus)
4. "+ Catat makan" → sheet: nama, kkal, protein (wajib); karbo, lemak (opsional); "Simpan sebagai menu favorit"
5. Menu favorit: ketuk sekali untuk mencatat ulang (mis. "Dada ayam 150 g + nasi")
6. Daftar referensi porsi umum Indonesia (nasi putih, telur, tempe, dada ayam, susu, …) dengan nilai gizi per porsi, sumber: Tabel Komposisi Pangan Indonesia (TKPI) Kemenkes
7. Riwayat 7 hari: rata-rata kalori & protein vs target

## Aturan
Target dari [01-nutrisi.md](../sains-latihan/01-nutrisi.md):
- Target air berbeda hari gym vs pemulihan.
- Target dihitung ulang saat berat badan (tren) berubah ≥ 1 kg atau profil berubah.
- Kalibrasi kalori 14 hari muncul sebagai saran.

## Data
`NutritionLog`, `WaterLog`, `SavedMeal`. Use case `logFood`, `logWater`, `saveMeal`, `getDailyNutrition`.

## Kriteria selesai
- [ ] Mencatat menu favorit ≤ 2 ketukan
- [ ] Angka target sama dengan contoh dokumen untuk profil contoh
- [ ] Nilai porsi referensi mencantumkan sumber TKPI

## Kasus tepi
- Makan dicatat lewat tengah malam → masuk ke tanggal lokal saat dicatat; bisa diubah tanggalnya.
