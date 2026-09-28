# 04 · Program

## Tujuan
Menampilkan dan mengelola program latihan: dibuat otomatis, bebas diedit, dan disertai saran trainer.

## User story
- Saya ingin melihat jadwal minggu ini dan isi setiap hari latihan.
- Saya ingin mengganti gerakan yang tidak saya suka atau alatnya sedang dipakai orang.
- Saya ingin trainer memberi tahu jika program saya kurang seimbang, dan saya yang memutuskan.

## Tampilan
1. Header: nama program, jenis split, tombol "Edit"
2. Kalender 7 hari: Upper (biru), Lower (kuning), Pemulihan (abu)
3. Kartu saran (maks. 2): pesan, "Terapkan", "Abaikan", "Kenapa?"
4. Kartu per hari latihan: daftar gerakan (set × reps · istirahat), tanda pengganti
5. Kartu hari pemulihan: aktivitas
6. Bagian "Volume per otot minggu ini" (ringkas, tautan ke Progres)

**Mode edit (per hari)**
- Drag ⋮⋮ untuk mengubah urutan
- Ketuk gerakan → sheet: set, rentang reps, istirahat, target RIR, tombol "Ganti gerakan", "Hapus"
- "Ganti gerakan" → daftar pengganti hasil [substitusi](../mesin-trainer/05-substitusi-gerakan.md) + cari di perpustakaan
- "+ Tambah gerakan" → perpustakaan dengan filter otot/alat
- Pindah hari: pilih hari baru dari kalender
- Ubah jumlah hari → konfirmasi pembuatan ulang program

## Aturan
Lihat [01-pembuatan-program.md](../mesin-trainer/01-pembuatan-program.md) dan [04-saran-trainer.md](../mesin-trainer/04-saran-trainer.md).
- Semua perubahan tersimpan langsung, dengan toast "Disimpan · Urungkan".
- Perubahan program tidak mengubah sesi yang sudah selesai.
- Mengedit saat ada sesi aktif: perubahan berlaku mulai sesi berikutnya.

## Data
`Program`, `ProgramDay`, `ProgramExercise`, `Suggestion`.
Use case: `editProgramExercise`, `reorderProgramExercises`, `addProgramExercise`, `removeProgramExercise`, `moveProgramDay`, `applySuggestion`, `dismissSuggestion`, `regenerateProgram`.

## Kriteria selesai
- [ ] Semua jenis edit berfungsi dan bisa di-undo
- [ ] Volume & saran diperbarui setelah setiap edit
- [ ] Drag bisa dipakai dengan sentuhan dan keyboard (aksesibilitas)

## Kasus tepi
- Menghapus semua gerakan di satu hari → hari berubah menjadi pemulihan setelah konfirmasi.
- Gerakan buatan sendiri tanpa data otot lengkap → tidak dihitung volume, tampilkan peringatan.
