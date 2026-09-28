import { Outlet } from 'react-router';
import { t } from '@/shared/i18n/id';
import { TabBar } from '@/shared/ui/TabBar';
import { navItems } from './navigation';

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-full max-w-[560px] flex-col">
      {/* pb-28 memberi ruang agar konten terakhir tidak tertutup tab bar. */}
      <main className="flex-1 px-4 pt-safe pb-28">
        <Outlet />
      </main>
      <TabBar items={navItems} label={t.nav.label} />
    </div>
  );
}
