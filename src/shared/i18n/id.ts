/**
 * Semua teks yang tampil ke pengguna. Komponen tidak menulis teks langsung.
 * Label untuk nilai domain memakai `satisfies Record<...>` agar tidak ada nilai yang terlewat.
 */
import type { BmiCategory } from '@/domain/body/bmi';
import type { Weekday } from '@/domain/common/weekday';
import type { MovementPattern, Muscle } from '@/domain/exercise/types';
import type { ParqQuestion, ParqStatus } from '@/domain/profile/parq';
import type {
  ActivityLevel,
  BodyArea,
  Equipment,
  Experience,
  Severity,
  Sex,
} from '@/domain/profile/types';
import type { SubstitutionReason } from '@/domain/program/types';

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
  parq: {
    title: 'Skrining PAR-Q+',
    intro:
      'Tujuh pertanyaan standar internasional sebelum mulai latihan. Jawab jujur; jawaban "ya" tidak menghalangi Anda memakai aplikasi.',
    source: 'Sumber: PAR-Q+ Collaboration. Terjemahan bebas Kratos.',
    yes: 'Ya',
    no: 'Tidak',
    questions: {
      heart_condition:
        'Apakah dokter pernah mengatakan Anda memiliki penyakit jantung atau tekanan darah tinggi?',
      chest_pain:
        'Apakah Anda merasakan nyeri dada saat istirahat, beraktivitas sehari-hari, atau berolahraga?',
      dizziness:
        'Apakah Anda kehilangan keseimbangan karena pusing, atau pernah pingsan, dalam 12 bulan terakhir?',
      chronic_condition:
        'Apakah Anda pernah didiagnosis penyakit kronis lain (selain penyakit jantung atau tekanan darah tinggi)?',
      medication: 'Apakah Anda sedang minum obat resep untuk penyakit kronis?',
      bone_joint:
        'Apakah Anda sedang (atau dalam 12 bulan terakhir) mengalami masalah tulang, sendi, atau jaringan lunak yang bisa memburuk jika lebih aktif?',
      supervised_only:
        'Apakah dokter pernah mengatakan Anda hanya boleh berolahraga dengan pengawasan medis?',
    } satisfies Record<ParqQuestion, string>,
    status: {
      missing: 'Belum diisi',
      clear: 'Aman untuk mulai',
      consult_doctor: 'Disarankan konsultasi dokter',
      expired: 'Perlu diisi ulang (lebih dari 12 bulan)',
    } satisfies Record<ParqStatus, string>,
    consultAdvice:
      'Ada jawaban "ya". Anda tetap bisa memakai Kratos, tetapi sebaiknya konsultasikan dengan dokter sebelum latihan berat.',
    redo: 'Isi ulang',
  },

  // ── Layar ─────────────────────────────────────────────────────────────────
  onboarding: {
    welcome: {
      title: 'Selamat datang di Kratos',
      body: 'Jawab beberapa pertanyaan singkat (±3 menit). Kratos akan menyusun program latihan, target makan, dan memantau progres Anda seperti trainer pribadi.',
      start: 'Mulai',
    },
    body: {
      title: 'Data diri',
      body: 'Dipakai untuk menghitung kebutuhan kalori dan protein.',
      name: 'Nama panggilan',
      sex: 'Jenis kelamin',
      birthDate: 'Tanggal lahir',
      height: 'Tinggi badan',
      weight: 'Berat badan',
      weightHint: 'Paling akurat ditimbang pagi hari sebelum makan.',
      minorNotice:
        'Di bawah 18 tahun, sebaiknya latihan beban didampingi pelatih atau orang dewasa.',
    },
    experience: { title: 'Pengalaman latihan', body: 'Menentukan tingkat kesulitan gerakan.' },
    activity: {
      title: 'Aktivitas di luar gym',
      body: 'Seberapa aktif Anda sehari-hari, termasuk olahraga lain.',
    },
    schedule: {
      title: 'Jadwal latihan',
      body: 'Pilih 3–6 hari ke gym. Hari lainnya menjadi hari pemulihan.',
      count: (n: number) => `${n} hari dipilih`,
    },
    equipment: {
      title: 'Alat di gym Anda',
      body: 'Matikan alat yang tidak ada. Gerakan akan disesuaikan.',
      selectAll: 'Pilih semua',
    },
    health: {
      title: 'Kondisi kesehatan',
      body: 'Ada bagian tubuh yang sakit atau cedera? Program akan menghindari gerakan yang berisiko.',
      none: 'Tidak ada keluhan',
      add: 'Tambah keluhan',
    },
    submit: 'Buat program saya',
    creating: 'Menyusun program…',
    summary: {
      title: 'Program Anda siap',
      body: (program: string) => `Kratos menyusun program ${program} berdasarkan jawaban Anda.`,
      targets: 'Target harian',
      schedule: 'Jadwal minggu ini',
      recovery: 'Pemulihan',
      unfilled:
        'Beberapa gerakan tidak bisa dipilih karena alat atau kondisi kesehatan. Anda bisa menambahkannya nanti di Program.',
    },
    install: {
      title: 'Pasang ke layar utama',
      body: 'Agar data aman dan aplikasi bisa dibuka tanpa internet, pasang Kratos seperti aplikasi biasa.',
      android:
        'Android (Chrome): ketuk menu ⋮ lalu "Instal aplikasi" atau "Tambahkan ke layar utama".',
      ios: 'iPhone (Safari): ketuk tombol Bagikan lalu "Tambah ke Layar Utama".',
      done: 'Selesai, lihat program',
      later: 'Nanti saja',
    },
  },
  today: {
    title: 'Hari Ini',
    gymDay: 'Hari gym',
    recoveryDay: 'Hari pemulihan',
    recoveryBody: 'Jalan kaki santai 30–40 menit dan mobilitas 10 menit membantu pemulihan otot.',
    nextWorkout: (label: string, day: string) => `Latihan berikutnya: ${label} (${day})`,
    workoutMeta: (count: number, minutes: number) => `${count} gerakan · ±${minutes} menit`,
    moreExercises: (n: number) => `+ ${n} gerakan lagi`,
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
  suggestion: {
    label: 'Saran trainer',
    apply: 'Terapkan',
    dismiss: 'Abaikan',
    why: 'Kenapa?',
    applied: 'Saran diterapkan.',
    dismissed: 'Saran disembunyikan selama 14 hari.',
  },
  /** Kalimat & dasar ilmiah tiap aturan saran (docs/mesin-trainer/04-saran-trainer.md). */
  suggestionRules: {
    low_weekly_volume: {
      message: (a: SuggestionArgs) =>
        `Volume ${a.muscle} ${a.sets} set/minggu, di bawah zona 10–20.` +
        (a.exercise
          ? ` Tambah ${a.addSets} set ${a.exercise} di ${a.dayLabel}?`
          : ` Tambah ${a.addSets} set?`),
      why: 'Meta-analisis Schoenfeld dkk. (2017): 10 set atau lebih per otot per minggu menghasilkan pertumbuhan otot lebih besar dibanding volume rendah.',
    },
    high_weekly_volume: {
      message: (a: SuggestionArgs) =>
        `Volume ${a.muscle} ${a.sets} set/minggu, di atas 20. Kurangi ${a.removeSets} set agar pemulihan cukup?`,
      why: 'Di atas ±20 set per otot per minggu, tambahan volume jarang menambah hasil bagi pemula dan memperberat pemulihan (Schoenfeld dkk. 2017).',
    },
    low_frequency: {
      message: (a: SuggestionArgs) =>
        `Otot ${a.muscle} hanya dilatih ${a.frequency}×/minggu.` +
        (a.exercise ? ` Tambah ${a.exercise} di ${a.dayLabel}?` : ''),
      why: 'Melatih setiap otot minimal 2× per minggu lebih efektif untuk hipertrofi dibanding 1× (Schoenfeld dkk. 2016).',
    },
    push_pull_imbalance: {
      message: (a: SuggestionArgs) =>
        `Set dorong (${a.push}) lebih banyak dari set tarik (${a.pull}). Tambah 2 set gerakan tarik?`,
      why: 'Menjaga set tarik minimal sama dengan set dorong membantu keseimbangan otot bahu dan postur (aturan Kratos).',
    },
    quad_ham_imbalance: {
      message: (a: SuggestionArgs) =>
        `Paha belakang ${a.hamstrings} set, kurang dari 75% paha depan (${a.quads} set). Tambah 2 set?`,
      why: 'Paha belakang yang jauh lebih lemah dari paha depan sering dikaitkan dengan risiko cedera; Kratos menjaga rasio ≥ 0,75.',
    },
    stagnation: {
      message: (a: SuggestionArgs) =>
        `${a.exercise} tidak naik dalam ${a.sessions} sesi.` +
        (a.substitute ? ` Coba ganti ke ${a.substitute}?` : ''),
      why: 'Variasi gerakan untuk otot yang sama bisa memecah kebuntuan progres tanpa mengurangi volume (aturan Kratos).',
    },
    deload_due: {
      message: () => 'Tanda kelelahan menumpuk. Jadikan minggu ini minggu ringan (deload)?',
      why: 'Konsensus pelatih internasional (Bell dkk. 2023): minggu ringan setiap 4–8 minggu membantu pemulihan dan progres jangka panjang.',
    },
    low_attendance: {
      message: (a: SuggestionArgs) =>
        `${a.completed} dari ${a.scheduled} sesi dalam 2 minggu terakhir. Ubah ke program 3 hari?`,
      why: 'Program yang bisa dijalani konsisten lebih efektif daripada program ideal yang sering terlewat.',
    },
    consecutive_same_split: {
      message: (a: SuggestionArgs) =>
        `${a.firstDay} dan ${a.secondDay} berurutan melatih otot yang sama.` +
        (a.weekday ? ` Pindahkan ${a.secondDay} ke ${a.weekday}?` : ''),
      why: 'ACSM menganjurkan jeda minimal 48 jam sebelum melatih otot yang sama secara berat.',
    },
    parq_expired: {
      message: () =>
        'Skrining PAR-Q+ belum diisi atau sudah lebih dari 12 bulan. Isi ulang di Profil.',
      why: 'PAR-Q+ adalah skrining kesehatan standar internasional sebelum dan selama program latihan.',
    },
  } as Record<string, { message: (a: SuggestionArgs) => string; why: string }>,
  library: {
    title: 'Gerakan',
    search: 'Cari gerakan, otot, atau alat',
    onlyAvailable: 'Hanya yang bisa saya lakukan',
    count: (n: number) => `${n} gerakan`,
    pickToAdd: (day: string) => `Pilih gerakan untuk ${day}`,
    pickToSwap: 'Pilih gerakan pengganti',
    empty: 'Tidak ada gerakan yang cocok.',
    groups: {
      all: 'Semua',
      chest: 'Dada',
      back: 'Punggung',
      shoulders: 'Bahu',
      arms: 'Lengan',
      legs: 'Kaki',
      core: 'Perut',
    },
    unavailable: {
      equipment: 'Alat tidak ada',
      health: 'Hindari (kesehatan)',
      difficulty: 'Terlalu sulit untuk pemula',
    },
    locked: 'Boleh, beban tidak naik otomatis',
    primary: 'Otot utama',
    secondary: 'Otot pendukung',
    equipmentNeeded: 'Alat',
    noEquipment: 'Tanpa alat',
    steps: 'Cara melakukan',
    mistakes: 'Kesalahan umum',
    alternatives: 'Alternatif',
    notFound: 'Gerakan tidak ditemukan.',
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
  checkIn: {
    title: 'Check-in sebelum latihan',
    open: 'Check-in',
    done: 'Check-in selesai',
    sleep: 'Tidur semalam',
    hoursSuffix: 'j',
    soreness: 'Pegal otot',
    sorenessScale: ['Tidak', 'Sedikit', 'Sedang', 'Pegal', 'Sangat'] as readonly string[],
    energy: 'Energi',
    energyScale: ['Sangat lelah', 'Lelah', 'Biasa', 'Segar', 'Sangat segar'] as readonly string[],
    pain: 'Ada nyeri tajam hari ini? (opsional)',
    weight: 'Berat badan pagi ini (opsional)',
    save: 'Simpan check-in',
    readiness: {
      green: 'Siap latihan penuh. Beban sesuai rencana.',
      yellow: 'Pemulihan belum maksimal. Setiap gerakan dikurangi 1 set dan target RIR +1.',
      red: 'Tubuh butuh pemulihan. Sesi ringan: set dan beban dikurangi.',
    },
    readinessChip: { green: 'Siap penuh', yellow: 'Dikurangi', red: 'Sesi ringan' },
    ignore: 'Tetap latihan penuh',
    skip: 'Lewati check-in',
  },
  summary: {
    title: 'Latihan selesai',
    duration: 'menit',
    sets: 'set kerja',
    tonnage: 'kg total',
    prs: 'Rekor pribadi baru',
    prLine: (name: string, kg: string, reps: number) => `${name} · ${kg} × ${reps}`,
    next: 'Sesi berikutnya',
    nextLine: {
      increase: (from: string, to: string, reps: number) => `${from} → ${to} × ${reps}`,
      hold: (from: string, _to: string, reps: number) => `Tetap ${from}, target ${reps} repetisi`,
      decrease: (from: string, to: string, reps: number) => `${from} → ${to} × ${reps}`,
      deload: (from: string, to: string, reps: number) => `${from} → ${to} × ${reps}`,
    },
    nextKind: { increase: 'Naik', hold: 'Tetap', decrease: 'Turun', deload: 'Ringan' },
    done: 'Kembali ke Hari Ini',
    notFound: 'Ringkasan tidak ditemukan.',
  },
  inventory: {
    title: 'Pelat & dumbbell',
    hint: 'Dipakai untuk membulatkan beban dan kalkulator pelat.',
    bar: 'Berat bar',
    plates: 'Pelat yang tersedia',
    dumbbellMin: 'Dumbbell teringan',
    dumbbellMax: 'Dumbbell terberat',
    dumbbellStep: 'Kelipatan dumbbell',
    machineStep: 'Kelipatan tumpukan mesin',
    summary: (bar: string, plates: string, dMin: string, dMax: string) =>
      `Bar ${bar} · pelat ${plates} · dumbbell ${dMin}–${dMax}`,
  },
  progress: {
    title: 'Progres',
    emptyBody: 'Grafik kekuatan, berat dan ukuran tubuh, volume per otot, dan foto progres.',
  },
  profile: {
    title: 'Profil',
    summary: (sex: string, age: number, height: number, weight: string) =>
      `${sex} · ${age} th · ${height} cm · ${weight}`,
    bmi: 'BMI',
    bmiAsiaNote: (category: string) =>
      `Batas Asia (WHO): ${category}. BMI tidak membedakan otot dan lemak.`,
    kcal: 'kkal / hari',
    protein: 'protein / hari',
    targets: 'Target harian',
    fat: 'Lemak',
    carbs: 'Karbohidrat',
    water: 'Air minum',
    waterValue: (rest: string, gym: string) => `${rest} L (hari gym ${gym} L)`,
    goalSchedule: 'Tujuan & jadwal',
    goal: 'Tujuan',
    goalValue: 'Menambah otot',
    experience: 'Pengalaman',
    trainingDays: 'Hari gym',
    activity: 'Aktivitas harian',
    proteinFactor: 'Protein',
    proteinFactorValue: (g: string) => `${g} g/kg`,
    units: 'Satuan',
    unitsValue: 'kg',
    editBody: 'Ubah data diri',
    editSchedule: 'Ubah jadwal',
    scheduleWarning:
      'Mengubah jumlah atau hari latihan membuat program baru dari template. Riwayat latihan tetap tersimpan, tetapi editan manual pada program lama tidak dibawa.',
    scheduleConfirm: 'Buat program baru',
    equipment: 'Alat di gym saya',
    equipmentHint: 'Ketuk untuk menyalakan atau mematikan. Program menyesuaikan otomatis.',
    health: 'Kondisi kesehatan',
    healthEmpty: 'Tidak ada keluhan.',
    healthAdd: 'Tambah keluhan',
    healthEdit: 'Ubah keluhan',
    healthActive: 'Aktif',
    healthInactive: 'Nonaktif (sudah sembuh)',
    healthArea: 'Bagian tubuh',
    healthSeverity: 'Tingkat keluhan',
    healthMovements: 'Gerakan yang terasa sakit (opsional)',
    healthNote: 'Catatan (opsional)',
    healthDeactivate: 'Tandai sudah sembuh',
    healthActivate: 'Aktifkan lagi',
    healthDoctor: 'Untuk keluhan berat, konsultasikan dengan dokter atau fisioterapis.',
    appearance: 'Tampilan',
    about: 'Tentang',
    version: 'Versi',
    disclaimer: 'Kratos bukan pengganti dokter atau pelatih bersertifikat.',
  },
  changes: {
    none: 'Tersimpan. Program tidak berubah.',
    summary: (n: number) => `Tersimpan. ${n} gerakan disesuaikan.`,
    substituted: (from: string, to: string) => `${from} → ${to}`,
    restored: (from: string, to: string) => `${to} dikembalikan (menggantikan ${from})`,
    unavailable: (name: string) => `${name} tidak punya pengganti`,
    newProgram: (name: string) => `Program baru dibuat: ${name}`,
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
