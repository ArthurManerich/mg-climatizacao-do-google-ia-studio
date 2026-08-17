import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { TabType } from '../Hooks/useAdminData';
import { isMoreDestination, MOBILE_PRIMARY_DESTINATIONS } from './adminNavigation';

interface MobileBottomNavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenDrawer: () => void;
}

export function MobileBottomNavigation({ activeTab, onSelectTab, onOpenDrawer }: MobileBottomNavigationProps) {
  const moreActive = isMoreDestination(activeTab);

  return (
    <nav
      aria-label="Navegação principal administrativa"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/10 bg-[#1A1A1A]/98 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur md:hidden"
    >
      {MOBILE_PRIMARY_DESTINATIONS.map(destination => {
        const Icon = destination.icon;
        const active = activeTab === destination.id;
        return (
          <button
            key={destination.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelectTab(destination.id)}
            className={`relative flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0096D6] ${
              active ? 'text-[#00B2FF]' : 'text-[#A8A8A8]'
            }`}
          >
            {active && <span className="absolute top-1 h-1 w-8 rounded-full bg-[#0096D6]" aria-hidden="true" />}
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="max-w-full truncate">{destination.bottomLabel}</span>
          </button>
        );
      })}
      <button
        type="button"
        aria-current={moreActive ? 'page' : undefined}
        aria-label="Mais opções"
        onClick={onOpenDrawer}
        className={`relative flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0096D6] ${
          moreActive ? 'text-[#00B2FF]' : 'text-[#A8A8A8]'
        }`}
      >
        {moreActive && <span className="absolute top-1 h-1 w-8 rounded-full bg-[#0096D6]" aria-hidden="true" />}
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        <span>Mais</span>
      </button>
    </nav>
  );
}
