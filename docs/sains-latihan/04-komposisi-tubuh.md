# 04 · Komposisi Tubuh

Kode: `src/domain/body/`

## 1. BMI · **Standar**

```
BMI = berat(kg) ÷ tinggi(m)²
```

| Kategori WHO | BMI | Titik tindakan Asia (WHO 2004) |
|---|---|---|
| Kurus | < 18,5 | < 18,5 |
| Normal | 18,5–24,9 | 18,5–22,9 |
| Berat lebih | 25,0–29,9 | 23,0–27,4 |
| Obesitas | ≥ 30 | ≥ 27,5 |

Aplikasi menampilkan kategori WHO dan catatan titik Asia. **Peringatan di UI:** BMI tidak
membedakan otot dan lemak; orang berotot bisa tampak "berat lebih". Persen lemak tubuh
lebih relevan untuk tujuan menambah otot.

**Contoh:** 68,4 ÷ 1,75² = 68,4 ÷ 3,0625 = **22,3** (Normal)

## 2. Persen lemak tubuh: US Navy · **Standar**

Satuan cm, log basis 10.
```
Pria   : %BF = 495 / (1,0324 − 0,19077 × log10(pinggang − leher) + 0,15456 × log10(tinggi)) − 450
Wanita : %BF = 495 / (1,29579 − 0,35004 × log10(pinggang + pinggul − leher) + 0,22100 × log10(tinggi)) − 450
```
Sumber: Hodgdon & Beckett 1984. Galat umum ±3–4%; dipakai untuk melihat **tren**, bukan angka mutlak.

Cara ukur (ditampilkan di aplikasi):
- Leher: tepat di bawah jakun
- Pinggang pria: setinggi pusar; wanita: bagian tersempit
- Pinggul (wanita): bagian terlebar bokong
- Ukur pagi hari, sebelum makan, pita tidak menekan kulit

**Contoh:** pria, tinggi 175, leher 37, pinggang 80
- log10(43) = 1,63347 · log10(175) = 2,24304
- penyebut = 1,0324 − 0,31162 + 0,34668 = 1,06747
- 495 / 1,06747 − 450 = **13,7%**

## 3. Tren berat badan · **Aturan internal**

Berat harian naik-turun 0,5–1 kg karena air dan isi perut. Yang dipakai adalah **rata-rata
bergerak eksponensial (EMA)**:
```
tren_hari_ini = tren_kemarin + 0,1 × (berat_hari_ini − tren_kemarin)
```
Hari tanpa timbangan: tren tetap. Laju mingguan = selisih tren hari ini vs 7 hari lalu.

Panduan menimbang: pagi hari setelah buang air, sebelum makan/minum. Check-in hari gym
menyediakan kolom berat; jika latihan sore, pengguna mengisi berat pagi itu.

## 4. Ukuran tubuh · **Aturan internal**

- Dicatat setiap **2 minggu**: leher, dada, lengan (dikencangkan), pinggang, pinggul, paha.
- Indikator menambah otot yang baik: lengan/dada/paha naik, pinggang naik ≤ separuh kenaikan dada.

## 5. Foto progres

- Pose depan, samping, belakang; pencahayaan & jarak sama; setiap 2–4 minggu.
- Disimpan hanya di HP (tidak dikirim ke mana pun).

## Konstanta

```ts
export const BMI_WHO = { under: 18.5, normalMax: 25, overMax: 30 } as const;
export const BMI_ASIA = { normalMax: 23, overMax: 27.5 } as const;
export const NAVY_MALE = { a: 1.0324, b: 0.19077, c: 0.15456 } as const;
export const NAVY_FEMALE = { a: 1.29579, b: 0.35004, c: 0.221 } as const;
export const WEIGHT_TREND_ALPHA = 0.1;
export const MEASUREMENT_INTERVAL_DAYS = 14;
```
