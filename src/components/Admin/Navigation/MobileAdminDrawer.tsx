import React, { useEffect } from 'react';
import { ExternalLink, LogOut, X } from 'lucide-react';
import type { TabType } from '../Hooks/useAdminData';
import { MOBILE_MORE_DESTINATIONS } from './adminNavigation';

interface MobileAdminDrawerProps {
  open: boolean;
  activeTab: TabType;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  onLogout: () => void | Promise<void>;
}

export function MobileAdminDrawer({ open, activeTab, onClose, onSelectTab, onLogout }: MobileAdminDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 md:hidden" role="presentation">
      <button
        type="button"
        aria-label="Fechar menu administrativo"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mais opções administrativas"
        className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col overflow-y-auto border-r border-white/10 bg-[#1A1A1A] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div>
            <p className="text-base font-extrabold text-[#F5F5F5]">MG Climatização</p>
            <p className="mt-1 text-xs font-semibold text-[#A8A8A8]">Mais opções</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#242424] text-[#E0E0E0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Destinos adicionais" className="flex-1 space-y-2 py-5">
          {MOBILE_MORE_DESTINATIONS.map(destination => {
            const Icon = destination.icon;
            const active = activeTab === destination.id;
            return (
              <button
                key={destination.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelectTab(destination.id)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 text-left text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6] ${
                  active
                    ? 'border-[#0096D6]/50 bg-[#0096D6]/15 text-[#F5F5F5]'
                    : 'border-transparent text-[#E0E0E0] hover:bg-white/6'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-[#00B2FF]' : 'text-[#A8A8A8]'}`} aria-hidden="true" />
                {destination.shortLabel}
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/8 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold text-[#E0E0E0] hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6]"
          >
            <ExternalLink className="h-5 w-5 text-[#A8A8A8]" aria-hidden="true" /> Ver site
          </a>
          <button
            type="button"
            onClick={() => {
              onClose();
              void onLogout();
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold text-rose-300 hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" /> Sair
          </button>
        </div>
      </aside>
    </div>
  );
}
