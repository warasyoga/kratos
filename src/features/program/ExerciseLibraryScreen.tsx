import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import type { CatalogItem } from '@/application/program/catalog';
import { useServices } from '@/application/ServicesContext';
import { t } from '@/shared/i18n/id';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { TextField } from '@/shared/ui/TextField';
import { ToggleChip } from '@/shared/ui/ToggleChip';
import { MUSCLE_GROUPS, searchExercises, type MuscleGroup } from './exerciseSearch';
import { useActiveProgram, useCatalog, useProgramAction } from './hooks/useProgram';

function ItemBody({ item }: { item: CatalogItem }) {
  const { exercise, unavailable, progressionLocked } = item;
  return (
    <>
      <span className="flex flex-col items-start">
        <span className="font-semibold">{exercise.name}</span>
        <span className="text-[13px] text-muted">
          {exercise.primaryMuscles.map((m) => t.muscle[m]).join(', ')}
        </span>
      </span>
      {unavailable ? (
        <Chip tone="warn">{t.library.unavailable[unavailable]}</Chip>
      ) : (
        progressionLocked && <Chip tone="neutral">{t.library.locked}</Chip>
      )}
    </>
  );
}

/**
 * Perpustakaan gerakan. Mode pilih: `?tambah=<hari>` menambah ke hari itu,
 * `?ganti=<gerakan program>` mengganti gerakan. docs/fitur/06-perpustakaan-gerakan.md
 */
export function ExerciseLibraryScreen() {
  const [params] = useSearchParams();
  const addToDay = params.get('tambah');
  const replace = params.get('ganti');
  const picking = Boolean(addToDay || replace);

  const services = useServices();
  const navigate = useNavigate();
  const { data: items = [] } = useCatalog();
  const { data: program } = useActiveProgram();
  const { run, pending } = useProgramAction();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(picking);

  const results = useMemo(
    () => searchExercises(items, { query, group, onlyAvailable }),
    [items, query, group, onlyAvailable],
  );

  const dayOf = (id: string | null) => program?.days.find((d) => d.day.id === id);
  const replacedDay = program?.days.find((d) =>
    d.exercises.some((e) => e.programExercise.id === replace),
  );
  const backTo = `/program/hari/${addToDay ?? replacedDay?.day.id ?? ''}`;

  const pick = async (item: CatalogItem) => {
    const ok = addToDay
      ? await run(
          () => services.program.edit.addExercise(addToDay, item.exercise.id),
          t.program.added(item.exercise.name, dayOf(addToDay)?.day.label ?? ''),
        )
      : await run(
          () => services.program.edit.swapExercise(replace ?? '', item.exercise.id),
          t.program.swapped(item.exercise.name),
        );
    if (ok) navigate(backTo, { replace: true });
  };

  const title = addToDay
    ? t.library.pickToAdd(dayOf(addToDay)?.day.label ?? '')
    : replace
      ? t.library.pickToSwap
      : t.library.title;

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader title={title} eyebrow={t.library.count(results.length)} />
      <TextField
        id="library-search"
        label={t.library.search}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div role="group" aria-label={t.library.title} className="flex flex-wrap gap-2">
        {MUSCLE_GROUPS.map((g) => (
          <ToggleChip
            key={g}
            label={t.library.groups[g]}
            pressed={group === g}
            onToggle={() => setGroup(g)}
          />
        ))}
      </div>
      <ToggleChip
        label={t.library.onlyAvailable}
        pressed={onlyAvailable}
        onToggle={() => setOnlyAvailable((v) => !v)}
      />

      {results.length === 0 ? (
        <p className="text-muted">{t.library.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-[18px] border border-line bg-surface px-4">
          {results.map((item) => {
            const className =
              'flex min-h-14 w-full items-center justify-between gap-3 py-2.5 text-left';
            return (
              <li key={item.exercise.id}>
                {picking ? (
                  <button
                    type="button"
                    disabled={pending || item.unavailable !== null}
                    onClick={() => void pick(item)}
                    className={`${className} disabled:opacity-50`}
                  >
                    <ItemBody item={item} />
                  </button>
                ) : (
                  <Link to={`/gerakan/${item.exercise.id}`} className={className}>
                    <ItemBody item={item} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
