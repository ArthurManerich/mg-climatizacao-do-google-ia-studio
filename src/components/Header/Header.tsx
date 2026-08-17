import React, { useState } from 'react';
import { Wind, Phone, Menu, X, ShieldCheck, UserCheck } from 'lucide-react';
import { getWhatsAppLink } from '../../utils/whatsapp';
import { useSettings } from '../../context/SettingsContext';

interface HeaderProps {
  onOpenAccessModal?: () => void;
}

export default function Header({ onOpenAccessModal }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSettings();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-[#E2E8F0] shadow-sm" id="header">
      {/* Top Banner for Interface Selector */}
      {onOpenAccessModal && (
        <div className="bg-[#002E5C] text-slate-200 px-3 sm:px-4 py-1.5 text-xs flex items-center justify-between border-b border-[#001D3D]">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs min-w-0">
              <UserCheck className="w-3.5 h-3.5 text-[#00B2FF] shrink-0" />
              <span className="truncate">Modo Atual: <strong className="text-white">Cliente (Sem Admin)</strong></span>
            </span>
            <button 
              onClick={onOpenAccessModal}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#F5A524] hover:text-[#00B2FF] underline underline-offset-2 transition-colors cursor-pointer shrink-0 min-h-[32px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Mudar Modo / Login</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 flex-shrink-1 py-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center font-bold text-lg shadow-sm border border-[#E2E8F0] group-hover:bg-[#002E5C] transition-colors duration-300 flex-shrink-0">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.company_name} decoding="async" fetchPriority="high" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
              ) : (
                <Wind className="w-5 h-5 text-[#0096D6] group-hover:text-white transition-colors" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-xl font-extrabold font-display tracking-tight text-[#002E5C] leading-none truncate max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                {settings.company_name}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#0096D6] mt-0.5 sm:mt-1">
                Climatização
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7">
            <a href="#inicio" className="text-xs lg:text-sm font-medium text-slate-600 hover:text-[#002E5C] transition-colors">Início</a>
            <a href="#servicos" className="text-xs lg:text-sm font-medium text-slate-600 hover:text-[#002E5C] transition-colors">Serviços</a>
            
            {/* Highlighted Orçamento Online */}
            <a 
              href="#orcamento-online" 
              className="text-xs lg:text-sm font-extrabold text-[#002E5C] bg-[#E6F5FC] hover:bg-[#d2edfa] border border-[#0096D6]/30 px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#0096D6] animate-pulse"></span>
              <span>Orçamento Online</span>
            </a>

            <a href="#antes-depois" className="text-xs lg:text-sm font-medium text-slate-600 hover:text-[#002E5C] transition-colors">Antes & Depois</a>
            <a href="#portfolio" className="text-xs lg:text-sm font-medium text-slate-600 hover:text-[#002E5C] transition-colors">Meu Portfólio</a>
            <a href="#faq" className="text-xs lg:text-sm font-medium text-slate-600 hover:text-[#002E5C] transition-colors">Dúvidas</a>
          </nav>

          {/* Desktop Right Button */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href={getWhatsAppLink(settings.whatsapp_message || "Olá! Gostaria de solicitar um orçamento para climatização.", settings.whatsapp_number)}
              target="whatsapp"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Phone className="w-4 h-4 fill-current" /> Falar no WhatsApp
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#002E5C] hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6] transition-colors"
            aria-label={mobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-b border-[#E2E8F0] bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 flex flex-col gap-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {onOpenAccessModal && (
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAccessModal();
              }}
              className="text-xs font-bold text-[#002E5C] bg-[#E6F5FC] hover:bg-[#d0ecf9] border border-[#0096D6]/30 py-3 px-3.5 rounded-xl mb-3 flex items-center justify-between transition-colors min-h-[44px]"
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#0096D6]" />
                <span>Modo Atual: <strong>Cliente</strong></span>
              </span>
              <span className="text-[#0096D6] font-extrabold underline text-[11px]">Mudar / Login</span>
            </button>
          )}

          <a 
            href="#inicio" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold min-h-[48px] px-3 flex items-center gap-3 text-[#002E5C] hover:text-[#0096D6] hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100"
          >
            <span>Início</span>
          </a>
          <a 
            href="#servicos" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold min-h-[48px] px-3 flex items-center gap-3 text-[#002E5C] hover:text-[#0096D6] hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100"
          >
            <span>Serviços</span>
          </a>
          <a 
            href="#orcamento-online" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-extrabold min-h-[48px] px-3.5 flex items-center justify-between text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 rounded-xl transition-colors border-b border-slate-100 my-1"
          >
            <span>Orçamento Online</span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#0096D6] text-white px-2 py-0.5 rounded-md">Simular</span>
          </a>
          <a 
            href="#antes-depois" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold min-h-[48px] px-3 flex items-center gap-3 text-[#002E5C] hover:text-[#0096D6] hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100"
          >
            <span>Antes & Depois</span>
          </a>
          <a 
            href="#portfolio" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold min-h-[48px] px-3 flex items-center gap-3 text-[#002E5C] hover:text-[#0096D6] hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100"
          >
            <span>Meu Portfólio</span>
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold min-h-[48px] px-3 flex items-center gap-3 text-[#002E5C] hover:text-[#0096D6] hover:bg-slate-50 rounded-xl transition-colors mb-3"
          >
            <span>Dúvidas</span>
          </a>
          
          <a 
            href={getWhatsAppLink(settings.whatsapp_message || "Olá! Gostaria de solicitar um orçamento para climatização.", settings.whatsapp_number)}
            target="whatsapp"
            rel="noopener noreferrer"
            className="w-full text-center bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white min-h-[50px] py-3.5 px-4 rounded-2xl text-base font-extrabold shadow-md flex items-center justify-center gap-2.5 transition-all mt-1"
          >
            <Phone className="w-5 h-5 fill-current" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
}
