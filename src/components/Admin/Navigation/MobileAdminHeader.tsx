import React from 'react';
import { Menu } from 'lucide-react';
import type { TabType } from '../Hooks/useAdminData';
import { getAdminDestination } from './adminNavigation';
import { MobileProfileMenu } from './MobileProfileMenu';

interface MobileAdminHeaderProps {
  activeTab: TabType;
  email: string;
  onOpenDrawer: () => void;
  onLogout: () => void | Promise<void>;
}

export function MobileAdminHeader({ activeTab, email, onOpenDrawer, onLogout }: MobileAdminHeaderProps) {
  const title = getAdminDestination(activeTab).shortLabel;

  return (
    <header className="sticky top-0 z-40 grid h-16 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 border-b border-white/8 bg-[#1A1A1A]/95 px-4 backdrop-blur md:hidden">
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Abrir menu administrativo"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#242424] text-[#E0E0E0] transition-colors hover:bg-[#2B2B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6]"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <h1 className="truncate text-center text-base font-extrabold text-[#F5F5F5]">{title}</h1>
      <MobileProfileMenu email={email} onLogout={onLogout} />
    </header>
  );
}
