import { createContext, ReactNode, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { TEAM_CONTACTS } from '../config';
import { getWhatsAppLink } from '../utils/whatsapp';

interface WhatsAppContactContextValue {
  openWhatsAppSelector: (message: string) => void;
}

const WhatsAppContactContext = createContext<WhatsAppContactContextValue | undefined>(undefined);
const fallbackContext: WhatsAppContactContextValue = { openWhatsAppSelector: () => undefined };
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function WhatsAppContactProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => setMessage(null), []);
  const openWhatsAppSelector = useCallback((nextMessage: string) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMessage(nextMessage);
  }, []);

  useEffect(() => {
    if (message === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [close, message]);

  const selectContact = (number: string) => {
    if (message === null) return;
    window.open(getWhatsAppLink(message, number), 'whatsapp', 'noopener,noreferrer');
    close();
  };

  return (
    <WhatsAppContactContext.Provider value={{ openWhatsAppSelector }}>
      {children}
      {message !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-brand-navy-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-feature border border-white/10 bg-brand-navy-900 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-white shadow-floating sm:max-w-lg sm:rounded-feature sm:p-7"
          >
            <button ref={closeButtonRef} type="button" onClick={close} aria-label="Fechar seleção de contato" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-control text-slate-300 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" aria-hidden="true" /></button>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-cyan-400">WhatsApp</p>
            <h2 id={titleId} className="mt-2 pr-12 font-display text-2xl font-bold">Com quem você deseja falar?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">Escolha um dos contatos da MG Climatização para continuar pelo WhatsApp.</p>
            <div className="mt-6 grid gap-3">
              {Object.values(TEAM_CONTACTS).map((contact) => (
                <button key={contact.number} type="button" onClick={() => selectContact(contact.number)} className="flex min-h-16 w-full items-center gap-4 rounded-card border border-white/10 bg-brand-navy-950/55 p-4 text-left transition-colors hover:border-brand-cyan-600/60 hover:bg-brand-cyan-600/10">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cyan-600 text-white"><MessageCircle className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-bold text-white">{contact.name}</span><span className="mt-0.5 block text-sm text-slate-300">{contact.role}</span><span className="mt-1 block text-sm font-semibold text-brand-cyan-400">{contact.displayNumber}</span><span className="mt-3 inline-flex min-h-11 items-center rounded-control bg-brand-orange-500 px-4 font-bold text-brand-navy-950">Falar com {contact.name.split(' ')[0]}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </WhatsAppContactContext.Provider>
  );
}

export function useWhatsAppContact() {
  const context = useContext(WhatsAppContactContext);
  return context ?? fallbackContext;
}
