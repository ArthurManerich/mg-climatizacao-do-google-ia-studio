import React, { useEffect, useState } from 'react';
import { ExternalLink, LogOut, User } from 'lucide-react';

interface MobileProfileMenuProps {
  email: string;
  onLogout: () => void | Promise<void>;
}

export function MobileProfileMenu({ email, onLogout }: MobileProfileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-label={open ? 'Fechar menu da conta' : 'Abrir menu da conta'}
        aria-expanded={open}
        aria-controls="mobile-profile-menu"
        onClick={() => setOpen(current => !current)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#242424] text-[#E0E0E0] transition-colors hover:bg-[#2B2B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6]"
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar menu da conta pelo backdrop"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-profile-menu"
            role="menu"
            className="absolute right-0 top-13 z-50 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#242424] p-2 shadow-2xl"
          >
            <div className="border-b border-white/8 px-3 py-3">
              <p className="text-xs font-semibold text-[#A8A8A8]">Conta administrativa</p>
              <p className="mt-1 truncate text-sm font-bold text-[#F5F5F5]">{email || 'Administrador'}</p>
            </div>
            <a
              role="menuitem"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#E0E0E0] hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6]"
            >
              <ExternalLink className="h-5 w-5" aria-hidden="true" /> Ver site
            </a>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void onLogout();
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-300 hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
