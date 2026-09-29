import { useState } from 'react';
import type { ProgressPhoto } from '@/domain/progress/photo';
import { t } from '@/shared/i18n/id';
import { formatShortDate } from '@/shared/lib/format';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { Sheet } from '@/shared/ui/Sheet';
import { PhotoImage } from './PhotoImage';

type Mode = 'slider' | 'side';

/** Bandingkan dua foto: geser (foto lama di kiri garis) atau berdampingan. */
export function PhotoCompareSheet({
  before,
  after,
  onClose,
}: {
  before: ProgressPhoto;
  after: ProgressPhoto;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>('slider');
  const [position, setPosition] = useState(50);

  return (
    <Sheet open title={t.progress.compareTitle} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <SegmentedControl
          label={t.progress.compareTitle}
          options={(['slider', 'side'] as const).map((value) => ({
            value,
            label: t.progress.compareModes[value],
          }))}
          value={mode}
          onChange={setMode}
        />
        <div className="flex justify-between text-xs font-semibold text-muted">
          <span>{formatShortDate(before.logDate)}</span>
          <span>{formatShortDate(after.logDate)}</span>
        </div>
        {mode === 'slider' ? (
          <>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-xl">
              <PhotoImage photo={after} size="full" className="absolute inset-0" />
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
              >
                <PhotoImage photo={before} size="full" className="size-full" />
              </div>
              <span
                aria-hidden
                className="absolute inset-y-0 w-0.5 bg-surface shadow-float"
                style={{ left: `${position}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={position}
              aria-label={t.progress.compareSlider}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <PhotoImage photo={before} size="full" className="aspect-[3/4] rounded-xl" />
            <PhotoImage photo={after} size="full" className="aspect-[3/4] rounded-xl" />
          </div>
        )}
      </div>
    </Sheet>
  );
}
