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

## Implementasi (Tahap 9)
- `domain/backup/backup.ts`: bentuk `BackupData` (semua tabel; gerakan bawaan tidak ikut karena berasal dari katalog),
  `BACKUP_SCHEMA_VERSION` = versi skema database (2), nama file, ringkasan pratinjau, CSV (pemisah `;`, BOM UTF-8).
- `application/backup`: `exportData` (zip: manifest.json, data.json, photos/<id>.jpg + <id>-thumb.jpg),
  `inspect` (buka & validasi Zod tanpa mengubah data; v1 dimigrasikan, versi lebih baru ditolak, foto yang hilang
  ditolak), `restore` (satu transaksi Dexie), `exportSetsCsv`.
- Zip: `fflate`, dimuat hanya saat backup dipakai; JPEG disimpan tanpa kompresi ulang.
- UI: Profil → Data & backup; **Impor backup juga ada di layar pembuka onboarding** (HP baru belum punya profil).
- Pengingat backup (saran `backup_reminder`) setelah 14 hari tanpa backup.

## Kriteria selesai
- [x] Ekspor → hapus semua data → impor → semua layar identik (test E2E `tests/e2e/backup.spec.ts`, termasuk foto)
- [x] File rusak/asing ditolak dengan pesan yang jelas tanpa mengubah data
- [x] CSV terbuka benar di Excel dengan format angka Indonesia (`;` + koma desimal + BOM)
