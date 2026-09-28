# 04 · Struktur Folder

```
app-gym/
├── docs/                         Dokumentasi (folder ini)
├── public/
│   ├── icons/                    Ikon PWA (192, 512, maskable)
│   └── exercises/                Gambar/animasi gerakan (WebP)
├── src/
│   ├── app/                      COMPOSITION ROOT
│   │   ├── main.tsx              Titik masuk
│   │   ├── App.tsx               Layout + tab bar
│   │   ├── router.tsx            Definisi rute
│   │   ├── container.ts          Merakit repository + use case
│   │   ├── providers.tsx         QueryClient, ServicesContext, Theme
│   │   └── pwa.ts                Registrasi service worker & prompt update
│   │
│   ├── domain/                   LOGIKA MURNI
│   │   ├── common/               result, clock, id, weekday, assert (validasi & pembulatan)
│   │   ├── standards.ts          Konstanta ilmiah + sumbernya
│   │   ├── profile/              types (UserProfile, HealthCondition, Equipment), inventory (pelat default)
│   │   ├── nutrition/            energy (BMR, TDEE, target kalori), macros, water, recalibration
│   │   ├── body/                 bmi, bodyFat (US Navy), weightTrend
│   │   ├── strength/             loads (pembulatan & langkah beban), plates, oneRepMax, personalRecord,
│   │   │                         calibration, progression
│   │   ├── exercise/             types (Exercise, Muscle, MovementPattern)
│   │   ├── program/              types, templates (3/4/5/6 hari), generateProgram, volume
│   │   ├── trainer/              health, substitution, readiness, deload, suggestions/
│   │   ├── workout/              types (SetLog, WorkoutSession), rest, warmup, planSession
│   │   ├── testing/              data uji bersama (gerakan, kondisi); hanya dipakai test
│   │   ├── recovery/             muscleRecovery (peta otot) — Tahap 8
│   │   ├── achievements/         rules — Tahap 8
│   │   └── repositories.ts       Semua interface repository — Tahap 3
│   │
│   ├── application/              USE CASE
│   │   ├── deps.ts               AppDeps: semua port yang dibutuhkan use case
│   │   ├── services.ts           createServices(deps) → Services (semua use case untuk UI)
│   │   ├── ServicesContext.ts    useServices(): jembatan ke UI
│   │   ├── queryKeys.ts          Kunci cache TanStack Query
│   │   ├── validation.ts         validate(schema, input) → Result dengan kode error per kolom
│   │   ├── testing/              repository memori untuk test
│   │   ├── profile/              schemas.ts (Zod), completeOnboarding, getProfileOverview, updateProfile
│   │   ├── gym/                  gymUseCases.ts (alat, kondisi kesehatan)
│   │   ├── program/              getActiveProgram, programChanges; Tahap 4: edit & saran
│   │   ├── checkin/              submitCheckIn.ts
│   │   ├── workout/              startSession.ts, completeSet.ts, finishSession.ts
│   │   ├── progress/             getProgressSummary.ts, logBodyMetric.ts, addProgressPhoto.ts
│   │   ├── nutrition/            logFood.ts, logWater.ts, getDailyNutrition.ts
│   │   ├── today/                getTodayPlan.ts
│   │   └── backup/               exportData.ts, importData.ts
│   │
│   ├── infrastructure/           DETAIL TEKNIS
│   │   ├── db/                   database.ts (Dexie), schema.ts, migrations/
│   │   ├── repositories/         Dexie*Repository.ts + mappers
│   │   ├── seed/                 exerciseCatalog.ts (61 gerakan + panduan), catalogVersion.ts
│   │   ├── platform.ts           requestPersistentStorage
│   │   ├── notifications/        webNotifications.ts, icsCalendar.ts
│   │   ├── backup/               zipArchive.ts
│   │   ├── media/                imageCompressor.ts
│   │   └── clock.ts              SystemClock
│   │
│   ├── features/                 UI PER LAYAR
│   │   ├── today/
│   │   ├── checkin/
│   │   ├── program/
│   │   ├── workout/
│   │   ├── exercise-library/
│   │   ├── progress/
│   │   ├── nutrition/
│   │   ├── profile/              ProfileScreen + onboarding/ (berbagi form alat, kondisi, PAR-Q+, jadwal)
│   │   └── achievements/
│   │
│   └── shared/                   GENERIK, TANPA PENGETAHUAN GYM
│       ├── ui/                   Button, Card, Chip, Meter, Stat, TextField, OptionGroup, ToggleChip,
│       │                         SegmentedControl, Sheet, Toast, StepProgress, ScreenHeader, TabBar
│       ├── lib/                  format.ts (angka/tanggal id-ID), cn.ts, haptics.ts
│       ├── i18n/                 id.ts (semua teks yang tampil ke pengguna)
│       └── styles/               tokens.css, global.css
│
├── tests/
│   ├── e2e/                      Playwright
│   └── fixtures/                 Data contoh bersama
├── CLAUDE.md
├── README.md
└── (file konfigurasi: vite, tsconfig, eslint, prettier, playwright)
```

## Isi standar satu folder fitur

```
features/workout/
├── WorkoutScreen.tsx         Komponen layar (dipakai router)
├── components/               Komponen khusus fitur ini
│   ├── SetTable.tsx
│   ├── SetRow.tsx
│   ├── RestTimer.tsx
│   ├── RirPicker.tsx
│   └── PlateLoader.tsx
├── hooks/
│   ├── useWorkoutSession.ts  Query + mutation ke use case
│   └── useRestTimer.ts
└── index.ts                  Ekspor publik fitur (hanya layar)
```

## Letak test

Test diletakkan **di sebelah file yang diuji**: `oneRepMax.ts` → `oneRepMax.test.ts`.
Hanya test end-to-end yang berada di `tests/e2e/`.

## Panduan cepat: "kode ini taruh di mana?"

| Kode yang ditulis | Letak |
|---|---|
| Rumus atau aturan latihan/nutrisi | `domain/` |
| "Saat pengguna menekan X, lakukan A, B, C" | `application/` |
| Kode yang memanggil Dexie, API browser, file | `infrastructure/` |
| Komponen yang tahu istilah gym | `features/<fitur>/components/` |
| Komponen yang bisa dipakai aplikasi apa pun | `shared/ui/` |
| Teks yang tampil ke pengguna | `shared/i18n/id.ts` |
| Angka dari jurnal/pedoman | `domain/standards.ts` |
