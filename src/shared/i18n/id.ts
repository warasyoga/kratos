/**
 * Semua teks yang tampil ke pengguna. Komponen tidak menulis teks langsung.
 * Label untuk nilai domain memakai `satisfies Record<...>` agar tidak ada nilai yang terlewat.
 */
import type { AchievementId } from '@/domain/achievements/rules';
import type { BmiCategory } from '@/domain/body/bmi';
import type { Weekday } from '@/domain/common/weekday';
import type { MovementPattern, Muscle } from '@/domain/exercise/types';
import type {
  ActivityLevel,
  BodyArea,
  Equipment,
  Experience,
  Severity,
  Sex,
} from '@/domain/profile/types';
import type { SubstitutionReason } from '@/domain/program/types';
import type { RecoveryStatus } from '@/domain/recovery/muscleRecovery';

/** Nilai saran yang sudah diformat untuk ditampilkan (nama otot/gerakan/hari, angka). */
export type SuggestionArgs = Partial<
  Record<
    | 'muscle'
    | 'sets'
    | 'addSets'
    | 'removeSets'
    | 'dayLabel'
    | 'exercise'
    | 'frequency'
    | 'push'
    | 'pull'
    | 'hamstrings'
    | 'quads'
    | 'sessions'
    | 'substitute'
    | 'completed'
    | 'scheduled'
    | 'firstDay'
    | 'minutes'
    | 'targetMinutes'
    | 'averageG'
    | 'targetG'
    | 'averageHours'
    | 'deltaKcal'
    | 'direction'
    | 'days'
    | 'secondDay'
    | 'weekday',
    string | undefined
  >
>;

export const t = {
  app: {
    name: 'Kratos',
    tagline: 'Trainer & pemantau latihan pribadi',
  },
  nav: {
    label: 'Menu utama',
    today: 'Hari Ini',
    program: 'Program',
    workout: 'Latihan',
    progress: 'Progres',
    profile: 'Profil',
  },
  common: {
    builtInStage: (stage: number) => `Dibangun di Tahap ${stage}`,
    next: 'Lanjut',
    back: 'Kembali',
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    edit: 'Ubah',
    add: 'Tambah',
    remove: 'Hapus',
    loading: 'Memuat…',
    saved: 'Tersimpan',
    stepOf: (step: number, total: number) => `Langkah ${step} dari ${total}`,
    decrease: (label: string) => `Kurangi ${label}`,
    increase: (label: string) => `Tambah ${label}`,
  },
  errors: {
    name_required: 'Isi nama panggilan.',
    name_too_long: 'Nama maksimal 30 karakter.',
    choose_one: 'Pilih salah satu.',
    birth_date_invalid: 'Isi tanggal lahir yang valid.',
    age_range: 'Umur harus 16–80 tahun.',
    number_required: 'Isi dengan angka.',
    height_range: 'Tinggi harus 120–230 cm.',
    weight_range: 'Berat harus 30–250 kg.',
    training_days_range: 'Pilih 3–6 hari latihan.',
    note_too_long: 'Catatan maksimal 200 karakter.',
    answer_required: 'Jawab pertanyaan ini.',
    protein_range: 'Protein harus 1,6–2,2 g/kg.',
    scale_range: 'Pilih nilai 1–5.',
    sleep_range: 'Tidur harus 0–14 jam.',
    set_weight_range: 'Beban harus 0–500 kg.',
    set_reps_range: 'Repetisi harus 0–300.',
    rir_value_range: 'RIR harus 0–5.',
    no_workout_today: 'Tidak ada latihan terjadwal hari ini. Pilih hari latihan di bawah.',
    no_active_session: 'Tidak ada sesi latihan yang sedang berjalan.',
    bar_range: 'Berat bar harus 5–30 kg.',
    plates_required: 'Pilih minimal satu ukuran pelat.',
    dumbbell_range: 'Ukuran dumbbell di luar batas.',
    dumbbell_order: 'Dumbbell terberat harus ≥ teringan.',
    generic: 'Terjadi kesalahan. Coba lagi.',
    sets_range: 'Set harus 1–6.',
    reps_range: 'Repetisi harus 1–30.',
    rep_order: 'Repetisi maksimal harus ≥ minimal.',
    rest_range: 'Istirahat harus 30–300 detik.',
    rir_range: 'Target RIR harus 1–3.',
    duplicate_exercise: 'Gerakan ini sudah ada di hari yang sama.',
    last_exercise:
      'Hari latihan minimal punya satu gerakan. Kurangi hari latihan lewat Profil → Ubah jadwal.',
    suggestion_gone: 'Saran ini sudah tidak berlaku.',
    not_supported: 'Aksi ini belum tersedia di versi ini.',
    nothing_to_undo: 'Tidak ada perubahan untuk diurungkan.',
    circumference_range: 'Ukuran di luar batas wajar.',
    metric_required: 'Isi minimal satu nilai.',
    last_weight: 'Catatan berat terakhir tidak bisa dihapus.',
    photo_invalid: 'Foto tidak bisa dibaca. Pilih file gambar lain.',
    not_found: 'Data tidak ditemukan.',
    food_label_required: 'Isi nama makanan.',
    food_label_too_long: 'Nama maksimal 40 karakter.',
    kcal_range: 'Kalori harus 0–5.000.',
    macro_range: 'Nilai gram di luar batas wajar.',
    date_invalid: 'Isi tanggal yang valid.',
    date_future: 'Tanggal tidak boleh di masa depan.',
    water_range: 'Air harus 50–2.000 ml.',
    grams_range: 'Berat harus 1–2.000 g.',
    profile_missing: 'Profil belum dibuat.',
    time_invalid: 'Isi jam yang valid (JJ:MM).',
    exercise_name_required: 'Isi nama gerakan (minimal 2 huruf).',
    exercise_name_too_long: 'Nama maksimal 40 karakter.',
    exercise_name_taken: 'Nama gerakan sudah ada.',
    primary_muscle_required: 'Pilih minimal satu otot utama.',
    exercise_in_use: 'Gerakan masih dipakai di program. Ganti dulu di Program.',
    not_custom: 'Gerakan bawaan tidak bisa diubah atau dihapus.',
  } as Record<string, string>,

  // ── Nilai domain ──────────────────────────────────────────────────────────
  sex: { male: 'Pria', female: 'Wanita' } satisfies Record<Sex, string>,
  weekdayShort: {
    mon: 'Sen',
    tue: 'Sel',
    wed: 'Rab',
    thu: 'Kam',
    fri: 'Jum',
    sat: 'Sab',
    sun: 'Min',
  } satisfies Record<Weekday, string>,
  weekdayLong: {
    mon: 'Senin',
    tue: 'Selasa',
    wed: 'Rabu',
    thu: 'Kamis',
    fri: 'Jumat',
    sat: 'Sabtu',
    sun: 'Minggu',
  } satisfies Record<Weekday, string>,
  experience: {
    beginner: {
      label: 'Pemula',
      description: 'Belum pernah atau kurang dari 6 bulan rutin latihan beban.',
    },
    intermediate: {
      label: 'Menengah',
      description: 'Lebih dari 6 bulan rutin dan sudah paham teknik dasar.',
    },
  } satisfies Record<Experience, { label: string; description: string }>,
  activity: {
    sedentary: { label: 'Banyak duduk', description: 'Kerja kantor, jarang berjalan.' },
    light: { label: 'Ringan', description: 'Sesekali jalan kaki atau naik tangga.' },
    moderate: { label: 'Sedang', description: 'Latihan 3–5×/minggu atau cukup banyak bergerak.' },
    very: { label: 'Tinggi', description: 'Latihan berat hampir setiap hari.' },
    extra: { label: 'Sangat tinggi', description: 'Kerja fisik berat ditambah latihan harian.' },
  } satisfies Record<ActivityLevel, { label: string; description: string }>,
  equipment: {
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    squat_rack: 'Rak squat',
    bench: 'Bangku',
    cable: 'Mesin kabel',
    leg_press: 'Leg press',
    smith: 'Smith machine',
    pullup_bar: 'Pull-up bar',
    kettlebell: 'Kettlebell',
    hack_squat: 'Hack squat',
    leg_curl: 'Mesin leg curl',
    leg_extension: 'Mesin leg extension',
    chest_press_machine: 'Mesin chest press',
    lat_pulldown: 'Mesin lat pulldown',
    ez_bar: 'EZ bar',
    landmine: 'Landmine',
    trap_bar: 'Trap bar',
  } satisfies Record<Equipment, string>,
  bodyArea: {
    shoulder_left: 'Bahu kiri',
    shoulder_right: 'Bahu kanan',
    elbow: 'Siku',
    wrist: 'Pergelangan tangan',
    lower_back: 'Punggung bawah',
    upper_back: 'Punggung atas',
    neck: 'Leher',
    hip: 'Pinggul',
    knee_left: 'Lutut kiri',
    knee_right: 'Lutut kanan',
    ankle: 'Pergelangan kaki',
    other: 'Lainnya',
  } satisfies Record<BodyArea, string>,
  severity: {
    mild: { label: 'Ringan', description: 'Terasa pada gerakan tertentu saja.' },
    moderate: {
      label: 'Sedang',
      description: 'Sering terasa; beban di area ini tidak dinaikkan otomatis.',
    },
    severe: { label: 'Berat', description: 'Semua gerakan yang membebani area ini dihindari.' },
  } satisfies Record<Severity, { label: string; description: string }>,
  movement: {
    horizontal_push: 'Mendorong ke depan (bench press)',
    vertical_push: 'Mendorong ke atas kepala',
    horizontal_pull: 'Menarik ke badan (row)',
    vertical_pull: 'Menarik dari atas (pull-up)',
    squat: 'Jongkok (squat)',
    hinge: 'Membungkuk mengangkat (deadlift)',
    lunge: 'Melangkah (lunge)',
    knee_flexion: 'Menekuk lutut (leg curl)',
    knee_extension: 'Meluruskan lutut (leg extension)',
    elbow_flexion: 'Menekuk siku (curl)',
    elbow_extension: 'Meluruskan siku (triceps)',
    shoulder_abduction: 'Mengangkat lengan ke samping',
    calf: 'Jinjit (calf raise)',
    core: 'Latihan perut',
  } satisfies Record<MovementPattern, string>,
  muscle: {
    chest: 'Dada',
    back_lats: 'Punggung (lats)',
    back_upper: 'Punggung atas',
    shoulder_front: 'Bahu depan',
    shoulder_side: 'Bahu samping',
    shoulder_rear: 'Bahu belakang',
    biceps: 'Biseps',
    triceps: 'Triseps',
    forearm: 'Lengan bawah',
    quads: 'Paha depan',
    hamstrings: 'Paha belakang',
    glutes: 'Bokong',
    calves: 'Betis',
    abs: 'Perut',
  } satisfies Record<Muscle, string>,
  bmi: {
    underweight: 'Kurus',
    normal: 'Normal',
    overweight: 'Berat lebih',
    obese: 'Obesitas',
  } satisfies Record<BmiCategory, string>,
  substitutionReason: {
    health: 'kondisi kesehatan',
    equipment: 'alat tidak ada',
    user: 'pilihan Anda',
    stagnation: 'variasi',
  } satisfies Record<SubstitutionReason, string>,

  // ── Layar ─────────────────────────────────────────────────────────────────
  today: {
    title: 'Hari Ini',
    gymDay: 'Hari gym',
    recoveryDay: 'Hari pemulihan',
    weekChip: (week: number, total: number) => `Minggu ${week} / ${total}`,
    deloadChip: 'Minggu ringan',
    deloadBody:
      'Minggu ringan (deload): set dan beban dikurangi agar tubuh pulih dan siap naik lagi.',
    workoutMeta: (count: number, minutes: number) => `${count} gerakan · ±${minutes} menit`,
    moreExercises: (n: number) => `+ ${n} gerakan lagi`,
    checkInTitle: 'Check-in',
    checkInPending: 'Belum check-in. Isi sebelum latihan agar beban hari ini tepat.',
    checkInDo: 'Check-in sekarang',
    doneTitle: 'Latihan hari ini selesai. Kerja bagus!',
    seeSummary: 'Lihat ringkasan',
    weekTitle: 'Minggu ini',
    streak: (n: number) => `Streak ${n} minggu`,
    streakNone: 'Selesaikan semua sesi minggu ini untuk memulai streak.',
    status: {
      done: 'selesai',
      missed: 'terlewat',
      today: 'hari ini',
      upcoming: 'akan datang',
      recovery: 'pemulihan',
    } as Record<string, string>,
    missedTitle: 'Latihan terlewat',
    missedBody: (label: string, day: string) => `${label} (${day}) belum dikerjakan minggu ini.`,
    missedRecovering: (muscles: string) =>
      `${muscles} masih baru dilatih (< 50% waktu pulih). Sebaiknya tunda ke besok.`,
    trainNow: (label: string) => `Latih ${label} hari ini`,
    recoveryTitle: 'Aktivitas pemulihan',
    recoveryBody: 'Bergerak ringan membantu pemulihan otot dan kesehatan jantung.',
    activity: { walk: 'Jalan kaki santai', mobility: 'Mobilitas bahu & pinggul' } as Record<
      string,
      string
    >,
    minutes: (n: number) => `${n} menit`,
    markDone: (name: string) => `Tandai selesai: ${name}`,
    undoActivity: (name: string) => `Batalkan: ${name}`,
    aerobicWeek: (minutes: number) => `Aerobik minggu ini: ${minutes} / 150 menit (WHO)`,
    nextWorkout: (label: string, day: string) => `Latihan berikutnya: ${label} (${day})`,
    nutritionTitle: 'Nutrisi hari ini',
    suggestionLink: 'Lihat saran di Program',
  },
  program: {
    title: 'Program',
    week: (label: string) => label,
    prescription: (sets: number, min: number, max: number, seconds: boolean) =>
      `${sets} × ${min}–${max}${seconds ? ' dtk' : ''}`,
    rest: (sec: number) =>
      sec >= 60 && sec % 60 === 0 ? `istirahat ${sec / 60} mnt` : `istirahat ${sec} dtk`,
    substituted: (name: string, reason: string) => `pengganti ${name} (${reason})`,
    locked: 'beban tidak naik otomatis',
    recoveryDays: 'Hari pemulihan',
    daySets: (sets: number, minutes: number) => `${sets} set · ±${minutes} mnt`,
    editDay: 'Ubah',
    library: 'Perpustakaan gerakan',
    volumeTitle: 'Set per otot · minggu',
    volumeZone: 'zona 10–20',
    volumeValue: (sets: string, times: number) => `${sets} set · ${times}×`,
    moveUp: (name: string) => `Naikkan ${name}`,
    moveDown: (name: string) => `Turunkan ${name}`,
    addExercise: 'Tambah gerakan',
    moveDay: 'Pindah hari',
    moveDayHint: 'Jika hari tujuan sudah dipakai, kedua hari bertukar.',
    editExercise: 'Atur gerakan',
    sets: 'Set',
    repMin: 'Repetisi minimal',
    repMax: 'Repetisi maksimal',
    secondsMin: 'Detik minimal',
    secondsMax: 'Detik maksimal',
    targetRir: 'Target RIR (sisa repetisi)',
    rirHint: 'RIR 2 = masih sanggup 2 repetisi lagi saat berhenti. Pemula: 2.',
    restLabel: 'Istirahat antar set',
    restOption: (sec: number) => (sec % 60 === 0 ? `${sec / 60} mnt` : `${sec} dtk`),
    swap: 'Ganti gerakan',
    swapTitle: 'Pilih pengganti',
    swapEmpty: 'Tidak ada pengganti yang cocok dengan alat dan kondisi Anda.',
    searchLibrary: 'Cari di perpustakaan',
    remove: 'Hapus dari hari ini',
    saved: 'Program disimpan.',
    undo: 'Urungkan',
    undone: 'Perubahan diurungkan.',
    added: (name: string, day: string) => `${name} ditambahkan ke ${day}.`,
    swapped: (name: string) => `Diganti dengan ${name}.`,
    back: 'Kembali ke program',
  },
  workout: {
    title: 'Latihan',
    todayWorkout: 'Latihan hari ini',
    noWorkoutToday: 'Hari ini hari pemulihan. Ingin latihan hari lain?',
    otherDays: 'Latihan hari lain',
    start: 'Mulai latihan',
    resume: 'Lanjutkan latihan',
    startDay: (label: string) => `Mulai ${label}`,
    deloadWeek: 'Minggu ringan (deload): set dan beban dikurangi agar tubuh pulih.',
    adjustment: {
      none: 'Sesuai rencana',
      reduced: 'Volume dikurangi (pemulihan belum maksimal)',
      light: 'Sesi ringan',
      deload: 'Minggu ringan (deload)',
    },
    exerciseOf: (i: number, n: number) => `${i} / ${n}`,
    prevExercise: 'Gerakan sebelumnya',
    nextExercise: 'Gerakan berikutnya',
    guide: 'Panduan',
    target: (sets: number, min: number, max: number, rir: number, seconds: boolean) =>
      `Target ${sets} × ${min}–${max}${seconds ? ' dtk' : ''} · RIR ${rir}`,
    painFlag:
      'Area yang Anda laporkan nyeri terbebani gerakan ini. Ganti atau lewati jika terasa sakit.',
    colSet: 'Set',
    colPrevious: 'Sebelumnya',
    colWeight: 'kg',
    colReps: 'Reps',
    colSeconds: 'Dtk',
    warmupLabel: (n: number) => `P${n}`,
    completeSet: (label: string) => `Selesaikan set ${label}`,
    undoSet: (label: string) => `Batalkan set ${label}`,
    editSet: (label: string) => `Atur set ${label}`,
    editSetTitle: (exercise: string, label: string) => `${exercise} · set ${label}`,
    weight: 'Beban',
    reps: 'Repetisi',
    seconds: 'Detik',
    perHand: 'per tangan',
    addSet: '+ Tambah set',
    rirQuestion: 'Set tadi: sisa berapa repetisi lagi sebelum gagal?',
    rirHint: 'RIR 2 = masih sanggup 2 lagi. Target pemula: 1–3.',
    rirNext: (kg: string) => `Beban set berikutnya disesuaikan: ${kg}.`,
    plates: 'Pasang di tiap sisi',
    platesFormula: (bar: string, perSide: string) => `Bar ${bar} + 2 × (${perSide})`,
    emptyBar: 'Bar kosong',
    plateNotExact: (kg: string) => `Beban dibulatkan ke ${kg} sesuai pelat yang ada.`,
    rest: 'Istirahat',
    restDone: 'Istirahat selesai',
    restMinus: '−15 dtk',
    restPlus: '+15 dtk',
    restSkip: 'Lewati',
    finish: 'Selesai latihan',
    finishConfirm: 'Akhiri sesi? Set yang belum dicentang tidak disimpan.',
    finishYes: 'Ya, selesai',
    discard: 'Batalkan sesi',
    discardConfirm: 'Hapus sesi ini tanpa menyimpan apa pun?',
    discardYes: 'Ya, hapus',
    note: 'Catatan trainer',
    notes: {
      calibration:
        'Gerakan baru: mulai ringan. Isi RIR setelah tiap set, trainer menyesuaikan beban set berikutnya.',
      no_history: 'Belum ada riwayat. Pakai beban yang terasa sesuai target RIR.',
      all_sets_hit_top: (prev: string) =>
        `Beban naik dari ${prev}: minggu lalu semua set mencapai batas atas repetisi.`,
      building_reps: 'Beban tetap. Coba tambah 1 repetisi per set dibanding minggu lalu.',
      big_step_building_reps:
        'Beban berikutnya terlalu jauh (> 10%). Kejar 2 repetisi ekstra dulu sebelum naik.',
      no_heavier_load: 'Sudah di beban/ukuran teratas. Fokus pada repetisi dan teknik.',
      missed_min_twice: (prev: string) =>
        `Beban turun dari ${prev}: dua sesi terakhir belum mencapai repetisi minimal.`,
      locked: 'Beban tidak naik otomatis karena kondisi kesehatan di area ini.',
      deload_week: 'Minggu ringan: beban 90%, set dikurangi.',
    },
  },
  achievements: {
    title: 'Lencana',
    unlockedCount: (n: number, total: number) => `${n} dari ${total} terbuka`,
    unlockedToast: (name: string) => `Lencana terbuka: ${name}`,
    unlockedOn: (date: string) => `Terbuka ${date}`,
    locked: 'Terkunci',
    badge: {
      first_session: { name: 'Langkah Pertama', rule: 'Selesaikan sesi latihan pertama.' },
      week_complete: {
        name: 'Minggu Penuh',
        rule: 'Selesaikan semua sesi terjadwal dalam satu minggu.',
      },
      streak_4: { name: 'Konsisten 1 Bulan', rule: 'Streak 4 minggu lengkap berturut-turut.' },
      streak_12: { name: 'Konsisten 3 Bulan', rule: 'Streak 12 minggu lengkap berturut-turut.' },
      sessions_10: { name: '10 Sesi', rule: 'Selesaikan 10 sesi latihan.' },
      sessions_50: { name: '50 Sesi', rule: 'Selesaikan 50 sesi latihan.' },
      sessions_100: { name: '100 Sesi', rule: 'Selesaikan 100 sesi latihan.' },
      first_pr: { name: 'Rekor Pertama', rule: 'Pecahkan rekor pribadi pertama.' },
      pr_10: { name: 'Kolektor Rekor', rule: 'Kumpulkan 10 rekor pribadi.' },
      bench_bodyweight: {
        name: 'Bench Seberat Badan',
        rule: '1RM estimasi Bench Press ≥ berat badan.',
      },
      squat_1_25x: {
        name: 'Squat 1,25× Badan',
        rule: '1RM estimasi Back Squat ≥ 1,25 × berat badan.',
      },
      protein_week: {
        name: 'Protein Terjaga',
        rule: 'Target protein tercapai 7 hari berturut-turut.',
      },
      block_complete: {
        name: 'Satu Blok Tuntas',
        rule: 'Jalani satu blok 6 minggu sampai minggu deload.',
      },
      photo_diary: { name: 'Jejak Visual', rule: 'Foto progres di 3 tanggal berbeda.' },
    } satisfies Record<AchievementId, { name: string; rule: string }>,
    evaluationsTitle: 'Evaluasi',
    evaluationsEmpty: 'Evaluasi pertama muncul setelah bulan pertama atau blok 6 minggu selesai.',
    /** Judul evaluasi: bulan (label YYYY-MM) → "Evaluasi September 2026", blok → "Evaluasi blok 1". */
    periodTitle: (kind: 'month' | 'block', label: string) =>
      kind === 'month'
        ? `Evaluasi ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(`${label}-01T12:00:00`))}`
        : `Evaluasi blok ${label}`,
    dueCard: 'Evaluasi siap dibaca',
    open: 'Buka evaluasi',
    attendance: 'Kehadiran',
    attendanceValue: (done: number, scheduled: number, pct: string) =>
      `${done} dari ${scheduled} sesi (${pct}%)`,
    sessions: 'Sesi selesai',
    tonnage: 'Total tonase',
    liftsTitle: '1RM estimasi gerakan utama',
    liftLine: (from: string, to: string) => `${from} → ${to}`,
    bodyTitle: 'Tubuh',
    weightChange: 'Perubahan berat (tren)',
    habitsTitle: 'Kebiasaan',
    avgProtein: 'Rata-rata protein',
    avgSleep: 'Rata-rata tidur',
    noData: 'Belum ada data',
    focusTitle: 'Fokus berikutnya',
    focusEmpty: 'Tidak ada saran: lanjutkan program seperti biasa.',
  },
  reminders: {
    title: 'Pengingat',
    workoutTime: 'Jam latihan',
    addToCalendar: 'Tambahkan ke kalender HP',
    calendarHint:
      'Jadwal latihan berulang tiap minggu + alarm 30 menit sebelumnya. Buka file yang terunduh lalu pilih Kalender.',
    calendarOutdated:
      'Jadwal atau jam berubah sejak file kalender dibuat. Tambahkan ulang agar kalender HP sesuai (hapus jadwal lama jika dobel).',
    calendarName: 'Kratos · Latihan',
    calendarSummary: (label: string) => `Latihan ${label} (Kratos)`,
    calendarAlarm: 'Latihan 30 menit lagi',
    calendarSaved: 'File kalender diunduh. Buka untuk menambahkan ke kalender.',
    restTimer: 'Notifikasi timer istirahat',
    restTimerHint: 'Muncul saat aplikasi di latar belakang ketika istirahat habis.',
    water: 'Pengingat minum air',
    waterHint: 'Saat aplikasi terbuka: tiap 2 jam (08.00–20.00) jika target air belum tercapai.',
    denied: 'Izin notifikasi ditolak. Aktifkan lewat pengaturan situs di browser/HP.',
    unsupported:
      'Notifikasi tidak tersedia di sini. Di iPhone, pasang Kratos ke layar utama terlebih dahulu.',
    limitation:
      'Tanpa server, notifikasi hanya andal saat aplikasi aktif. Untuk jadwal latihan, pakai kalender HP.',
    restDoneTitle: 'Istirahat selesai',
    restDoneBody: 'Waktunya set berikutnya.',
    waterTitle: 'Waktunya minum air',
    waterBody: (ml: string, target: string) => `Baru ${ml} dari ${target} ml hari ini.`,
    measureBanner: 'Waktunya mengukur lingkar tubuh (tiap 14 hari).',
    measureOpen: 'Catat ukuran',
  },
  muscleMap: {
    title: 'Peta otot',
    modeLabel: 'Tampilan peta',
    modes: { recovery: 'Pemulihan', volume: 'Volume minggu ini' },
    front: 'Depan',
    back: 'Belakang',
    status: {
      fresh: 'Segar',
      partial: 'Pulih sebagian',
      recent: 'Baru dilatih',
    } satisfies Record<RecoveryStatus, string>,
    regionLabel: (muscle: string, detail: string) => `${muscle}, ${detail.toLowerCase()}`,
    setsValue: (sets: string) => `${sets} set`,
    legendVolume: 'Makin pekat = makin banyak set minggu ini. Garis hijau = zona 10–20 set.',
    rule: 'Pulih 48 jam setelah dilatih; 72 jam jika ≥ 6 set atau RIR rata-rata ≤ 1 (dari anjuran ACSM ≥ 48 jam).',
    setsThisWeek: 'Set minggu ini',
    lastTrained: 'Terakhir dilatih',
    readyAt: 'Siap lagi',
    readyNow: 'Siap dilatih',
    never: 'Belum dilatih minggu ini',
    dayPart: (weekday: string, hour: number) =>
      `${weekday} ${hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam'}`,
    todayTitle: 'Otot yang sedang pulih',
    todayAllFresh: 'Semua otot besar sudah pulih.',
    open: 'Lihat peta otot',
  },
  nutrition: {
    title: 'Nutrisi',
    intakeTitle: 'Asupan hari ini',
    kcal: 'Kalori',
    protein: 'Protein',
    carbs: 'Karbohidrat',
    fat: 'Lemak',
    water: 'Air minum',
    ofTarget: (value: string, target: string, unit: string) => `${value} / ${target} ${unit}`,
    gymDayWater: 'Target air hari gym (+0,5 L per jam latihan).',
    adjustment: (kcal: string) => `Target kalori termasuk koreksi kalibrasi ${kcal} kkal.`,
    addWater: (ml: number) => `+${ml} ml`,
    addWaterLabel: (ml: number) => `Tambah air ${ml} ml`,
    undoWater: 'Batalkan air terakhir',
    foodsTitle: 'Makan hari ini',
    foodsEmpty: 'Belum ada catatan makan hari ini.',
    logFood: 'Catat makan',
    editFood: 'Ubah catatan makan',
    editFoodLabel: (label: string) => `Ubah ${label}`,
    removeFood: 'Hapus catatan',
    foodLine: (kcal: string, protein: string) => `${kcal} kkal · ${protein} g protein`,
    field: {
      label: 'Nama makanan',
      kcal: 'Kalori',
      proteinG: 'Protein',
      carbsG: 'Karbohidrat (opsional)',
      fatG: 'Lemak (opsional)',
      logDate: 'Tanggal',
    },
    saveAsMeal: 'Simpan sebagai menu favorit',
    mealsTitle: 'Menu favorit',
    mealsEmpty:
      'Centang "Simpan sebagai menu favorit" saat mencatat agar bisa dicatat ulang dengan sekali ketuk.',
    logMeal: (label: string) => `Catat ${label}`,
    removeMeal: (label: string) => `Hapus menu ${label}`,
    referencesTitle: 'Porsi referensi',
    referencesHint:
      'Nilai gizi per 100 g dari Tabel Komposisi Pangan Indonesia (TKPI) 2019 Kemenkes; dada ayam tanpa kulit dari USDA. Berat porsi bisa diubah.',
    referenceSource: (source: string, code: string) => `${source} · ${code}`,
    grams: 'Berat',
    logReference: (name: string) => `Catat ${name}`,
    historyTitle: '7 hari terakhir',
    historyAverage: (kcal: string, protein: string) =>
      `Rata-rata ${kcal} kkal · ${protein} g protein`,
    historyEmpty: 'Belum ada catatan di 7 hari terakhir.',
    historyNote: 'Hari tanpa catatan tidak dihitung.',
    logged: 'Tercatat.',
    open: 'Buka nutrisi',
  },
  pwa: {
    offlineReady: 'Kratos siap dipakai tanpa internet.',
    updateAvailable: 'Versi baru Kratos tersedia.',
    reload: 'Muat ulang',
    later: 'Nanti',
    install: 'Pasang aplikasi',
    installed: 'Kratos sudah terpasang di HP ini.',
    installHint: 'Pasang ke layar utama agar data aman dan bisa dibuka tanpa internet.',
  },
  theme: {
    label: 'Tema',
    system: 'Ikuti HP',
    light: 'Terang',
    dark: 'Gelap',
  },
} as const;

const GENERIC_ERROR = 'Terjadi kesalahan. Coba lagi.';

/** Pesan error i18n dari kode; kode tak dikenal → pesan umum. */
export function errorMessage(code: string): string {
  return t.errors[code] ?? GENERIC_ERROR;
}

/** Seperti errorMessage, tetapi kosong jika tidak ada error (untuk kolom form). */
export function errorText(code: string | undefined): string | undefined {
  return code ? errorMessage(code) : undefined;
}
