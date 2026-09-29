import { useState } from 'react';
import type { ProfileOverview } from '@/application/profile/getProfileOverview';
import { useServices } from '@/application/ServicesContext';
import type { ActivityLevel, Experience, Sex } from '@/domain/profile/types';
import { errorText, t } from '@/shared/i18n/id';
import { parseDecimal } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { OptionGroup } from '@/shared/ui/OptionGroup';
import { Sheet } from '@/shared/ui/Sheet';
import { TextField } from '@/shared/ui/TextField';
import { describeChanges } from '../changeMessages';
import { useProfileAction } from '../hooks/useProfileAction';
import { activityOptions, experienceOptions, sexOptions } from '../options';

interface Form {
  name: string;
  sex: Sex;
  birthDate: string;
  heightCm: string;
  weightKg: string;
  experience: Experience;
  activityLevel: ActivityLevel;
  proteinGPerKg: string;
}

const toText = (n: number) => String(n).replace('.', ',');

export function EditBodySheet({
  overview,
  onClose,
}: {
  overview: ProfileOverview;
  onClose: () => void;
}) {
  const { profile } = useServices();
  const { run, pending, errors } = useProfileAction();
  const p = overview.profile;
  const [form, setForm] = useState<Form>({
    name: p.name,
    sex: p.sex,
    birthDate: p.birthDate,
    heightCm: toText(p.heightCm),
    weightKg: toText(overview.weightKg),
    experience: p.experience,
    activityLevel: p.activityLevel,
    proteinGPerKg: toText(p.proteinGPerKg),
  });
  const set = (changes: Partial<Form>) => setForm((f) => ({ ...f, ...changes }));

  const save = async () => {
    const weightKg = parseDecimal(form.weightKg);
    const saved = await run(
      () =>
        profile.update({
          name: form.name,
          sex: form.sex,
          birthDate: form.birthDate,
          heightCm: parseDecimal(form.heightCm),
          experience: form.experience,
          activityLevel: form.activityLevel,
          proteinGPerKg: parseDecimal(form.proteinGPerKg),
          // Berat hanya dicatat jika berubah, agar tidak menambah penimbangan palsu.
          ...(weightKg !== overview.weightKg && { weightKg }),
        }),
      ({ changes }) => (changes.length > 0 ? describeChanges(changes) : [t.common.saved]),
    );
    if (saved) onClose();
  };

  return (
    <Sheet
      open
      title={t.profile.editBody}
      onClose={onClose}
      footer={
        <Button fullWidth disabled={pending} onClick={() => void save()}>
          {t.common.save}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          id="edit-name"
          label={t.onboarding.body.name}
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          error={errorText(errors?.name)}
        />
        <OptionGroup
          name="edit-sex"
          label={t.onboarding.body.sex}
          layout="row"
          options={sexOptions}
          value={form.sex}
          onChange={(sex) => set({ sex })}
        />
        <TextField
          id="edit-birth"
          label={t.onboarding.body.birthDate}
          type="date"
          value={form.birthDate}
          onChange={(e) => set({ birthDate: e.target.value })}
          error={errorText(errors?.birthDate)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="edit-height"
            label={t.onboarding.body.height}
            inputMode="decimal"
            suffix="cm"
            value={form.heightCm}
            onChange={(e) => set({ heightCm: e.target.value })}
            error={errorText(errors?.heightCm)}
          />
          <TextField
            id="edit-weight"
            label={t.onboarding.body.weight}
            inputMode="decimal"
            suffix="kg"
            value={form.weightKg}
            onChange={(e) => set({ weightKg: e.target.value })}
            error={errorText(errors?.weightKg)}
          />
        </div>
        <OptionGroup
          name="edit-experience"
          label={t.profile.experience}
          options={experienceOptions}
          value={form.experience}
          onChange={(experience) => set({ experience })}
        />
        <OptionGroup
          name="edit-activity"
          label={t.profile.activity}
          options={activityOptions}
          value={form.activityLevel}
          onChange={(activityLevel) => set({ activityLevel })}
        />
        <TextField
          id="edit-protein"
          label={t.profile.proteinFactor}
          inputMode="decimal"
          suffix="g/kg"
          hint="1,6–2,2 g/kg (ISSN). Default 2,0."
          value={form.proteinGPerKg}
          onChange={(e) => set({ proteinGPerKg: e.target.value })}
          error={errorText(errors?.proteinGPerKg)}
        />
      </div>
    </Sheet>
  );
}
