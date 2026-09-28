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
│   │   ├── common/               Result, Clock, id, pembulatan
│   │   ├── standards.ts          Konstanta ilmiah + sumbernya
│   │   ├── profile/              UserProfile, HealthCondition, Equipment
│   │   ├── nutrition/            bmr.ts, tdee.ts, calorieTarget.ts, macros.ts, water.ts
│   │   ├── body/                 bmi.ts, bodyFatNavy.ts, weightTrend.ts
│   │   ├── strength/             oneRepMax.ts, progression.ts, plateCalculator.ts, personalRecord.ts
│   │   ├── exercise/             Exercise, muscles.ts, movementPatterns.ts
│   │   ├── program/              Program, templates/, generateProgram.ts, weeklyVolume.ts
│   │   ├── trainer/              readiness.ts, suggestions/, substitution.ts, deload.ts
│   │   ├── workout/              WorkoutSession, SetLog, restDuration.ts, warmup.ts
│   │   ├── recovery/             muscleRecovery.ts (peta otot)
│   │   ├── achievements/         rules.ts
│   │   └── repositories.ts       Semua interface repository
│   │
│   ├── application/              USE CASE
│   │   ├── onboarding/           completeOnboarding.ts
│   │   ├── profile/              updateProfile.ts, toggleEquipment.ts, addHealthCondition.ts
│   │   ├── program/              generateProgram.ts, editProgramExercise.ts, applySuggestion.ts
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
│   │   ├── seed/                 exercises.json (perpustakaan gerakan)
│   │   ├── notifications/        webNotifications.ts, icsCalendar.ts
│   │   ├── backup/               zipArchive.ts
│   │   ├── media/                imageCompressor.ts
│   │   └── clock.ts              SystemClock
│   │
│   ├── features/                 UI PER LAYAR
│   │   ├── onboarding/
│   │   ├── today/
│   │   ├── checkin/
│   │   ├── program/
│   │   ├── workout/
│   │   ├── exercise-library/
│   │   ├── progress/
│   │   ├── nutrition/
│   │   ├── profile/
│   │   └── achievements/
│   │
│   └── shared/                   GENERIK, TANPA PENGETAHUAN GYM
│       ├── ui/                   Button, Card, Chip, Meter, Sheet, Stepper, TabBar
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
