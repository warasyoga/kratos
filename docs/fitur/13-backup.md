# 13 · Backup & Ekspor

## Tujuan
Data hanya ada di HP. Backup mencegah kehilangan riwayat saat ganti HP atau data browser terhapus.

## Tampilan
Profil → Data:
- "Ekspor backup" → file `kratos-backup-2026-09-28.zip`
- "Impor backup" → pilih file → pratinjau (jumlah sesi, rentang tanggal, jumlah foto) → pilih **Ganti semua** / **Batal**
- "Ekspor CSV" → riwayat set (untuk dibuka di Excel/Sheets)
- Tanggal backup terakhir

## Format file
```
kratos-backup-YYYY-MM-DD.zip
├── manifest.json     { app: 'kratos', schemaVersion, exportedAt, counts }
├── data.json         semua tabel kecuali foto
└── photos/<id>.jpg
```

## Aturan
- `data.json` divalidasi Zod saat impor; file dari versi skema lebih lama dimigrasikan dulu, versi lebih baru ditolak dengan pesan "Perbarui aplikasi dulu".
- Impor dilakukan dalam satu transaksi: gagal di tengah → data lama tetap utuh.
- Setelah ekspor berhasil, `Settings.lastBackupAt` diperbarui.

## Data
Use case `exportData`, `importData`, `exportSetsCsv`. Adapter `infrastructure/backup/zipArchive.ts`.

## Kriteria selesai
- [ ] Ekspor → hapus semua data → impor → semua layar identik (test E2E)
- [ ] File rusak/asing ditolak dengan pesan yang jelas tanpa mengubah data
- [ ] CSV terbuka benar di Excel dengan format angka Indonesia
