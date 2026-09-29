import { useSearchParams } from 'react-router';
import { PROGRESS_RANGES, type ProgressRange } from '@/domain/progress/range';
import { t } from '@/shared/i18n/id';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { BodySection } from './sections/BodySection';
import { PhotosSection } from './sections/PhotosSection';
import { StrengthSection } from './sections/StrengthSection';
import { VolumeSection } from './sections/VolumeSection';

const SECTIONS = ['strength', 'body', 'volume', 'photos'] as const;
type Section = (typeof SECTIONS)[number];

/** Nilai di URL (bahasa Indonesia, seperti path aplikasi). */
const SECTION_SLUG = {
  strength: 'kekuatan',
  body: 'tubuh',
  volume: 'volume',
  photos: 'foto',
} as const satisfies Record<Section, string>;
const RANGE_SLUG = { '4w': '4', '12w': '12', all: 'semua' } as const satisfies Record<
  ProgressRange,
  string
>;
const DEFAULT_RANGE: ProgressRange = '12w';

function fromSlug<T extends string>(slugs: Record<T, string>, value: string | null, fallback: T) {
  return (Object.keys(slugs) as T[]).find((key) => slugs[key] === value) ?? fallback;
}

/**
 * Progres: Kekuatan · Tubuh · Volume · Foto. docs/fitur/07-progres.md
 * Bagian dan rentang disimpan di URL agar tetap sama saat kembali dari detail gerakan.
 */
export function ProgressScreen() {
  const [params, setParams] = useSearchParams();
  const section = fromSlug<Section>(SECTION_SLUG, params.get('bagian'), 'strength');
  const range = fromSlug<ProgressRange>(RANGE_SLUG, params.get('rentang'), DEFAULT_RANGE);

  const update = (key: 'bagian' | 'rentang', value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(key, value);
        return next;
      },
      { replace: true },
    );

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader title={t.progress.title} />
      <SegmentedControl
        label={t.progress.sectionsLabel}
        options={SECTIONS.map((value) => ({ value, label: t.progress.sections[value] }))}
        value={section}
        onChange={(value) => update('bagian', SECTION_SLUG[value])}
      />
      {section !== 'photos' && (
        <SegmentedControl
          label={t.progress.rangeLabel}
          options={PROGRESS_RANGES.map((value) => ({ value, label: t.progress.ranges[value] }))}
          value={range}
          onChange={(value) => update('rentang', RANGE_SLUG[value])}
        />
      )}
      {section === 'strength' && <StrengthSection range={range} />}
      {section === 'body' && <BodySection range={range} />}
      {section === 'volume' && <VolumeSection range={range} />}
      {section === 'photos' && <PhotosSection />}
    </div>
  );
}
