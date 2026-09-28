# ADR-005 · Pengingat Lewat Kalender HP

- Status: Diterima
- Tanggal: 2026-09-28

## Konteks
Pengguna ingin pengingat latihan. PWA tanpa server tidak bisa menjadwalkan notifikasi yang
pasti muncul saat aplikasi tertutup: Notification Triggers API dihentikan, Web Push butuh
server pengirim, dan Periodic Background Sync hanya ada di Chrome dengan jadwal yang ditentukan browser.

## Keputusan
- Pengingat jadwal latihan utama: **file kalender .ics** berulang yang diimpor ke kalender HP.
- Notifikasi web hanya untuk kejadian saat aplikasi aktif (timer istirahat, pengingat air).
- Pengingat lain (ukur tubuh, backup, PAR-Q+) berupa banner di layar Hari Ini.

## Alternatif yang dipertimbangkan
| Opsi | Alasan tidak dipilih |
|---|---|
| Web Push dengan server kecil | Melanggar ADR-002 (tanpa backend); bisa ditambah nanti |
| Periodic Background Sync | Tidak ada di iPhone, jadwal tidak pasti |

## Konsekuensi
- ✅ Pengingat latihan andal di Android dan iPhone, bahkan saat aplikasi tidak dibuka.
- ⚠️ Mengubah jadwal perlu memperbarui file kalender (aplikasi mengingatkan).
