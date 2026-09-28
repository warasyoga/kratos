import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { t } from '@/shared/i18n/id';

export interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Tombol aksi di bawah (tetap terlihat saat isi digulir). */
  footer?: ReactNode;
}

/** Panel dari bawah layar untuk form singkat. Tutup dengan Escape, tombol X, atau ketuk latar. */
export function Sheet({ open, title, onClose, children, footer }: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        aria-label={t.common.close}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[90dvh] w-full max-w-[560px] flex-col rounded-t-[22px] bg-surface outline-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 id={titleId} className="text-[22px] uppercase">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="grid size-11 place-items-center rounded-full text-muted"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="border-t border-line px-4 pt-3 pb-safe">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
