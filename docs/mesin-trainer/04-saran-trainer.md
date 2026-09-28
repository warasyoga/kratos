# 04 · Saran Trainer

Fungsi: `evaluateSuggestions(context, dismissed): SuggestionDraft[]`
Setiap aturan adalah satu objek `SuggestionRule` di `domain/trainer/suggestions/`, dikelompokkan per tema
(`volumeRules.ts`, `progressRules.ts`, `scheduleRules.ts`, `lifestyleRules.ts`):

```ts
export interface SuggestionRule {
  id: string;
  category: 'safety' | 'program' | 'nutrition' | 'other';
  evaluate(ctx: SuggestionContext): SuggestionDraft[];
}
```

Menambah saran baru cukup menambah satu aturan + test, lalu mendaftarkannya di `ALL_RULES` (`index.ts`).

Domain tidak menyimpan kalimat. Aturan mengembalikan `ruleId` + `params` (mis. `{ muscle: 'chest', sets: 8 }`),
dan UI menyusun kalimat dari `src/shared/i18n/id.ts`. Kolom "Pesan" di bawah adalah contoh hasil akhirnya.
Program bawaan tidak memicu saran apa pun (dijamin test); saran muncul setelah editan pengguna atau data baru.

## Kapan dijalankan
- Setelah program dibuat atau diedit
- Setelah sesi latihan selesai
- Setiap Senin pagi (evaluasi mingguan) dan tanggal 1 (evaluasi bulanan)

## Aturan

| ID | Pemicu | Pesan (contoh) | Aksi "Terapkan" | Dasar |
|---|---|---|---|---|
| `low_weekly_volume` | Set/minggu otot besar < 10 | "Volume dada 8 set/minggu, di bawah 10–20. Tambah 2 set Dumbbell Bench Press di Upper B?" | Tambah set/gerakan ke hari dengan volume otot itu paling kecil | Schoenfeld 2017 |
| `high_weekly_volume` | Set/minggu > 20 | "Volume punggung 24 set. Kurangi 4 set agar pemulihan cukup?" | Kurangi set dari gerakan isolasi dulu | Schoenfeld 2017 |
| `low_frequency` | Otot besar dilatih < 2×/minggu | "Paha belakang hanya dilatih 1×/minggu. Tambah Leg Curl di Lower B?" | Tambah gerakan | Schoenfeld 2016 |
| `push_pull_imbalance` | Rasio tarik:dorong < 1 | "Gerakan dorong lebih banyak dari tarik. Tambah 2 set Face Pull?" | Tambah set tarik | Aturan internal |
| `quad_ham_imbalance` | Rasio paha belakang:depan < 0,75 | … | Tambah set paha belakang | Aturan internal |
| `stagnation` | 1RM estimasi gerakan tidak naik 3 sesi berturut-turut & bukan deload | "Bench Press stagnan 3 sesi. Coba ganti ke Dumbbell Bench Press selama 4 minggu?" | Tukar gerakan setara | Aturan internal |
| `deload_due` | Lihat [06-deload.md](06-deload.md) | "Performa turun di 3 gerakan. Jadikan minggu ini deload?" | Tandai minggu deload | Bell 2023 |
| `low_attendance` | Kehadiran 2 minggu < 75% | "Minggu ini 2 dari 4 sesi. Mau ubah ke program 3 hari?" | Buat ulang program 3 hari | Aturan internal |
| `low_protein` | Protein < 80% target pada ≥ 4 dari 7 hari terakhir | "Protein rata-rata 95 g, target 137 g. Tambah 1 porsi telur/ayam/susu per hari." | – (informasi) | ISSN 2017 |
| `low_sleep` | Rata-rata tidur di check-in 2 minggu < 7 jam | "Tidur rata-rata 6 jam. Otot tumbuh saat pemulihan; usahakan 7–9 jam." | – | Aturan internal |
| `calorie_recalibration` | Lihat kalibrasi di [01-nutrisi.md](../sains-latihan/01-nutrisi.md) | "Berat naik 0,1 kg/minggu, di bawah target. Naikkan kalori 150 kkal?" | Ubah target kalori | Iraki 2019 |
| `consecutive_same_split` | Otot sama dilatih berat 2 hari berurutan | "Lower A dan Lower B berurutan. Pindahkan Lower B ke Jumat?" | Pindah hari | ACSM (48 jam) |
| `aerobic_below_who` | Total aktivitas aerobik minggu lalu < 150 menit | "Aktivitas aerobik minggu lalu 110 menit. Tambah jalan kaki 40 menit di hari pemulihan." | – | WHO 2020 |
| `parq_expired` | PAR-Q+ > 12 bulan | "Sudah setahun sejak skrining terakhir. Isi ulang PAR-Q+." | Buka formulir | PAR-Q+ |
| `backup_reminder` | Backup terakhir > 14 hari | "Data belum di-backup 2 minggu. Ekspor sekarang?" | Buka ekspor | Aturan internal |

## Aturan tampilan
- Maksimal **2 saran terbuka** di layar Program sekaligus; urutan: keamanan → program → nutrisi → lainnya.
- Saran yang diabaikan tidak muncul lagi selama **14 hari** untuk `ruleId` + target yang sama.
- Setiap saran menampilkan tombol **"Kenapa?"** yang menjelaskan dasar ilmiahnya.
- Menerapkan saran membuat perubahan program yang bisa di-**undo** dari toast.
