import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useServices } from '@/application/ServicesContext';
import type { SuggestionDraft } from '@/domain/trainer/suggestions';
import { tSuggestion } from '@/shared/i18n/library';
import { Button } from '@/shared/ui/Button';
import { useProgramAction } from '../hooks/useProgram';
import { describeSuggestion } from '@/shared/i18n/suggestionText';

export interface SuggestionCardProps {
  draft: SuggestionDraft;
  nameOf: (exerciseId: string) => string;
}

/** Saran trainer: pengguna memutuskan terapkan atau abaikan (docs/mesin-trainer/04-saran-trainer.md). */
export function SuggestionCard({ draft, nameOf }: SuggestionCardProps) {
  const { program } = useServices();
  const navigate = useNavigate();
  const { run, pending } = useProgramAction();
  const [showWhy, setShowWhy] = useState(false);
  const { message, why } = describeSuggestion(draft, nameOf);

  const opensScreen = draft.action?.kind === 'open_screen';
  const apply = () =>
    opensScreen
      ? navigate('/profil')
      : void run(
          () => program.suggestions.apply(draft.ruleId, draft.targetKey),
          tSuggestion.applied,
        );
  const dismiss = () =>
    void run(
      () => program.suggestions.dismiss(draft.ruleId, draft.targetKey),
      tSuggestion.dismissed,
      false,
    );

  return (
    <section
      aria-label={tSuggestion.label}
      className="flex flex-col gap-2.5 rounded-[18px] border border-gold-line bg-gold-bg p-3.5"
    >
      <h2 className="font-sans label-caps text-gold">{tSuggestion.label}</h2>
      <p className="text-sm">{message}</p>
      {showWhy && why && <p className="text-[13px] text-muted">{why}</p>}
      <div className="flex flex-wrap gap-2">
        {draft.action && (
          <Button size="sm" disabled={pending} onClick={apply}>
            {tSuggestion.apply}
          </Button>
        )}
        <Button size="sm" variant="ghost" disabled={pending} onClick={dismiss}>
          {tSuggestion.dismiss}
        </Button>
        {why && (
          <Button
            size="sm"
            variant="ghost"
            aria-expanded={showWhy}
            onClick={() => setShowWhy((s) => !s)}
          >
            {tSuggestion.why}
          </Button>
        )}
      </div>
    </section>
  );
}
