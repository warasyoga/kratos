# 10 · Pengingat

## Tujuan
Mengingatkan jadwal latihan, check-in, minum air, ukur tubuh, dan backup.

## Keterbatasan penting
Tanpa server, PWA **tidak bisa** menjamin notifikasi muncul tepat waktu saat aplikasi tertutup
(lihat [ADR-005](../keputusan/ADR-005-pengingat.md)). Karena itu ada dua jalur:

| Jalur | Cara kerja | Andal? |
|---|---|---|
| **Kalender HP (.ics)** | Aplikasi membuat file jadwal latihan berulang (+ alarm 30 menit sebelumnya) yang diimpor ke Google Calendar / Kalender iPhone | ✅ Sangat andal |
| **Notifikasi dalam aplikasi** | Notifikasi lokal saat aplikasi dibuka/di latar belakang (mis. timer istirahat habis, "belum minum air") | ⚠️ Hanya saat aplikasi aktif atau baru saja dipakai |
| **Banner di layar Hari Ini** | Pengingat ukur tubuh, backup, PAR-Q+ | ✅ Muncul saat aplikasi dibuka |

## Tampilan
Profil → Pengingat:
- Jam latihan (default 17.30) → tombol "Tambahkan ke kalender HP" (unduh/buka file .ics)
- Toggle notifikasi timer istirahat
- Toggle pengingat air (saat aplikasi terbuka, setiap 2 jam, 08.00–20.00)
- Pengingat ukur tubuh (14 hari) & backup (14 hari) sebagai banner

## Aturan
- Minta izin notifikasi **hanya** saat pengguna menyalakan toggle, tidak saat pertama buka.
- Mengubah hari gym → tampilkan ajakan memperbarui file kalender.
- iPhone: notifikasi hanya tersedia jika aplikasi sudah dipasang ke Home Screen; tampilkan penjelasan jika belum.

## Data
`Settings.reminderTime`. Adapter `infrastructure/notifications/icsCalendar.ts`, `webNotifications.ts`.

## Kriteria selesai
- [ ] File .ics valid (RFC 5545) dan berhasil diimpor ke Google Calendar & Kalender iPhone
- [ ] Menolak izin notifikasi tidak merusak fitur lain
