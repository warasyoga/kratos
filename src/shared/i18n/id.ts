/**
 * Semua teks yang tampil ke pengguna. Komponen tidak menulis teks langsung.
 */
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
  today: {
    title: 'Hari Ini',
    emptyTitle: 'Belum ada program',
    emptyBody:
      'Setelah onboarding, layar ini menampilkan latihan hari ini, check-in, target nutrisi, dan kalender minggu Anda.',
  },
  program: {
    title: 'Program',
    emptyBody:
      'Program latihan dibuat otomatis dari profil, alat, dan kondisi kesehatan Anda. Setelah itu Anda bebas mengeditnya.',
  },
  workout: {
    title: 'Latihan',
    emptyBody:
      'Mode latihan untuk dipakai di gym: catat set, timer istirahat otomatis, dan beban yang disarankan trainer.',
  },
  progress: {
    title: 'Progres',
    emptyBody: 'Grafik kekuatan, berat dan ukuran tubuh, volume per otot, dan foto progres.',
  },
  profile: {
    title: 'Profil',
    appearance: 'Tampilan',
    about: 'Tentang',
    version: 'Versi',
  },
  theme: {
    label: 'Tema',
    system: 'Ikuti HP',
    light: 'Terang',
    dark: 'Gelap',
  },
  common: {
    builtInStage: (stage: number) => `Dibangun di Tahap ${stage}`,
  },
} as const;
