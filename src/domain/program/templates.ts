/**
 * Template program hipertrofi. Setiap slot berisi gerakan pilihan (urutan prioritas);
 * jika tidak ada yang cocok, mesin memakai substitusi dari pilihan pertama.
 * Dasar: docs/sains-latihan/03-desain-program.md
 */
export interface TemplateSlot {
  preferred: readonly string[];
  sets: number;
  repMin: number;
  repMax: number;
}

export interface TemplateDay {
  label: string;
  slots: readonly TemplateSlot[];
}

export interface ProgramTemplate {
  id: string;
  name: string;
  daysPerWeek: number;
  days: readonly TemplateDay[];
}

const slot = (preferred: string[], sets: number, repMin: number, repMax: number): TemplateSlot => ({
  preferred,
  sets,
  repMin,
  repMax,
});

const BENCH = ['barbell-bench-press', 'dumbbell-bench-press'];
const ROW = ['barbell-row', 'dumbbell-row'];
const PULLDOWN = ['lat-pulldown', 'assisted-pull-up'];
const SHOULDER_PRESS = ['seated-dumbbell-shoulder-press', 'overhead-barbell-press'];
const LATERAL = ['dumbbell-lateral-raise', 'cable-lateral-raise'];
const SQUAT = ['barbell-back-squat', 'goblet-squat'];
const RDL = ['romanian-deadlift', 'dumbbell-romanian-deadlift'];
const LEG_CURL = ['lying-leg-curl', 'seated-leg-curl'];

export const UPPER_LOWER_4: ProgramTemplate = {
  id: 'upper-lower-4',
  name: 'Upper/Lower 4 hari',
  daysPerWeek: 4,
  days: [
    {
      label: 'Upper A',
      slots: [
        slot(BENCH, 3, 8, 12),
        slot(ROW, 3, 8, 12),
        slot(['incline-dumbbell-press'], 3, 10, 12),
        slot(PULLDOWN, 3, 10, 12),
        slot(LATERAL, 2, 12, 15),
        slot(['dumbbell-curl', 'cable-curl'], 2, 10, 12),
      ],
    },
    {
      label: 'Lower A',
      slots: [
        slot(SQUAT, 3, 6, 10),
        slot(RDL, 3, 8, 10),
        slot(['leg-press', 'hack-squat'], 2, 10, 12),
        slot(LEG_CURL, 3, 10, 12),
        slot(['standing-calf-raise'], 3, 10, 15),
        slot(['plank'], 2, 30, 45),
      ],
    },
    {
      label: 'Upper B',
      slots: [
        slot(SHOULDER_PRESS, 3, 8, 12),
        slot(['seated-cable-row', 'dumbbell-row'], 3, 10, 12),
        slot(['machine-chest-press', 'dumbbell-bench-press'], 2, 10, 12),
        slot(['assisted-pull-up', 'lat-pulldown'], 3, 6, 10),
        slot(['cable-fly'], 2, 12, 15),
        slot(['face-pull'], 2, 12, 15),
        slot(['triceps-pushdown', 'overhead-dumbbell-triceps-extension'], 2, 12, 15),
      ],
    },
    {
      label: 'Lower B',
      slots: [
        slot(['trap-bar-deadlift', 'romanian-deadlift'], 3, 5, 8),
        slot(['bulgarian-split-squat', 'dumbbell-walking-lunge'], 3, 8, 12),
        slot(['leg-extension'], 2, 12, 15),
        slot(['barbell-hip-thrust'], 3, 8, 12),
        slot(['seated-calf-raise'], 3, 12, 15),
        slot(['cable-crunch'], 2, 12, 15),
      ],
    },
  ],
};

export const FULL_BODY_3: ProgramTemplate = {
  id: 'full-body-3',
  name: 'Full Body 3 hari',
  daysPerWeek: 3,
  days: [
    {
      label: 'Full Body A',
      slots: [
        slot(SQUAT, 3, 6, 10),
        slot(BENCH, 3, 8, 12),
        slot(ROW, 3, 8, 12),
        slot(LEG_CURL, 3, 10, 15),
        slot(['face-pull'], 2, 12, 15),
        slot(['dumbbell-curl', 'cable-curl'], 2, 12, 15),
      ],
    },
    {
      label: 'Full Body B',
      slots: [
        slot(RDL, 3, 6, 10),
        slot(['incline-dumbbell-press'], 3, 8, 12),
        slot(['lat-pulldown'], 2, 8, 12),
        slot(['assisted-pull-up'], 2, 6, 10),
        slot(['leg-extension'], 2, 12, 15),
        slot(LATERAL, 2, 12, 15),
        slot(['triceps-pushdown', 'overhead-dumbbell-triceps-extension'], 2, 12, 15),
      ],
    },
    {
      label: 'Full Body C',
      slots: [
        slot(['bulgarian-split-squat', 'dumbbell-walking-lunge'], 3, 8, 12),
        slot(['machine-chest-press', 'dumbbell-bench-press'], 2, 10, 12),
        slot(['seated-cable-row', 'dumbbell-row'], 3, 10, 12),
        slot(['leg-press', 'hack-squat'], 2, 10, 12),
        slot(['cable-fly'], 2, 12, 15),
        slot(['standing-calf-raise'], 2, 12, 15),
      ],
    },
  ],
};

export const UPPER_LOWER_PPL_5: ProgramTemplate = {
  id: 'upper-lower-ppl-5',
  name: 'Upper/Lower + Push/Pull/Legs 5 hari',
  daysPerWeek: 5,
  days: [
    {
      label: 'Upper',
      slots: [
        slot(BENCH, 3, 8, 12),
        slot(ROW, 3, 8, 12),
        slot(PULLDOWN, 2, 10, 12),
        slot(SHOULDER_PRESS, 2, 10, 12),
        slot(LATERAL, 2, 12, 15),
      ],
    },
    {
      label: 'Lower',
      slots: [
        slot(SQUAT, 3, 6, 10),
        slot(RDL, 2, 8, 10),
        slot(LEG_CURL, 2, 10, 12),
        slot(['standing-calf-raise'], 2, 10, 15),
        slot(['plank'], 2, 30, 45),
      ],
    },
    {
      label: 'Push',
      slots: [
        slot(['machine-chest-press', 'dumbbell-bench-press'], 3, 10, 12),
        slot(['incline-dumbbell-press'], 3, 10, 12),
        slot(['cable-fly'], 2, 12, 15),
        slot(LATERAL, 2, 12, 15),
        slot(['triceps-pushdown', 'overhead-dumbbell-triceps-extension'], 2, 12, 15),
      ],
    },
    {
      label: 'Pull',
      slots: [
        slot(['assisted-pull-up', 'lat-pulldown'], 3, 6, 10),
        slot(['seated-cable-row', 'dumbbell-row'], 3, 10, 12),
        slot(['face-pull'], 2, 12, 15),
        slot(['cable-curl', 'dumbbell-curl'], 2, 12, 15),
        slot(['dumbbell-curl', 'cable-curl'], 2, 10, 12),
      ],
    },
    {
      label: 'Legs',
      slots: [
        slot(['leg-press', 'hack-squat'], 3, 10, 12),
        slot(['bulgarian-split-squat', 'dumbbell-walking-lunge'], 2, 8, 12),
        slot(['leg-extension'], 2, 12, 15),
        slot(['seated-leg-curl', 'lying-leg-curl'], 2, 10, 12),
        slot(['seated-calf-raise'], 2, 12, 15),
      ],
    },
  ],
};

export const PPL_6: ProgramTemplate = {
  id: 'ppl-6',
  name: 'Push/Pull/Legs 6 hari',
  daysPerWeek: 6,
  days: [
    {
      label: 'Push A',
      slots: [
        slot(BENCH, 3, 6, 10),
        slot(SHOULDER_PRESS, 3, 8, 12),
        slot(['incline-dumbbell-press'], 2, 10, 12),
        slot(LATERAL, 2, 12, 15),
        slot(['triceps-pushdown', 'overhead-dumbbell-triceps-extension'], 2, 12, 15),
      ],
    },
    {
      label: 'Pull A',
      slots: [
        slot(ROW, 3, 6, 10),
        slot(PULLDOWN, 3, 8, 12),
        slot(['face-pull'], 2, 12, 15),
        slot(['cable-curl', 'dumbbell-curl'], 2, 12, 15),
      ],
    },
    {
      label: 'Legs A',
      slots: [
        slot(SQUAT, 3, 6, 10),
        slot(RDL, 3, 8, 10),
        slot(LEG_CURL, 2, 10, 12),
        slot(['standing-calf-raise'], 3, 10, 15),
      ],
    },
    {
      label: 'Push B',
      slots: [
        slot(['dumbbell-bench-press', 'machine-chest-press'], 3, 10, 15),
        slot(['cable-fly'], 2, 12, 15),
        slot(['seated-dumbbell-shoulder-press'], 2, 10, 15),
        slot(['cable-lateral-raise', 'dumbbell-lateral-raise'], 3, 12, 15),
        slot(['overhead-dumbbell-triceps-extension', 'triceps-pushdown'], 2, 12, 15),
      ],
    },
    {
      label: 'Pull B',
      slots: [
        slot(['assisted-pull-up', 'lat-pulldown'], 3, 8, 12),
        slot(['seated-cable-row', 'dumbbell-row'], 3, 10, 15),
        slot(['face-pull'], 2, 12, 15),
        slot(['dumbbell-curl', 'cable-curl'], 3, 10, 15),
      ],
    },
    {
      label: 'Legs B',
      slots: [
        slot(['leg-press', 'hack-squat'], 3, 10, 15),
        slot(['bulgarian-split-squat', 'dumbbell-walking-lunge'], 2, 10, 15),
        slot(['leg-extension'], 2, 12, 15),
        slot(['seated-leg-curl', 'lying-leg-curl'], 2, 12, 15),
        slot(['seated-calf-raise'], 3, 12, 15),
      ],
    },
  ],
};

export const TEMPLATES: readonly ProgramTemplate[] = [
  FULL_BODY_3,
  UPPER_LOWER_4,
  UPPER_LOWER_PPL_5,
  PPL_6,
];

export function templateForDays(daysPerWeek: number): ProgramTemplate {
  const template = TEMPLATES.find((t) => t.daysPerWeek === daysPerWeek);
  if (!template) throw new RangeError(`Tidak ada template untuk ${daysPerWeek} hari (3–6)`);
  return template;
}
