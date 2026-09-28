import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import type { Services } from '@/application/services';
import { ServicesContext } from '@/application/ServicesContext';
import { ToastProvider } from '@/shared/ui/Toast';

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // Data ada di HP, bukan di server: jangan tunda query saat offline,
      // dan jangan ambil ulang otomatis; perubahan data memicu invalidasi eksplisit.
      queries: { networkMode: 'always', staleTime: Infinity, retry: false },
      mutations: { networkMode: 'always', retry: false },
    },
  });
}

export function AppProviders({ services, children }: { services: Services; children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ServicesContext.Provider value={services}>
        <ToastProvider>{children}</ToastProvider>
      </ServicesContext.Provider>
    </QueryClientProvider>
  );
}
