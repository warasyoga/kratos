# Spesifikasi Fitur

Setiap dokumen memakai format yang sama:
**Tujuan · User story · Tampilan · Aturan · Data · Kriteria selesai · Kasus tepi.**
Layar yang belum ada di mockup dirancang langsung saat tahap pengerjaannya, mengikuti [design system](../06-design-system.md).

| # | Fitur | Tab | Tahap roadmap |
|---|---|---|---|
| 01 | [Onboarding & PAR-Q+](01-onboarding.md) | – | 3 |
| 02 | [Hari Ini](02-hari-ini.md) | Hari Ini | 6 |
| 03 | [Check-in hari gym](03-check-in.md) | Hari Ini | 5 |
| 04 | [Program (lihat, edit, saran)](04-program.md) | Program | 4 |
| 05 | [Mode latihan](05-mode-latihan.md) | Latihan | 5 |
| 06 | [Perpustakaan gerakan](06-perpustakaan-gerakan.md) | Program | 4 |
| 07 | [Progres](07-progres.md) | Progres | 7 |
| 08 | [Nutrisi](08-nutrisi.md) | Hari Ini | 8 |
| 09 | [Profil & pengaturan](09-profil.md) | Profil | 3 |
| 10 | [Pengingat](10-pengingat.md) | Profil | 8 |
| 11 | [Pencapaian & evaluasi](11-pencapaian.md) | Progres | 8 |
| 12 | [Peta otot](12-peta-otot.md) | Progres | 8 |
| 13 | [Backup & ekspor](13-backup.md) | Profil | 9 |

## Rute

| Rute | Layar |
|---|---|
| `/onboarding` | Onboarding (muncul jika profil belum ada) |
| `/` | Hari Ini |
| `/checkin` | Check-in (sheet) |
| `/program` | Program |
| `/program/hari/:dayId` | Edit hari latihan |
| `/gerakan` · `/gerakan/:id` | Perpustakaan & detail gerakan |
| `/latihan` | Mode latihan (sesi aktif) |
| `/latihan/ringkasan/:sessionId` | Ringkasan sesi |
| `/progres` · `/progres/gerakan/:id` | Progres & detail gerakan |
| `/nutrisi` | Nutrisi harian |
| `/profil` · `/profil/*` | Profil & pengaturan |
