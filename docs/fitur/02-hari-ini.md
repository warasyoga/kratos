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

## Data
Query `getTodayPlan(date)` → `{ kind: 'gym' | 'recovery', day?, checkIn?, activeSession?, nutrition, week, topSuggestion? }`

## Kriteria selesai
- [ ] Tampil benar untuk hari gym, hari pemulihan, minggu deload, dan sesi aktif
- [ ] Waktu muat < 300 ms dari data lokal
- [ ] Ringkasan nutrisi sama dengan layar Nutrisi

## Kasus tepi
- Belum ada program → arahkan ke onboarding/program.
- Hari gym tetapi sesi sudah selesai → kartu berubah jadi ringkasan sesi + "Kerja bagus".
