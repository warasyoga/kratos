# 03 · Arsitektur

Kratos memakai **arsitektur berlapis** (Clean Architecture versi ringan). Tujuannya:
- rumus dan logika trainer bisa diuji tanpa React dan tanpa database,
- tampilan bisa diubah tanpa menyentuh logika,
- penyimpanan bisa diganti (mis. ke server) tanpa mengubah logika.

## Empat lapisan

```
┌───────────────────────────────────────────────────────────┐
│ UI  ·  src/features, src/shared/ui                         │
│ Menampilkan data & menerima input. Tidak berisi aturan.    │
└──────────────────────────┬────────────────────────────────┘
                           │ memanggil
┌──────────────────────────▼────────────────────────────────┐
│ Application  ·  src/application                            │
│ Use case: urutan langkah untuk satu aksi pengguna.         │
└──────────────────────────┬────────────────────────────────┘
                           │ memakai
┌──────────────────────────▼────────────────────────────────┐
│ Domain  ·  src/domain                                      │
│ Entitas, rumus, mesin trainer, interface repository.       │
│ Fungsi murni. Tidak bergantung pada apa pun.               │
└──────────────────────────▲────────────────────────────────┘
                           │ mengimplementasikan interface
┌──────────────────────────┴────────────────────────────────┐
│ Infrastructure  ·  src/infrastructure                      │
│ Dexie (IndexedDB), notifikasi, file backup, jam sistem.    │
└───────────────────────────────────────────────────────────┘
```

`src/app` adalah **composition root**: satu-satunya tempat yang merakit semua lapisan
(membuat repository Dexie, menyuntikkannya ke use case, lalu menyediakannya ke UI).

## Aturan ketergantungan

| Dari ↓ boleh impor → | domain | application | infrastructure | features | shared |
|---|:-:|:-:|:-:|:-:|:-:|
| **domain** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **application** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **infrastructure** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **features** | ✅ (tipe & fungsi format) | ✅ | ❌ | ❌ (antar fitur) | ✅ |
| **shared** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **app** | ✅ | ✅ | ✅ | ✅ | ✅ |

Aturan ini **ditegakkan otomatis** oleh `eslint-plugin-boundaries`. Pelanggaran membuat `npm run lint` gagal.

```js
// eslint.config.js (cuplikan, eslint-plugin-boundaries v7)
'boundaries/elements': [
  { type: 'app',            pattern: 'src/app' },
  { type: 'features',       pattern: 'src/features/*', capture: ['feature'] },
  { type: 'application',    pattern: 'src/application' },
  { type: 'domain',         pattern: 'src/domain' },
  { type: 'infrastructure', pattern: 'src/infrastructure' },
  { type: 'shared',         pattern: 'src/shared' },
],
'boundaries/dependencies': ['error', {
  default: 'disallow',
  policies: [
    { from: layer('features'),       allow: { to: layers('application', 'domain', 'shared') } },
    { from: layer('application'),    allow: { to: layers('application', 'domain') } },
    { from: layer('infrastructure'), allow: { to: layers('infrastructure', 'domain') } },
    { from: layer('domain'),         allow: { to: layer('domain') } },
    // ... app boleh ke semua, shared hanya ke shared
  ],
}],
```

Selain itu, `src/domain` dilarang memakai `Date.now()`, `localStorage`, dan `fetch`.
Setiap fitur adalah elemen tersendiri, sehingga impor antar fitur (`features/today` → `features/program`) ditolak,
sementara impor di dalam satu fitur tetap boleh.

## Tanggung jawab tiap lapisan

### Domain
- Tipe entitas: `Exercise`, `Program`, `WorkoutSession`, `SetLog`, `UserProfile`, dst.
- Rumus: BMR, TDEE, protein, 1RM, BMI, lemak tubuh, kalkulator pelat.
- Mesin trainer: pembuatan program, progresi beban, autoregulasi, saran, substitusi, deload.
- Interface repository (`WorkoutRepository`, `ProfileRepository`, ...) dan `Clock`.
- **Dilarang:** `Date.now()` langsung, `fetch`, `localStorage`, React, Dexie.

### Application
- Satu file = satu use case = satu aksi pengguna: `completeSet`, `submitCheckIn`, `applySuggestion`.
- Mengambil data lewat repository, memanggil domain, menyimpan hasil.
- Mengembalikan `Result` (sukses/gagal yang diharapkan). Error tak terduga dilempar.

### Infrastructure
- Implementasi repository dengan Dexie, termasuk migrasi skema.
- Adapter notifikasi, ekspor/impor zip, `SystemClock`.
- Mengubah format database ↔ entitas domain (mapper).

### UI (features + shared/ui)
- Komponen hanya menampilkan dan meneruskan aksi.
- Setiap fitur punya hook (`useWorkoutSession`) yang memanggil use case lewat TanStack Query.
- `shared/ui` berisi komponen generik (Button, Card, Chip) tanpa pengetahuan tentang gym.

## Dependency injection

Tanpa framework DI. Cukup fungsi pabrik dan React Context.

```ts
// src/application/workout/completeSet.ts
export function makeCompleteSet(deps: { workoutRepo: WorkoutRepository; clock: Clock }) {
  return async function completeSet(input: CompleteSetInput): Promise<Result<CompleteSetOutput>> {
    // 1. ambil sesi aktif, 2. panggil domain, 3. simpan, 4. kembalikan hasil
  };
}

// src/app/container.ts  (composition root)
const db = createDatabase();
const workoutRepo = new DexieWorkoutRepository(db);
export const services = {
  completeSet: makeCompleteSet({ workoutRepo, clock: systemClock }),
  // ...
};
export type Services = typeof services;

// src/features/workout/hooks/useWorkoutSession.ts
import { useServices } from '@/application/ServicesContext';
const { completeSet } = useServices();
```

`Services` (tipe) ada di `src/application/services.ts`, dan `ServicesContext`/`useServices` ada di
`src/application/ServicesContext.ts`. Itu satu-satunya file di application yang memakai React,
sehingga fitur bisa mengakses use case tanpa mengimpor `src/app`. `AppProviders` di `src/app/providers.tsx`
memasang context ini bersama QueryClient (`networkMode: 'always'` karena data lokal, bukan server).

Di test, `workoutRepo` diganti `InMemoryWorkoutRepository` dan `clock` diganti `FixedClock`.

## Contoh alur lengkap: mencentang satu set

```
[UI] SetRow → klik ✓
  → [UI] useWorkoutSession().completeSet({ setId, weightKg, reps, rir })
    → [Application] completeSet
        1. workoutRepo.getActiveSession()
        2. domain/strength/estimateOneRepMax(weight, reps)        → 82,3 kg
        3. domain/strength/detectPersonalRecord(history, newSet)   → PR baru?
        4. domain/workout/restDuration(exercise)                   → 120 dtk
        5. workoutRepo.saveSet(...)
        6. return { e1rm, isPr, restEndsAt }
    → [UI] TanStack Query meng-invalidate data sesi → tampilan diperbarui
    → [UI] Timer istirahat dimulai dari restEndsAt
```

## Alur data umum

```
Baca:  Komponen → hook (useQuery) → use case/query → repository → Dexie
Tulis: Komponen → hook (useMutation) → use case → domain → repository → Dexie
                                                   └→ invalidasi query terkait
```

## Kapan menambah lapisan/abstraksi baru

Jangan menambah abstraksi sebelum dibutuhkan dua kali. Jika ragu, taruh logika di domain
sebagai fungsi murni; itu hampir selalu pilihan yang paling mudah diuji.
