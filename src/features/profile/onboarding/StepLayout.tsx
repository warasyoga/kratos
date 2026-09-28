import type { ReactNode } from 'react';
import { t } from '@/shared/i18n/id';
import { Button } from '@/shared/ui/Button';
import { StepProgress } from '@/shared/ui/StepProgress';

export interface StepLayoutProps {
  title: string;
  body?: string;
  progress?: { step: number; total: number } | undefined;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  onBack?: (() => void) | undefined;
  secondary?: ReactNode;
}

/** Kerangka satu langkah onboarding: judul, isi yang bisa digulir, tombol di bawah (terjangkau jempol). */
export function StepLayout({
  title,
  body,
  progress,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  onBack,
  secondary,
}: StepLayoutProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-[560px] flex-col px-4 pt-safe">
      <div className="flex flex-1 flex-col gap-5 pb-6">
        {progress && (
          <StepProgress
            step={progress.step}
            total={progress.total}
            label={t.common.stepOf(progress.step, progress.total)}
          />
        )}
        <header className="flex flex-col gap-2">
          <h1 className="text-[34px] leading-none uppercase">{title}</h1>
          {body && <p className="text-muted">{body}</p>}
        </header>
        {children}
      </div>
      <div className="sticky bottom-0 flex flex-col gap-2 bg-ground pt-3 pb-safe">
        <div className="flex gap-2">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="flex-1">
              {t.common.back}
            </Button>
          )}
          <Button onClick={onPrimary} disabled={primaryDisabled} className="flex-[2]">
            {primaryLabel}
          </Button>
        </div>
        {secondary}
      </div>
    </div>
  );
}
