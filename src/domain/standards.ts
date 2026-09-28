/**
 * Semua konstanta ilmiah dan aturan internal Kratos, lengkap dengan sumbernya.
 * Penjelasan dan contoh hitung: docs/sains-latihan/.
 * Label: [Standar] rumus/pedoman resmi · [Bukti] meta-analisis/position stand · [Internal] keputusan aplikasi.
 */

// ── Nutrisi (docs/sains-latihan/01-nutrisi.md) ─────────────────────────────

/** [Standar] Mifflin et al. 1990. */
export const MIFFLIN = {
  weight: 10,
  height: 6.25,
  age: 5,
  maleOffset: 5,
  femaleOffset: -161,
} as const;

/** [Standar] Faktor aktivitas yang dipakai bersama Mifflin-St Jeor; sejalan PAL FAO/WHO/UNU 2004. */
export const ACTIVITY_FACTOR = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
} as const;

/** [Bukti] Surplus ringan untuk menambah otot (Iraki et al. 2019). */
export const SURPLUS_KCAL = { min: 250, default: 300, max: 500 } as const;

/** [Internal] Target kalori dibulatkan ke kelipatan ini. */
export const CALORIE_ROUNDING_KCAL = 10;

/** [Bukti] ISSN 2017 (Jäger et al.); Morton et al. 2018. */
export const PROTEIN_G_PER_KG = { min: 1.6, default: 2.0, max: 2.2 } as const;

/** [Standar] AMDR lemak 20–35% (IOM 2005); default 25% [Internal]. */
export const FAT_PCT_OF_KCAL = { min: 0.2, default: 0.25, max: 0.35 } as const;

export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

/** [Standar] EFSA 2010: asupan air total per hari (minuman + makanan). */
export const WATER_TOTAL_L = { male: 2.5, female: 2.0 } as const;
/** [Internal] ±80% air total berasal dari minuman. */
export const WATER_FROM_DRINKS_RATIO = 0.8;
/** [Internal] Tambahan minum per jam latihan, sejalan panduan cairan ACSM. */
export const WATER_EXTRA_L_PER_TRAINING_HOUR = 0.5;

/** [Bukti] Laju naik berat saat menambah otot: 0,25–0,5% berat badan per minggu (Iraki et al. 2019). */
export const WEIGHT_GAIN_PCT_PER_WEEK = { min: 0.0025, max: 0.005 } as const;

/** [Internal] Kalibrasi ulang target kalori dari tren berat. */
export const CALORIE_RECALIBRATION = { everyDays: 14, stepKcal: 150, minWeighIns: 6 } as const;

// ── Komposisi tubuh (docs/sains-latihan/04-komposisi-tubuh.md) ─────────────

/** [Standar] WHO 2000. */
export const BMI_WHO = { underMax: 18.5, normalMax: 25, overMax: 30 } as const;
/** [Standar] WHO Expert Consultation 2004, titik tindakan populasi Asia. */
export const BMI_ASIA = { underMax: 18.5, normalMax: 23, overMax: 27.5 } as const;

/** [Standar] Hodgdon & Beckett 1984 (satuan cm, log10). */
export const NAVY_MALE = { a: 1.0324, b: 0.19077, c: 0.15456 } as const;
export const NAVY_FEMALE = { a: 1.29579, b: 0.35004, c: 0.221 } as const;
export const NAVY_NUMERATOR = 495;
export const NAVY_OFFSET = 450;

/** [Internal] Bobot rata-rata bergerak eksponensial untuk tren berat. */
export const WEIGHT_TREND_ALPHA = 0.1;

// ── Kekuatan & progresi (docs/sains-latihan/02-kekuatan-dan-progresi.md) ────

/** [Standar] Epley 1985. */
export const EPLEY_DIVISOR = 30;
/** [Standar] Estimasi 1RM hanya akurat sampai 10 repetisi. */
export const E1RM_MAX_REPS = 10;

/** [Bukti] Zourdos et al. 2016; Helms et al. 2016. */
export const TARGET_RIR = { min: 1, default: 2, max: 3 } as const;
/** [Internal] Nilai RIR tertinggi yang dicatat (tombol "4+"). */
export const RIR_CAP = 4;

/** [Standar] ACSM 2009: istirahat 1–2 menit, 2–3 menit untuk gerakan inti berat. */
export const REST_SEC = { compoundBarbell: 120, compound: 90, isolation: 60 } as const;

/** [Standar] ACSM 2009: kenaikan beban 2–10%. */
export const PROGRESSION_PCT = { min: 0.02, max: 0.1 } as const;

/** [Internal] Langkah beban, dipilih yang terbesar tetapi ≤ PROGRESSION_PCT.max. */
export const LOAD_STEPS_KG = {
  barbellUpper: [2.5],
  barbellLower: [5, 2.5],
  machine: [5],
} as const;

/** [Internal] Penurunan beban setelah gagal berulang: ≤ 95% beban saat ini. */
export const DECREASE_FACTOR = 0.95;

/** [Internal] Tambahan target repetisi saat langkah beban > 10%. */
export const BIG_STEP_EXTRA_REPS = 2;

/** [Internal] Penyesuaian beban saat kalibrasi, berdasarkan RIR set sebelumnya (target 2). */
export const CALIBRATION_ADJUSTMENT = [
  { minRir: 5, factor: 1.2 },
  { minRir: 4, factor: 1.1 },
  { minRir: 3, factor: 1.05 },
  { minRir: 1, factor: 1 },
  { minRir: 0, factor: 0.9 },
] as const;

/** [Internal] Beban awal sesi pertama sebuah gerakan (per tangan untuk dumbbell). */
export const STARTING_LOAD_KG = {
  dumbbellCompound: 6,
  dumbbellIsolation: 4,
  machine: 10,
  cable: 5,
} as const;

/** [Internal] Inventaris default gym lengkap. */
export const DEFAULT_BAR_KG = 20;
export const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const DEFAULT_DUMBBELLS_KG = Array.from({ length: 20 }, (_, i) => (i + 1) * 2);
export const DEFAULT_MACHINE_STEP_KG = 5;

// ── Desain program (docs/sains-latihan/03-desain-program.md) ───────────────

/** [Bukti] Schoenfeld et al. 2017: ≥ 10 set/otot/minggu; > 20 di atas kebutuhan pemula. */
export const WEEKLY_SETS_PER_MUSCLE = { min: 10, max: 20 } as const;
/** [Internal] Otot pendukung dihitung setengah set. */
export const SECONDARY_MUSCLE_SET_WEIGHT = 0.5;
/** [Bukti] Schoenfeld et al. 2016. */
export const MIN_FREQUENCY_PER_MUSCLE = 2;
/** [Standar] ACSM: ≥ 48 jam sebelum melatih otot yang sama secara berat. */
export const MIN_HOURS_BETWEEN_SAME_MUSCLE = 48;
/** [Internal] Rasio set tarik ÷ dorong dan paha belakang ÷ paha depan. */
export const PULL_TO_PUSH_RATIO = { min: 1, max: 1.5 } as const;
export const HAM_TO_QUAD_RATIO = { min: 0.75, max: 1 } as const;
/** [Internal] Batas edit program. */
export const PROGRAM_EDIT_LIMITS = {
  setsMin: 1,
  setsMax: 6,
  repMaxLimit: 30,
  restSecMin: 30,
  restSecMax: 300,
} as const;
export const TRAINING_DAYS = { min: 3, max: 6 } as const;
/** [Internal] Estimasi durasi satu set kerja dan pemanasan umum. */
export const SET_WORK_SEC = 40;
export const GENERAL_WARMUP_MIN = 5;

// ── Keamanan & pemulihan (docs/sains-latihan/05-keamanan-dan-pemulihan.md) ─

/** [Bukti] Bell et al. 2023: deload setiap 4–8 minggu. Kratos: minggu ke-6 dari blok 6 minggu. */
export const MESOCYCLE_WEEKS = 6;
export const DELOAD = { setsFactor: 0.5, loadFactor: 0.9, targetRir: 3 } as const;
/** [Internal] Syarat deload lebih awal. */
export const EARLY_DELOAD = {
  minBlockWeek: 4,
  e1rmDropPct: 0.05,
  minExercisesDropping: 3,
  poorReadinessCount: 3,
  poorReadinessWindowDays: 7,
  minDecreaseDecisions: 3,
} as const;

/** [Internal] Pemanasan spesifik (praktik NSCA). */
export const WARMUP_SCHEME = [
  { pct: 0.4, reps: 10 },
  { pct: 0.6, reps: 5 },
  { pct: 0.8, reps: 3 },
] as const;
/** [Internal] Cukup 1 set pemanasan jika beban kerja ≤ bar + nilai ini. */
export const WARMUP_SINGLE_SET_MARGIN_KG = 10;

/** [Internal] Ambang readiness dari check-in (docs/mesin-trainer/03-autoregulasi-checkin.md). */
export const READINESS = {
  red: { soreness: 5, energy: 1, sleepHoursBelow: 4 },
  yellow: { soreness: 4, energy: 2, sleepHoursBelow: 6 },
} as const;
export const READINESS_ADJUSTMENT = {
  yellow: { setsReduction: 1, minSets: 2, rirIncrease: 1 },
  red: { setsFactor: 0.5, loadFactor: 0.9, targetRir: 3 },
} as const;

/** [Standar] PAR-Q+: ulangi setiap 12 bulan. */
export const PARQ_REPEAT_MONTHS = 12;
/** [Standar] WHO 2020: 150–300 menit aerobik sedang per minggu. */
export const WHO_AEROBIC_MIN_PER_WEEK = { min: 150, max: 300 } as const;

// ── Saran trainer (docs/mesin-trainer/04-saran-trainer.md) ──────────────────

/** [Internal] */
export const SUGGESTION = {
  dismissCooldownDays: 14,
  maxOpen: 2,
  addSetsStep: 2,
  stagnationSessions: 3,
  lowAttendanceRatio: 0.75,
  lowAttendanceWindowDays: 14,
  lowProteinRatio: 0.8,
  lowProteinMinDays: 4,
  lowProteinWindowDays: 7,
  lowSleepHours: 7,
  backupReminderDays: 14,
} as const;
