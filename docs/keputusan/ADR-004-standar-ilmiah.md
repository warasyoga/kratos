# ADR-004 · Perhitungan Berbasis Sumber Ilmiah

- Status: Diterima
- Tanggal: 2026-09-28

## Konteks
Pengguna meminta semua perhitungan dan fungsi sesuai standar internasional agar latihan efisien.
Tidak semua aspek latihan punya "standar resmi"; sebagian hanya berdasarkan riset atau praktik pelatih.

## Keputusan
1. Setiap angka ilmiah disimpan sebagai konstanta di `domain/standards.ts` dengan komentar sumber.
2. Setiap aturan diberi label tingkat bukti: **Standar**, **Bukti ilmiah**, atau **Aturan internal** ([sains-latihan/README.md](../sains-latihan/README.md)).
3. Setiap contoh hitung di dokumen menjadi unit test.
4. Aplikasi menampilkan dasar ilmiah lewat tombol "Kenapa?" pada saran dan halaman sumber di Profil.

## Konsekuensi
- ✅ Perhitungan bisa diaudit dan dipercaya; mengubah angka cukup di satu tempat.
- ✅ Jujur terhadap pengguna tentang mana yang standar dan mana yang keputusan aplikasi.
- ⚠️ Perubahan rumus wajib memperbarui dokumen + test di commit yang sama.
