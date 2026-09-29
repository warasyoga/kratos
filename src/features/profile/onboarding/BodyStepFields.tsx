import { ageOn } from '@/domain/profile/types';
import { errorText } from '@/shared/i18n/id';
import { tOnboarding } from '@/shared/i18n/onboarding';
import { OptionGroup } from '@/shared/ui/OptionGroup';
import { TextField } from '@/shared/ui/TextField';
import { sexOptions } from '../options';
import type { OnboardingDraft } from './draft';

export interface BodyStepFieldsProps {
  draft: OnboardingDraft;
  patch: (changes: Partial<OnboardingDraft>) => void;
  errors: Record<string, string> | null;
  today: string;
}

export function BodyStepFields({ draft, patch, errors, today }: BodyStepFieldsProps) {
  const age = draft.birthDate ? ageOn(draft.birthDate, today) : undefined;
  const text = tOnboarding.body;
  return (
    <div className="flex flex-col gap-4">
      <TextField
        id="onb-name"
        label={text.name}
        autoComplete="nickname"
        value={draft.name}
        onChange={(e) => patch({ name: e.target.value })}
        error={errorText(errors?.name)}
      />
      <OptionGroup
        name="sex"
        label={text.sex}
        layout="row"
        options={sexOptions}
        value={draft.sex}
        onChange={(sex) => patch({ sex })}
        error={errorText(errors?.sex)}
      />
      <TextField
        id="onb-birth"
        label={text.birthDate}
        type="date"
        max={today}
        value={draft.birthDate}
        onChange={(e) => patch({ birthDate: e.target.value })}
        error={errorText(errors?.birthDate)}
      />
      {age !== undefined && age >= 16 && age < 18 && (
        <p className="text-[13px] text-warn">{text.minorNotice}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="onb-height"
          label={text.height}
          inputMode="decimal"
          suffix="cm"
          value={draft.heightCm}
          onChange={(e) => patch({ heightCm: e.target.value })}
          error={errorText(errors?.heightCm)}
        />
        <TextField
          id="onb-weight"
          label={text.weight}
          inputMode="decimal"
          suffix="kg"
          value={draft.weightKg}
          onChange={(e) => patch({ weightKg: e.target.value })}
          error={errorText(errors?.weightKg)}
        />
      </div>
      <p className="text-xs text-muted">{text.weightHint}</p>
    </div>
  );
}
