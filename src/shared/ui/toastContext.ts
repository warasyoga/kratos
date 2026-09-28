import { createContext, useContext } from 'react';

export type ShowToast = (title: string, lines?: string[]) => void;

export const ToastContext = createContext<ShowToast | null>(null);

/** Tampilkan toast; harus di dalam ToastProvider. */
export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return show;
}
