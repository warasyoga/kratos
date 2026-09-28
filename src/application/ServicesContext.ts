import { createContext, useContext } from 'react';
import type { Services } from './services';

/**
 * Jembatan antara UI dan lapisan application. Satu-satunya file di application yang
 * boleh memakai React; use case sendiri tetap TypeScript murni.
 */
export const ServicesContext = createContext<Services | null>(null);

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices harus dipakai di dalam AppProviders');
  return services;
}
