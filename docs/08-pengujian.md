# 08 · Pengujian

## Piramida test

```
          ▲  E2E (Playwright)          sedikit · alur kritis di viewport HP
         ▲▲▲ Komponen (Testing Library) sedang · interaksi layar penting
       ▲▲▲▲▲ Application (use case)     banyak · repository in-memory
     ▲▲▲▲▲▲▲ Domain (rumus & trainer)   paling banyak · fungsi murni
```

| Lapisan | Alat | Target cakupan | Contoh |
|---|---|---|---|
| Domain | Vitest | ≥ 95% baris | `estimateOneRepMax(65, 8) ≈ 82.33` |
| Application | Vitest + `InMemory*Repository` + `FixedClock` | ≥ 85% | `completeSet` menandai PR baru |
| Infrastructure | Vitest + `fake-indexeddb` | repository & migrasi | Migrasi v1 → v2 tidak menghapus riwayat set |
| UI komponen | Testing Library | komponen berlogika | Mencentang set memulai timer |
| E2E | Playwright (Pixel 7 & iPhone 14) | 5–8 alur | Onboarding → latihan pertama |

## Aturan test domain

Setiap contoh hitung di [sains-latihan/](sains-latihan/README.md) **wajib** menjadi test.
Jika rumus berubah, dokumen dan test berubah bersama.

```ts
describe('estimateOneRepMax (Epley)', () => {
  it('sesuai contoh dokumen: 65 kg × 8 reps', () => {
    expect(estimateOneRepMax(65, 8)).toBeCloseTo(82.33, 2);
  });
  it('1 repetisi mengembalikan beban itu sendiri', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });
  it('menolak repetisi 0', () => {
    expect(() => estimateOneRepMax(60, 0)).toThrow(RangeError);
  });
});
```

Untuk aturan dengan banyak kombinasi (readiness, progresi), gunakan **tabel kasus** (`it.each`).

## Fixture

- `tests/fixtures/profile.ts`: profil contoh (pria, 24 th, 175 cm, 68,4 kg).
- `tests/fixtures/history.ts`: pembuat riwayat latihan N minggu untuk menguji progresi, deload, dan saran.
- Waktu selalu memakai `FixedClock('2026-09-28T07:00:00')`. Test tidak boleh bergantung pada tanggal hari ini.

## Alur E2E kritis

1. Onboarding lengkap → program Upper/Lower terbentuk sesuai hari yang dipilih
2. Check-in hijau → mulai latihan → centang semua set → selesai → ringkasan tampil
3. Check-in merah → latihan hari itu diringankan
4. Terapkan saran trainer → program berubah
5. Matikan alat "Barbell" → gerakan barbell diganti alternatif
6. Tambah kondisi bahu → Overhead Press diganti
7. Ekspor backup → hapus data → impor → data kembali utuh
8. Mode offline: aplikasi terbuka dan latihan bisa dicatat

## Perintah

```bash
npm run test            # semua unit & integration test
npm run test:watch      # mode pengembangan
npm run test:coverage   # laporan cakupan
npm run e2e             # Playwright
```
