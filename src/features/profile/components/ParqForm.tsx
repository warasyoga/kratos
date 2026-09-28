import { PARQ_QUESTIONS, type ParqAnswers } from '@/domain/profile/parq';
import { errorText, t } from '@/shared/i18n/id';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';

export type ParqDraft = Partial<ParqAnswers>;

const yesNo = [
  { value: 'no', label: t.parq.no },
  { value: 'yes', label: t.parq.yes },
] as const;

export interface ParqFormProps {
  value: ParqDraft;
  onChange: (value: ParqDraft) => void;
  errors?: Record<string, string> | undefined;
}

export function ParqForm({ value, onChange, errors }: ParqFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t.parq.intro}</p>
      <ol className="flex flex-col gap-4">
        {PARQ_QUESTIONS.map((q, index) => {
          const answer = value[q];
          return (
            <li key={q} className="flex flex-col gap-2">
              <p className="text-sm">
                <span className="font-bold tabular-nums">{index + 1}. </span>
                {t.parq.questions[q]}
              </p>
              <SegmentedControl
                label={t.parq.questions[q]}
                options={yesNo}
                value={answer === undefined ? undefined : answer ? 'yes' : 'no'}
                onChange={(v) => onChange({ ...value, [q]: v === 'yes' })}
              />
              {errors?.[q] && <p className="text-[13px] text-bad">{errorText(errors[q])}</p>}
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-muted">{t.parq.source}</p>
    </div>
  );
}
