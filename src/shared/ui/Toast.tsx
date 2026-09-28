import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ToastContext, type ToastAction } from './toastContext';

interface ToastMessage {
  id: number;
  title: string;
  lines?: string[];
  action?: ToastAction;
}

const TOAST_MS = 5000;

/** Konfirmasi singkat di atas tab bar ("Tersimpan", ringkasan perubahan, tombol "Urungkan"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null);

  const show = useCallback((title: string, lines?: string[], action?: ToastAction) => {
    setMessage({ id: Date.now(), title, ...(lines && { lines }), ...(action && { action }) });
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        // Di atas layar: tidak menutupi timer istirahat, tab bar, atau tombol panel.
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-safe"
      >
        {message && (
          <div
            key={message.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-[528px] items-start gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-ground shadow-float"
          >
            <div className="flex-1">
              <p className="font-semibold">{message.title}</p>
              {message.lines?.map((line) => (
                <p key={line} className="opacity-80">
                  {line}
                </p>
              ))}
            </div>
            {message.action && (
              <button
                type="button"
                onClick={() => {
                  message.action?.onClick();
                  setMessage(null);
                }}
                className="min-h-11 shrink-0 rounded-lg px-2 font-bold text-plate-yellow"
              >
                {message.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
