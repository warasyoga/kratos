import { clsx, type ClassValue } from 'clsx';

/** Gabungkan kelas CSS secara kondisional: cn('p-4', isActive && 'text-accent'). */
export function cn(...classes: ClassValue[]): string {
  return clsx(classes);
}
