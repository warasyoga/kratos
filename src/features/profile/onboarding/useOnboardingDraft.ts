import { useCallback, useEffect, useState } from 'react';
import { EMPTY_DRAFT, STEPS, type OnboardingDraft, type Step } from './draft';

const STORAGE_KEY = 'kratos:onboarding-draft';

interface Saved {
  step: Step;
  draft: OnboardingDraft;
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Saved;
      if (STEPS.includes(saved.step))
        return { step: saved.step, draft: { ...EMPTY_DRAFT, ...saved.draft } };
    }
  } catch {
    // Penyimpanan diblokir atau data rusak: mulai dari awal.
  }
  return { step: 'welcome', draft: EMPTY_DRAFT };
}

/**
 * Jawaban onboarding disimpan sementara di perangkat, agar tidak hilang jika aplikasi tertutup.
 * Dihapus setelah onboarding selesai.
 */
export function useOnboardingDraft() {
  const [state, setState] = useState<Saved>(load);

  useEffect(() => {
    if (state.step === 'summary' || state.step === 'install') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Abaikan: draft hanya kenyamanan.
    }
  }, [state]);

  const patch = useCallback(
    (changes: Partial<OnboardingDraft>) =>
      setState((s) => ({ ...s, draft: { ...s.draft, ...changes } })),
    [],
  );
  const goTo = useCallback((step: Step) => setState((s) => ({ ...s, step })), []);
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Abaikan.
    }
  }, []);

  return { step: state.step, draft: state.draft, patch, goTo, clear };
}
