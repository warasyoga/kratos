# 11 · Pencapaian & Evaluasi

## Tujuan
Menjaga motivasi dengan menandai kemajuan nyata, bukan sekadar membuka aplikasi.

## Lencana (contoh awal)

| ID | Nama | Syarat |
|---|---|---|
| `first_session` | Langkah Pertama | Menyelesaikan sesi pertama |
| `week_complete` | Minggu Penuh | Semua sesi terjadwal dalam satu minggu selesai |
| `streak_4` / `streak_12` | Konsisten 1 Bulan / 3 Bulan | Streak 4 / 12 minggu |
| `sessions_10/50/100` | 10 / 50 / 100 Sesi | Jumlah sesi selesai |
| `first_pr` | Rekor Pertama | PR pertama |
| `pr_10` | Kolektor Rekor | 10 PR |
| `bench_bodyweight` | Bench Seberat Badan | 1RM estimasi bench ≥ berat badan |
| `squat_1_25x` | Squat 1,25× Badan | 1RM estimasi squat ≥ 1,25 × berat badan |
| `protein_week` | Protein Terjaga | Target protein tercapai 7 hari berturut-turut |
| `block_complete` | Satu Blok Tuntas | Menyelesaikan satu mesosiklus 6 minggu |
| `photo_diary` | Jejak Visual | Foto progres di 3 tanggal berbeda |

Aturan lencana di `domain/achievements/rules.ts`, dievaluasi setelah sesi selesai dan setelah pencatatan nutrisi/ukuran.

## Evaluasi bulanan & akhir blok
Otomatis dibuat tanggal 1 dan setelah minggu deload:
- Kehadiran (%), total sesi, total tonase
- Perubahan 1RM estimasi 3 gerakan utama
- Perubahan berat (tren), lingkar lengan/dada/pinggang
- Rata-rata protein & tidur
- 1–3 saran fokus bulan depan (dari mesin saran)

## Tampilan
- Progres → bagian "Pencapaian": lencana terkunci (abu) dan terbuka (warna pelat)
- Toast + animasi singkat saat lencana terbuka (hormati reduced motion)
- Kartu evaluasi di Hari Ini pada tanggal 1

## Implementasi (Tahap 8)
- `domain/achievements/rules.ts`: 14 lencana, syarat dari `AchievementFacts`; tiap lencana diuji di ambang dan satu
  langkah di bawahnya. Tersimpan di tabel `achievements` (indeks unik `achievementId` → tidak terbuka dua kali).
- `services.achievements.sync()` dijalankan ulang setiap kali hook aksi latihan/nutrisi/progres/profil memuat ulang
  kunci `achievements`; komponen `AchievementWatcher` mengumumkan lencana baru lewat toast.
- `services.evaluation`: periode bulan (sejak profil dibuat) dan blok 6 minggu; laporan kehadiran, sesi, tonase,
  1RM 3 gerakan utama, tren berat, lengan/dada/pinggang, rata-rata protein & tidur, dan ≤ 3 saran fokus.
- Progres → Lencana (grid lencana + daftar evaluasi), `/progres/evaluasi/:key`.

## Kriteria selesai
- [ ] Setiap lencana punya test syarat terpenuhi & belum terpenuhi
- [ ] Lencana tidak bisa terbuka dua kali
