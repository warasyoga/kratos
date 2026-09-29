import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import type { ProgramDayView } from '@/application/program/getActiveProgram';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { PROGRAM_EDIT_LIMITS } from '@/domain/standards';
import { errorText, t } from '@/shared/i18n/id';
import { tLibrary } from '@/shared/i18n/library';
import { Button } from '@/shared/ui/Button';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { Sheet } from '@/shared/ui/Sheet';
import { Stepper } from '@/shared/ui/Stepper';
import { useProgramAction } from '../hooks/useProgram';

type Item = ProgramDayView['exercises'][number];

const REST_OPTIONS = [60, 90, 120, 180] as const;
const RIR_OPTIONS = [1, 2, 3] as const;

/** Atur resep satu gerakan, ganti, atau hapus. docs/fitur/04-program.md "Mode edit" */
export function EditExerciseSheet({ item, onClose }: { item: Item; onClose: () => void }) {
  const { program, catalog } = useServices();
  const { run, pending, errors } = useProgramAction();
  const pe = item.programExercise;
  const seconds = item.exercise.measure === 'seconds';
  const [form, setForm] = useState({
    sets: pe.sets,
    repMin: pe.repMin,
    repMax: pe.repMax,
    targetRir: pe.targetRir,
    restSec: pe.restSec,
  });
  const [swapping, setSwapping] = useState(false);
  const substitutes = useQuery({
    queryKey: queryKeys.substitutes(pe.id),
    queryFn: () => catalog.substitutesFor(pe.id),
    enabled: swapping,
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const L = PROGRAM_EDIT_LIMITS;

  const close = async (action: () => Promise<boolean>) => {
    if (await action()) onClose();
  };

  if (swapping) {
    return (
      <Sheet open title={t.program.swapTitle} onClose={() => setSwapping(false)}>
        <div className="flex flex-col gap-2">
          {substitutes.data?.length === 0 && <p className="text-muted">{t.program.swapEmpty}</p>}
          {substitutes.data?.map(({ exercise, progressionLocked }) => (
            <button
              key={exercise.id}
              type="button"
              disabled={pending}
              onClick={() =>
                void close(() =>
                  run(
                    () => program.edit.swapExercise(pe.id, exercise.id),
                    t.program.swapped(exercise.name),
                  ),
                )
              }
              className="flex min-h-12 flex-col items-start rounded-[14px] border border-line px-3.5 py-2.5 text-left"
            >
              <span className="font-semibold">{exercise.name}</span>
              <span className="text-[13px] text-muted">
                {exercise.primaryMuscles.map((m) => t.muscle[m]).join(', ')}
                {progressionLocked && ` · ${tLibrary.locked}`}
              </span>
            </button>
          ))}
          <Link
            to={`/gerakan?ganti=${pe.id}`}
            className="py-3 text-center text-sm font-semibold text-accent"
          >
            {t.program.searchLibrary}
          </Link>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      open
      title={item.exercise.name}
      onClose={onClose}
      footer={
        <Button
          fullWidth
          disabled={pending}
          onClick={() => void close(() => run(() => program.edit.updatePrescription(pe.id, form)))}
        >
          {t.common.save}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Stepper
          label={t.program.sets}
          value={form.sets}
          min={L.setsMin}
          max={L.setsMax}
          onChange={(sets) => set({ sets })}
        />
        <Stepper
          label={seconds ? t.program.secondsMin : t.program.repMin}
          value={form.repMin}
          min={1}
          max={form.repMax}
          step={seconds ? 5 : 1}
          onChange={(repMin) => set({ repMin })}
        />
        <Stepper
          label={seconds ? t.program.secondsMax : t.program.repMax}
          value={form.repMax}
          min={form.repMin}
          max={seconds ? 120 : L.repMaxLimit}
          step={seconds ? 5 : 1}
          onChange={(repMax) => set({ repMax })}
        />
        {errors && (
          <p className="text-[13px] text-bad">
            {Object.values(errors)
              .map((code) => errorText(code))
              .join(' ')}
          </p>
        )}
        {!seconds && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">{t.program.targetRir}</span>
            <SegmentedControl
              label={t.program.targetRir}
              options={RIR_OPTIONS.map((v) => ({ value: String(v), label: String(v) }))}
              value={String(form.targetRir)}
              onChange={(v) => set({ targetRir: Number(v) })}
            />
            <p className="text-xs text-muted">{t.program.rirHint}</p>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">{t.program.restLabel}</span>
          <SegmentedControl
            label={t.program.restLabel}
            options={REST_OPTIONS.map((v) => ({
              value: String(v),
              label: t.program.restOption(v),
            }))}
            value={String(form.restSec)}
            onChange={(v) => set({ restSec: Number(v) })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={() => setSwapping(true)}>
            {t.program.swap}
          </Button>
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => void close(() => run(() => program.edit.removeExercise(pe.id)))}
          >
            {t.program.remove}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
