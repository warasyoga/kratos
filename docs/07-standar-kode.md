# 07 · Standar Kode

Tujuan: siapa pun (termasuk Anda sendiri 6 bulan lagi) bisa membaca dan mengubah kode tanpa takut merusak.

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- Dilarang `any`. Gunakan `unknown` lalu validasi dengan Zod.
- Enum ditulis sebagai union string: `type Sex = 'male' | 'female'`.
- Tipe dari luar (form, file impor, database) **selalu** divalidasi Zod sebelum masuk domain.

## Penamaan

| Jenis | Gaya | Contoh |
|---|---|---|
| Komponen React & file-nya | PascalCase | `SetTable.tsx` |
| Hook | `use` + camelCase | `useRestTimer.ts` |
| Fungsi, variabel, file non-komponen | camelCase | `estimateOneRepMax`, `oneRepMax.ts` |
| Konstanta ilmiah | UPPER_SNAKE_CASE | `PROTEIN_G_PER_KG` |
| Tipe & interface | PascalCase, tanpa awalan `I` | `WorkoutRepository` |
| Use case | kata kerja | `completeSet`, `applySuggestion` |
| Implementasi repository | teknologi + nama | `DexieWorkoutRepository` |
| Folder | kebab-case | `exercise-library/` |

Nama menyertakan **satuan**: `weightKg`, `restSec`, `heightCm`. Tidak ada `weight` tanpa satuan.

## Fungsi domain

```ts
/**
 * Estimasi one-rep max dengan rumus Epley.
 * Sumber: Epley 1985; lihat docs/sains-latihan/02-kekuatan-dan-progresi.md
 * Akurat untuk 1–10 repetisi.
 */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps < 1 || weightKg <= 0) throw new RangeError('weightKg > 0 dan reps >= 1');
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / EPLEY_DIVISOR);
}
```

Aturan:
- Fungsi murni: output hanya bergantung pada input. Waktu disuntikkan lewat `Clock`.
- Satu fungsi satu tugas; lebih dari ±40 baris berarti perlu dipecah.
- Komentar dokumentasi menyebut **sumber** dan **rentang valid**.
- Tidak ada angka ajaib. Semua angka ilmiah ada di `domain/standards.ts`:

```ts
/** ISSN Position Stand: Protein and Exercise (Jäger et al., 2017); Morton et al., 2018. */
export const PROTEIN_G_PER_KG = { min: 1.6, default: 2.0, max: 2.2 } as const;
```

## Penanganan error

- Kesalahan yang **diharapkan** (input tidak valid, sesi tidak ditemukan) dikembalikan sebagai `Result`:
  ```ts
  type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };
  ```
- Kesalahan **tak terduga** (bug) dilempar dan ditangkap Error Boundary di UI.
- Pesan error untuk pengguna menjelaskan apa yang salah dan cara memperbaikinya.

## Komponen React

- Komponen fungsi + hooks. Satu komponen per file.
- Komponen **tidak berisi** aturan bisnis. Contoh yang salah: menghitung 1RM di dalam komponen.
- Props diberi tipe eksplisit. Hindari lebih dari ±7 props; jika lebih, pecah komponen.
- Data diambil lewat hook fitur (`useWorkoutSession`), bukan langsung dari services di banyak komponen.
- State turunan dihitung, tidak disimpan (`const total = sets.length`, bukan `useState`).
- Kelas Tailwind panjang dirapikan dengan helper `cn()` dan varian komponen.

## Format angka & tanggal

- Selalu lewat `shared/lib/format.ts`: `formatKg(68.4) → "68,4 kg"`, `formatDate('2026-09-28') → "Senin, 28 September"`.
- Pembulatan beban ke kelipatan yang bisa dipasang (lihat kalkulator pelat), bukan `Math.round` sembarangan.

## Impor

- Alias `@/` untuk `src/`: `import { estimateOneRepMax } from '@/domain/strength/oneRepMax'`.
- Urutan impor diatur otomatis oleh ESLint.
- Fitur hanya mengekspor layar lewat `index.ts`; komponen internal tidak diimpor fitur lain.

## Git

- Branch: `main` selalu bisa di-build. Pekerjaan di `feat/...`, `fix/...`, `docs/...`.
- Pesan commit mengikuti **Conventional Commits**:
  ```
  feat(workout): tambah timer istirahat otomatis
  fix(nutrition): perbaiki pembulatan target protein
  docs(sains): tambah sumber rumus US Navy
  test(strength): kasus batas estimasi 1RM
  refactor(program): pisah pembuatan program per template
  ```
- Hook pre-commit menjalankan lint + format + test file yang berubah.

## Definition of Done (setiap perubahan)

- [ ] `npm run lint`, `npm run typecheck`, `npm run test` lulus
- [ ] Rumus baru punya test dengan contoh dari dokumen `sains-latihan`
- [ ] Teks baru ada di `i18n/id.ts`
- [ ] Tampilan dicek di lebar 360 px, mode terang dan gelap
- [ ] Dokumen terkait di `docs/` diperbarui
