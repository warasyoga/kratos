# 02 · Hari Ini

## Tujuan
Layar pertama yang dibuka setiap hari: menjawab "apa yang harus saya lakukan hari ini?"

## User story
- Di hari gym, saya ingin langsung tahu latihan hari ini dan memulainya.
- Di hari istirahat, saya ingin tahu apa yang tetap perlu saya lakukan.
- Setiap hari, saya ingin melihat sisa target nutrisi.

## Tampilan

**Hari gym**
1. Header: tanggal, "Hari gym", chip "Minggu 3 / 6" (atau "Minggu deload")
2. Kartu check-in: tombol "Check-in sebelum latihan" → setelah diisi, tampil hasil readiness
3. Kartu latihan: nama hari (UPPER A), jumlah gerakan/set, estimasi durasi, 3 gerakan pertama, tombol "Mulai latihan" / "Lanjutkan latihan" jika sesi aktif
4. Kartu nutrisi: kalori, protein, air (meter)
5. Kartu minggu ini: 7 hari dengan status (selesai / hari ini / terlewat / pemulihan) + streak
6. Kartu saran (maks. 1, yang paling penting)

**Hari pemulihan**
1. Header "Hari pemulihan"
2. Kartu aktivitas: jalan kaki X menit, mobilitas 10 menit, checklist "Sudah"
3. Kartu peta otot ringkas: otot yang sedang pulih
4. Kartu nutrisi & minggu ini (sama)
5. Pratinjau latihan berikutnya

## Aturan
- Estimasi durasi = Σ (set × (40 dtk kerja + istirahat)) + 5 menit pemanasan, dibulatkan ke 5 menit.
- **Streak** = jumlah minggu berturut-turut dengan semua sesi terjadwal selesai (sesi yang dipindah hari tetap dihitung jika selesai di minggu yang sama).
- Sesi yang terlewat bisa "Pindahkan ke hari ini" jika hari ini hari pemulihan dan otot targetnya sudah pulih.

## Implementasi (Tahap 6)
- Use case `today.plan()` merangkum: hari gym/pemulihan, check-in, sesi aktif/selesai, minggu blok (1–6, deload),
  kalender 7 hari, streak, latihan terlewat, latihan berikutnya, aktivitas pemulihan, dan target harian.
- Kalender & streak: `domain/today/week.ts`. Hari latihan selesai jika sesinya selesai kapan pun di minggu yang sama.
  Streak = minggu berturut-turut dengan jumlah sesi ≥ jumlah hari latihan; minggu berjalan dihitung jika sudah lengkap.
- Aktivitas pemulihan disimpan di tabel `activityLogs` (skema v2): jalan kaki 35 mnt, mobilitas 10 mnt.
  Menit jalan kaki minggu lalu dipakai aturan saran `aerobic_below_who` (hanya setelah program berjalan satu minggu penuh).
- "Latih hari ini" untuk latihan terlewat langsung memulai sesi hari itu (pengecekan pemulihan otot menyusul di Tahap 8).

## Data
Query `getTodayPlan(date)` → `{ kind: 'gym' | 'recovery', day?, checkIn?, activeSession?, nutrition, week, topSuggestion? }`

## Kriteria selesai
- [ ] Tampil benar untuk hari gym, hari pemulihan, minggu deload, dan sesi aktif
- [ ] Waktu muat < 300 ms dari data lokal
- [ ] Ringkasan nutrisi sama dengan layar Nutrisi

## Kasus tepi
- Belum ada program → arahkan ke onboarding/program.
- Hari gym tetapi sesi sudah selesai → kartu berubah jadi ringkasan sesi + "Kerja bagus".
