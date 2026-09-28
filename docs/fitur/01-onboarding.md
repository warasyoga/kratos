# 01 · Onboarding & PAR-Q+

## Tujuan
Mengumpulkan data minimum agar trainer bisa menyusun program pertama, dalam ≤ 3 menit.

## User story
- Sebagai pemula, saya ingin menjawab beberapa pertanyaan sederhana lalu langsung mendapat program yang sesuai.
- Sebagai pengguna dengan keluhan bahu, saya ingin program otomatis menghindari gerakan yang menyakitkan.

## Tampilan (langkah bertahap, satu pertanyaan per layar, progress bar di atas)
1. **Sambutan**: penjelasan singkat + tombol "Mulai"
2. **Data diri**: nama panggilan, jenis kelamin, tanggal lahir, tinggi (cm), berat (kg)
3. **Pengalaman**: "Belum pernah / < 6 bulan / > 6 bulan"
4. **Aktivitas harian di luar gym**: 5 pilihan dengan contoh sehari-hari
5. **Jadwal**: pilih hari gym (chip Sen–Min), default 4 hari
6. **Alat**: checklist alat, default "gym lengkap" tercentang semua
7. **Kondisi kesehatan**: "Ada bagian tubuh yang sakit/cedera?" → Tidak / Ya (pilih area, tingkat, gerakan yang sakit)
8. **PAR-Q+**: 7 pertanyaan ya/tidak
9. **Ringkasan**: target kalori, protein, program yang dibuat → "Lihat program"
10. **Pasang aplikasi**: panduan Add to Home Screen (Android/iPhone), bisa dilewati

## Aturan
- Validasi: tinggi 120–230 cm, berat 30–250 kg, umur 16–80 tahun.
- Umur < 18: tampilkan anjuran pendampingan orang dewasa/pelatih.
- PAR-Q+ ada "ya": tampilkan anjuran konsultasi, tetap boleh lanjut, catat `parqAllNo = false`.
- Setelah selesai: panggil `navigator.storage.persist()`.
- Tombol "Kembali" di setiap langkah; jawaban tersimpan sementara jika aplikasi ditutup.

## Implementasi
Onboarding berada di `src/features/profile/onboarding/` (berbagi form dengan layar Profil). Jawaban sementara
disimpan di `localStorage` (`kratos:onboarding-draft`) dan dihapus setelah selesai. Program mulai dari Senin minggu berjalan.

## Data
`UserProfile`, `HealthCondition[]`, `EquipmentItem[]`, `Program` pertama.
Use case: `completeOnboarding`.

## Kriteria selesai
- [ ] Semua langkah bisa diisi dengan satu tangan di layar 360 px
- [ ] Program terbentuk sesuai hari, alat, dan kondisi
- [ ] Ringkasan menampilkan angka yang sama dengan rumus di [01-nutrisi.md](../sains-latihan/01-nutrisi.md)
- [ ] Onboarding tidak muncul lagi setelah selesai

## Kasus tepi
- Pengguna memilih < 3 atau > 6 hari → pesan "Pilih 3–6 hari latihan".
- Semua alat dimatikan → program berbasis bodyweight + peringatan pilihan gerakan terbatas.
