import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, ShieldCheck, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useWhatsAppContact } from '../../context/WhatsAppContactContext';

interface HeaderProps {
  onOpenAccessModal?: () => void;
}

const OFFICIAL_HEADER_LOGO = '/brand/logo-96.webp';

const navigation = [
  { label: 'Início', href: '#inicio' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Antes & Depois', href: '#antes-depois' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Dúvidas', href: '#faq' },
  { label: 'Contato', href: '#contato' },
];

export default function Header({ onOpenAccessModal }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { settings } = useSettings();
  const { openWhatsAppSelector } = useWhatsAppContact();
  const whatsappMessage = settings.whatsapp_message || 'Olá! Gostaria de solicitar um orçamento para climatização.';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-navy-950/95 text-white shadow-card backdrop-blur-md"
      id="header"
    >
      <div className="mx-auto max-w-7xl px-gutter sm:px-gutter-lg lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <a
            href="#inicio"
            className="flex min-w-0 items-center gap-2.5 rounded-control focus-visible:outline-offset-4 sm:gap-3"
            aria-label="MG Climatização — início"
          >
            <img
              src={settings.logo_url || OFFICIAL_HEADER_LOGO}
              alt="Logo da MG Climatização"
              width="96"
              height="96"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(OFFICIAL_HEADER_LOGO)) {
                  event.currentTarget.src = OFFICIAL_HEADER_LOGO;
                }
              }}
              className="h-11 w-11 shrink-0 rounded-control border border-white/10 bg-brand-navy-950 object-contain sm:h-12 sm:w-12"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-bold leading-tight text-white sm:text-lg">
                {settings.company_name}
              </span>
              <span className="block text-xs font-medium leading-tight text-brand-cyan-400">Climatização</span>
            </span>
          </a>

          <nav className="hidden items-center gap-4 xl:flex" aria-label="Navegação principal">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-control px-1 py-3 text-sm font-medium text-slate-200 transition-colors hover:text-brand-cyan-400"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            {onOpenAccessModal && (
              <button
                type="button"
                onClick={onOpenAccessModal}
                className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Alterar modo de acesso ou fazer login"
              >
                <ShieldCheck className="h-4 w-4 text-brand-cyan-400" aria-hidden="true" />
                <span>Acesso</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => openWhatsAppSelector(whatsappMessage)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-brand-orange-500 px-4 text-sm font-bold text-brand-navy-950 shadow-card transition-colors hover:bg-brand-orange-600"
            >
              Solicitar orçamento
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openWhatsAppSelector(whatsappMessage)}
            className="ml-auto hidden min-h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-brand-orange-500 px-4 text-sm font-bold text-brand-navy-950 shadow-card transition-colors hover:bg-brand-orange-600 md:inline-flex xl:hidden"
          >
            Solicitar orçamento
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-control border border-white/10 text-white transition-colors hover:bg-white/10 xl:hidden"
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-white/10 bg-brand-navy-950 px-gutter pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-floating xl:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col" aria-label="Navegação mobile">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="flex min-h-12 items-center rounded-control px-3 text-base font-medium text-slate-100 transition-colors hover:bg-white/5 hover:text-brand-cyan-400"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-3 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
              <a
                href="#orcamento-online"
                onClick={closeMobileMenu}
                className="inline-flex min-h-12 items-center justify-center rounded-control border border-brand-cyan-600/60 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-cyan-600/15"
              >
                Montar solicitação
              </a>
              <button
                type="button"
                onClick={() => { closeMobileMenu(); openWhatsAppSelector(whatsappMessage); }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-brand-orange-500 px-4 text-sm font-bold text-brand-navy-950 transition-colors hover:bg-brand-orange-600"
              >
                Solicitar orçamento
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {onOpenAccessModal && (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  menuButtonRef.current?.focus();
                  onOpenAccessModal();
                }}
                className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ShieldCheck className="h-4 w-4 text-brand-cyan-400" aria-hidden="true" />
                Alterar modo de acesso ou fazer login
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
