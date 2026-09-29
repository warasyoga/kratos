import type { MovementPattern } from '@/domain/exercise/types';
import { errorText } from '@/shared/i18n/id';
import { tProfile } from '@/shared/i18n/onboarding';
import { OptionGroup } from '@/shared/ui/OptionGroup';
import { TextField } from '@/shared/ui/TextField';
import { ToggleChip } from '@/shared/ui/ToggleChip';
import { bodyAreaOptions, movementOptions, severityOptions } from '../options';
import type { ConditionDraft } from './conditionDraft';

export interface ConditionFormProps {
  value: ConditionDraft;
  onChange: (value: ConditionDraft) => void;
  errors?: Record<string, string> | undefined;
}

export function ConditionForm({ value, onChange, errors }: ConditionFormProps) {
  const toggleMovement = (m: MovementPattern) =>
    onChange({
      ...value,
      painfulMovements: value.painfulMovements.includes(m)
        ? value.painfulMovements.filter((x) => x !== m)
        : [...value.painfulMovements, m],
    });

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold">{tProfile.healthArea}</legend>
        <div className="flex flex-wrap gap-2">
          {bodyAreaOptions.map((o) => (
            <ToggleChip
              key={o.value}
              label={o.label}
              pressed={value.area === o.value}
              onToggle={() => onChange({ ...value, area: o.value })}
            />
          ))}
        </div>
        {errors?.area && <p className="text-[13px] text-bad">{errorText(errors.area)}</p>}
      </fieldset>

      <OptionGroup
        name="severity"
        label={tProfile.healthSeverity}
        options={severityOptions}
        value={value.severity}
        onChange={(severity) => onChange({ ...value, severity })}
        error={errorText(errors?.severity)}
      />
      {value.severity === 'severe' && (
        <p className="text-[13px] text-warn">{tProfile.healthDoctor}</p>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold">{tProfile.healthMovements}</legend>
        <div className="flex flex-wrap gap-2">
          {movementOptions.map((o) => (
            <ToggleChip
              key={o.value}
              label={o.label}
              pressed={value.painfulMovements.includes(o.value)}
              onToggle={() => toggleMovement(o.value)}
            />
          ))}
        </div>
      </fieldset>

      <TextField
        id="condition-note"
        label={tProfile.healthNote}
        value={value.note}
        maxLength={200}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        error={errorText(errors?.note)}
      />
    </div>
  );
}
