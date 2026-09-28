import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ToastContext } from './toastContext';

interface ToastMessage {
  id: number;
  title: string;
  lines?: string[];
}

const TOAST_MS = 5000;

/** Konfirmasi singkat di atas tab bar ("Tersimpan", ringkasan perubahan program). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null);

  const show = useCallback((title: string, lines?: string[]) => {
    setMessage({ id: Date.now(), title, ...(lines && { lines }) });
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
        className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4"
      >
        {message && (
          <div
            key={message.id}
            role="status"
            className="pointer-events-auto w-full max-w-[528px] rounded-2xl bg-ink px-4 py-3 text-sm text-ground shadow-float"
          >
            <p className="font-semibold">{message.title}</p>
            {message.lines?.map((line) => (
              <p key={line} className="opacity-80">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
