import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { CustomExerciseDraft } from '@/application/program/customExercises';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import {
  LOAD_TYPES,
  MOVEMENT_PATTERNS,
  MUSCLES,
  type Exercise,
  type LoadType,
  type MovementPattern,
  type Muscle,
} from '@/domain/exercise/types';
import { EQUIPMENT, type Equipment } from '@/domain/profile/types';
import { errorText, t } from '@/shared/i18n/id';
import { tCustomExercise } from '@/shared/i18n/library';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { OptionGroup } from '@/shared/ui/OptionGroup';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { TextField } from '@/shared/ui/TextField';
import { ToggleChip } from '@/shared/ui/ToggleChip';
import { useProgramAction } from './hooks/useProgram';

interface Form {
  name: string;
  pattern: MovementPattern;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipment: Equipment[];
  loadType: LoadType;
  measure: Exercise['measure'];
  note: string;
}

const EMPTY: Form = {
  name: '',
  pattern: 'horizontal_push',
  primaryMuscles: [],
  secondaryMuscles: [],
  equipment: [],
  loadType: 'dumbbell',
  measure: 'reps',
  note: '',
};

const toggle = <T,>(list: readonly T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/** Form gerakan buatan pengguna: `/gerakan/baru` atau `/gerakan/:id/ubah`. */
export function CustomExerciseScreen() {
  const { id } = useParams();
  const { catalog } = useServices();
  const { data: draft, isPending } = useQuery({
    queryKey: [...queryKeys.catalogAll, 'custom', id ?? 'new'],
    queryFn: () => (id ? catalog.custom.draft(id) : Promise.resolve(null)),
  });
  if (id && isPending) return null;
  return <CustomExerciseForm key={id ?? 'new'} id={id} draft={draft ?? null} />;
}

function CustomExerciseForm({
  id,
  draft,
}: {
  id?: string | undefined;
  draft: CustomExerciseDraft | null;
}) {
  const { catalog } = useServices();
  const navigate = useNavigate();
  const { run, pending, errors } = useProgramAction();
  const patternId = useId();
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState<Form>(() =>
    draft
      ? {
          name: draft.exercise.name,
          pattern: draft.exercise.pattern,
          primaryMuscles: draft.exercise.primaryMuscles,
          secondaryMuscles: draft.exercise.secondaryMuscles,
          equipment: draft.exercise.equipment,
          loadType: draft.exercise.loadType,
          measure: draft.exercise.measure,
          note: draft.note,
        }
      : EMPTY,
  );
  const set = (changes: Partial<Form>) => setForm((f) => ({ ...f, ...changes }));

  const save = async () => {
    let savedId: string | undefined;
    const ok = await run(
      async () => {
        const result = id
          ? await catalog.custom.update(id, form)
          : await catalog.custom.create(form);
        if (result.ok) savedId = result.value.id;
        return result;
      },
      id ? tCustomExercise.saved : tCustomExercise.created,
      false,
    );
    if (ok && savedId) void navigate(`/gerakan/${savedId}`, { replace: true });
  };

  const remove = async () => {
    if (!id) return;
    if (await run(() => catalog.custom.remove(id), tCustomExercise.removed, false))
      void navigate('/gerakan', { replace: true });
  };

  const muscleChips = (key: 'primaryMuscles' | 'secondaryMuscles') => (
    <div className="flex flex-wrap gap-2">
      {MUSCLES.map((m) => (
        <ToggleChip
          key={m}
          label={t.muscle[m]}
          pressed={form[key].includes(m)}
          onToggle={() => set({ [key]: toggle(form[key], m) })}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3.5">
      <button
        type="button"
        onClick={() => void navigate(-1)}
        className="flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-accent"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t.common.back}
      </button>
      <ScreenHeader title={id ? tCustomExercise.editTitle : tCustomExercise.newTitle} />

      <Card>
        <TextField
          id="custom-name"
          label={tCustomExercise.name}
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          error={errorText(errors?.name)}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={patternId} className="text-[13px] font-semibold">
            {tCustomExercise.pattern}
          </label>
          <select
            id={patternId}
            value={form.pattern}
            onChange={(e) => set({ pattern: e.target.value as MovementPattern })}
            className="h-12 rounded-xl border border-line bg-surface px-3 text-[16px] text-ink"
          >
            {MOVEMENT_PATTERNS.map((p) => (
              <option key={p} value={p}>
                {t.movement[p]}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">{tCustomExercise.healthNote}</p>
        </div>
      </Card>

      <Card>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-[13px] font-semibold">{tCustomExercise.primary}</legend>
          {muscleChips('primaryMuscles')}
          {errors?.primaryMuscles && (
            <p className="text-[13px] text-bad">{errorText(errors.primaryMuscles)}</p>
          )}
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-[13px] font-semibold">{tCustomExercise.secondary}</legend>
          {muscleChips('secondaryMuscles')}
        </fieldset>
      </Card>

      <Card>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-[13px] font-semibold">{tCustomExercise.equipment}</legend>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((q) => (
              <ToggleChip
                key={q}
                label={t.equipment[q]}
                pressed={form.equipment.includes(q)}
                onToggle={() => set({ equipment: toggle(form.equipment, q) })}
              />
            ))}
          </div>
          <p className="text-xs text-muted">{tCustomExercise.equipmentHint}</p>
        </fieldset>
        <OptionGroup
          name="custom-load"
          label={tCustomExercise.loadType}
          options={LOAD_TYPES.map((value) => ({
            value,
            label: tCustomExercise.loadTypes[value],
          }))}
          value={form.loadType}
          onChange={(loadType) => set({ loadType })}
        />
        <OptionGroup
          name="custom-measure"
          label={tCustomExercise.measure}
          layout="row"
          options={(['reps', 'seconds'] as const).map((value) => ({
            value,
            label: tCustomExercise.measures[value],
          }))}
          value={form.measure}
          onChange={(measure) => set({ measure })}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="custom-note" className="text-[13px] font-semibold">
            {tCustomExercise.note}
          </label>
          <textarea
            id="custom-note"
            rows={3}
            value={form.note}
            onChange={(e) => set({ note: e.target.value })}
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[16px] text-ink outline-none focus-visible:border-accent"
          />
          {errors?.note && <p className="text-[13px] text-bad">{errorText(errors.note)}</p>}
        </div>
      </Card>

      <Button fullWidth disabled={pending} onClick={() => void save()}>
        {tCustomExercise.save}
      </Button>
      {id &&
        (confirming ? (
          <Card>
            <p className="text-sm">{tCustomExercise.removeConfirm}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                {t.common.cancel}
              </Button>
              <Button disabled={pending} onClick={() => void remove()}>
                {t.common.remove}
              </Button>
            </div>
          </Card>
        ) : (
          <Button variant="ghost" fullWidth onClick={() => setConfirming(true)}>
            {tCustomExercise.remove}
          </Button>
        ))}
    </div>
  );
}
