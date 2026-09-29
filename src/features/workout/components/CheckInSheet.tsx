import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import { BODY_AREAS, type BodyArea } from '@/domain/profile/types';
import { errorText, t } from '@/shared/i18n/id';
import { tOnboarding } from '@/shared/i18n/onboarding';
import { tCheckIn } from '@/shared/i18n/workout';
import { formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { Sheet } from '@/shared/ui/Sheet';
import { Stepper } from '@/shared/ui/Stepper';
import { TextField } from '@/shared/ui/TextField';
import { ToggleChip } from '@/shared/ui/ToggleChip';
import { useToast } from '@/shared/ui/toastContext';
import { useWorkoutAction } from '../hooks/useWorkout';

const SCALE = ['1', '2', '3', '4', '5'] as const;

function ScaleField({
  label,
  captions,
  value,
  onChange,
}: {
  label: string;
  captions: readonly string[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-[13px] text-muted">{captions[value - 1]}</span>
      </div>
      <SegmentedControl
        label={label}
        options={SCALE.map((v) => ({ value: v, label: v }))}
        value={String(value) as (typeof SCALE)[number]}
        onChange={(v) => onChange(Number(v))}
      />
    </div>
  );
}

/** Check-in ±10 detik sebelum latihan. docs/fitur/03-check-in.md */
export function CheckInSheet({ onClose }: { onClose: () => void }) {
  const { checkIn } = useServices();
  const toast = useToast();
  const { run, pending } = useWorkoutAction();
  const [sleepHours, setSleep] = useState(7);
  const [soreness, setSoreness] = useState(2);
  const [energy, setEnergy] = useState(4);
  const [painAreas, setPain] = useState<BodyArea[]>([]);
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>();

  const togglePain = (area: BodyArea) =>
    setPain((p) => (p.includes(area) ? p.filter((a) => a !== area) : [...p, area]));

  const save = async () => {
    const kg = weight.trim() === '' ? undefined : Number(weight.replace(',', '.'));
    const result = await run(() =>
      checkIn.submit({
        sleepHours,
        soreness,
        energy,
        painAreas,
        ...(kg !== undefined && { bodyWeightKg: kg }),
      }),
    );
    if (!result.ok) return setErrors(result.error.fields);
    toast(tCheckIn.readiness[result.value.readiness]);
    onClose();
  };

  return (
    <Sheet
      open
      title={tCheckIn.title}
      onClose={onClose}
      footer={
        <Button fullWidth disabled={pending} onClick={() => void save()}>
          {tCheckIn.save}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <Stepper
          label={tCheckIn.sleep}
          value={sleepHours}
          min={0}
          max={14}
          step={0.5}
          suffix={tCheckIn.hoursSuffix}
          format={(v) => formatNumber(v)}
          onChange={setSleep}
        />
        <ScaleField
          label={tCheckIn.soreness}
          captions={tCheckIn.sorenessScale}
          value={soreness}
          onChange={setSoreness}
        />
        <ScaleField
          label={tCheckIn.energy}
          captions={tCheckIn.energyScale}
          value={energy}
          onChange={setEnergy}
        />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">{tCheckIn.pain}</legend>
          <div className="flex flex-wrap gap-2">
            {BODY_AREAS.map((area) => (
              <ToggleChip
                key={area}
                label={t.bodyArea[area]}
                pressed={painAreas.includes(area)}
                onToggle={() => togglePain(area)}
              />
            ))}
          </div>
        </fieldset>
        <TextField
          id="checkin-weight"
          label={tCheckIn.weight}
          inputMode="decimal"
          suffix="kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          error={errorText(errors?.bodyWeightKg)}
          hint={tOnboarding.body.weightHint}
        />
      </div>
    </Sheet>
  );
}
