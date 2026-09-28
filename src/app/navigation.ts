import { CalendarDays, ChartNoAxesColumn, Dumbbell, House, UserRound } from 'lucide-react';
import { t } from '@/shared/i18n/id';
import type { TabItem } from '@/shared/ui/TabBar';

export const paths = {
  today: '/',
  program: '/program',
  workout: '/latihan',
  progress: '/progres',
  profile: '/profil',
  onboarding: '/onboarding',
} as const;

export const navItems: readonly TabItem[] = [
  { to: paths.today, label: t.nav.today, icon: House },
  { to: paths.program, label: t.nav.program, icon: CalendarDays },
  { to: paths.workout, label: t.nav.workout, icon: Dumbbell, emphasized: true },
  { to: paths.progress, label: t.nav.progress, icon: ChartNoAxesColumn },
  { to: paths.profile, label: t.nav.profile, icon: UserRound },
];
