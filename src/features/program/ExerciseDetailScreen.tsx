import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { t } from '@/shared/i18n/id';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

/** Panduan satu gerakan: otot, alat, langkah, kesalahan umum, alternatif. */
export function ExerciseDetailScreen() {
  const { id = '' } = useParams();
  const { catalog } = useServices();
  const navigate = useNavigate();
  const { data, isPending } = useQuery({
    queryKey: queryKeys.exerciseDetail(id),
    queryFn: () => catalog.detail(id),
  });

  const back = (
    <button
      type="button"
      onClick={() => void navigate(-1)}
      className="flex min-h-11 items-center gap-1 text-sm font-semibold text-accent"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {t.common.back}
    </button>
  );
  if (isPending) return back;
  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <p className="text-muted">{t.library.notFound}</p>
      </div>
    );
  }

  const { exercise, guide, unavailable, progressionLocked, alternatives } = data;
  return (
    <div className="flex flex-col gap-3.5">
      {back}
      <ScreenHeader title={exercise.name} eyebrow={t.movement[exercise.pattern]} />
      {unavailable && <Chip tone="warn">{t.library.unavailable[unavailable]}</Chip>}
      {!unavailable && progressionLocked && <Chip tone="neutral">{t.library.locked}</Chip>}

      <Card>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">{t.library.primary}</dt>
          <dd className="font-semibold">
            {exercise.primaryMuscles.map((m) => t.muscle[m]).join(', ')}
          </dd>
          {exercise.secondaryMuscles.length > 0 && (
            <>
              <dt className="text-muted">{t.library.secondary}</dt>
              <dd>{exercise.secondaryMuscles.map((m) => t.muscle[m]).join(', ')}</dd>
            </>
          )}
          <dt className="text-muted">{t.library.equipmentNeeded}</dt>
          <dd>
            {exercise.equipment.length > 0
              ? exercise.equipment.map((q) => t.equipment[q]).join(', ')
              : t.library.noEquipment}
          </dd>
        </dl>
      </Card>

      {guide && (
        <>
          <Card>
            <h2 className="font-sans label-caps">{t.library.steps}</h2>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm">
              {guide.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Card>
          <Card>
            <h2 className="font-sans label-caps">{t.library.mistakes}</h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
              {guide.commonMistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {alternatives.length > 0 && (
        <Card>
          <h2 className="font-sans label-caps">{t.library.alternatives}</h2>
          <ul className="flex flex-col divide-y divide-line">
            {alternatives.map((alt) => (
              <li key={alt.id}>
                <Link
                  to={`/gerakan/${alt.id}`}
                  className="flex min-h-11 items-center py-2 font-semibold"
                >
                  {alt.name}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
