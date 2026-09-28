# 05 · Keamanan & Pemulihan

Kode: `src/domain/trainer/`, `src/domain/workout/warmup.ts`, `src/domain/recovery/`

## 1. Skrining PAR-Q+ · **Standar**

PAR-Q+ (Physical Activity Readiness Questionnaire for Everyone) dipakai secara internasional
dan direkomendasikan ACSM sebagai skrining sebelum mulai latihan.

- Diisi saat onboarding, diulang setiap **12 bulan** atau saat pengguna menambah kondisi kesehatan.
- 7 pertanyaan umum (jantung, nyeri dada, pusing/pingsan, kondisi kronis, obat, masalah tulang/sendi, anjuran dokter).
- Semua "tidak" → boleh mulai.
- Ada "ya" → aplikasi **tetap bisa dipakai**, tetapi menampilkan anjuran berkonsultasi ke dokter dan mencatatnya di profil.
- Teks pertanyaan mengikuti versi PAR-Q+ resmi terbaru (lisensi penggunaan bebas untuk non-komersial; cek syaratnya saat implementasi).

## 2. Pemanasan · **Bukti ilmiah** + **Aturan internal**

Sesuai praktik NSCA: pemanasan umum lalu pemanasan spesifik.

1. **Umum:** 5 menit kardio ringan (sepeda/jalan cepat).
2. **Spesifik:** hanya untuk gerakan **pertama** tiap kelompok otot (compound), otomatis dibuat aplikasi:

| Set pemanasan | Beban (dari beban kerja) | Reps |
|---|---|---|
| 1 | 40% (minimal bar kosong) | 8–10 |
| 2 | 60% | 5 |
| 3 | 80% | 2–3 |

Beban pemanasan dibulatkan ke beban **terdekat** yang bisa dipasang (bukan ke bawah).
Set pemanasan diberi tanda `warmup`, tidak dihitung volume maupun PR.
Jika beban kerja ≤ bar kosong + 10 kg, cukup 1 set pemanasan.

**Contoh:** Bench kerja 65 kg → 40% = 26 → **25 kg × 10**, 60% = 39 → **40 kg × 5**, 80% = 52 → **52,5 kg × 3**.

## 3. Pemulihan otot (peta otot) · **Aturan internal**

Berdasarkan anjuran ACSM ≥ 48 jam sebelum melatih otot yang sama secara berat.

```
kelelahan_otot = Σ set (utama = 1, pendukung = 0,5) dalam sesi terakhir
waktu_pulih    = 48 jam, +24 jam jika kelelahan ≥ 6 set atau RIR rata-rata ≤ 1 (maks. 72 jam)
```

| Status | Kondisi | Warna |
|---|---|---|
| Segar | lewat waktu pulih | hijau |
| Pulih sebagian | 50–100% waktu pulih | kuning |
| Baru dilatih | < 50% waktu pulih | oranye |

## 4. Deload · **Bukti ilmiah**

Bell et al. 2023 (konsensus Delphi internasional pelatih kekuatan & fisik):
- Dilakukan setiap **4–8 minggu**, berlangsung ±**1 minggu**.
- Utamanya **mengurangi volume** (set), intensitas boleh sedikit turun.

Aturan aplikasi:
- Terjadwal: minggu ke-6 setiap mesosiklus.
- Deload: jumlah set **−50%** (dibulatkan ke atas, minimal 1), beban **−10%**, target RIR 3–4.
- Deload lebih awal diusulkan jika (lihat [06-deload.md](../mesin-trainer/06-deload.md)).

## 5. Hari pemulihan · **Standar**

WHO 2020 untuk dewasa: **150–300 menit** aktivitas aerobik intensitas sedang per minggu,
ditambah latihan kekuatan ≥ 2 hari/minggu.

Rencana hari istirahat default (3 hari/minggu): jalan kaki 30–40 menit + mobilitas 10 menit.
3 × 40 = 120 menit, ditambah pemanasan kardio 4 × 5 = 20 menit → 140 menit. Aplikasi
menyarankan jalan kaki 50 menit di satu hari pemulihan atau menambah langkah harian agar
mencapai **≥ 150 menit**.

## 6. Kondisi kesehatan · **Aturan internal**

| Tingkat | Perilaku aplikasi |
|---|---|
| Ringan | Gerakan dengan pola yang menyakitkan diganti alternatif yang lebih aman |
| Sedang | Seperti ringan + gerakan yang membebani area itu dibatasi beban (tanpa progresi otomatis) |
| Berat | Semua gerakan yang membebani area itu dinonaktifkan; tampil anjuran ke dokter/fisioterapis |

Nyeri tajam saat latihan: tombol **"Terasa sakit"** di mode latihan menghentikan gerakan itu,
menawarkan pengganti, dan mencatat area nyeri.

## Konstanta

```ts
export const PARQ_REPEAT_MONTHS = 12;
export const WARMUP_SCHEME = [
  { pct: 0.4, reps: 10 },
  { pct: 0.6, reps: 5 },
  { pct: 0.8, reps: 3 },
] as const;
export const RECOVERY_HOURS = { base: 48, heavy: 72, heavySetThreshold: 6 } as const;
export const DELOAD = { setsFactor: 0.5, loadFactor: 0.9, targetRir: 3 } as const;
export const WHO_AEROBIC_MIN_PER_WEEK = { min: 150, max: 300 } as const;
```
