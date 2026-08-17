import React from 'react';
import { Wind, Heart, Instagram, Facebook, MapPin, Mail, Phone } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#001D38] text-slate-300 py-10 sm:py-12 border-t border-[#002E5C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pb-8 border-b border-[#002E5C] text-sm">
          
          {/* Logo & Description */}
          <div className="space-y-3 sm:space-y-4 col-span-1">
            <a href="#inicio" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#002E5C] text-white flex items-center justify-center font-bold text-base shadow-sm overflow-hidden flex-shrink-0 border border-[#0096D6]/40">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt={settings.company_name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Wind className="w-4 h-4 text-[#00B2FF]" />
                )}
              </div>
              <span className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
                {settings.company_name}
              </span>
            </a>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instalação, manutenção, higienização e carga de gás para ar-condicionado. Atendimento residencial e empresarial com garantia e nota fiscal.
            </p>
            
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-[#002E5C] hover:bg-[#0096D6] hover:text-white flex items-center justify-center transition-all text-slate-300 min-w-[36px] min-h-[36px]" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-[#002E5C] hover:bg-[#0096D6] hover:text-white flex items-center justify-center transition-all text-slate-300 min-w-[36px] min-h-[36px]" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Acesso Rápido</h4>
            <div className="flex flex-col gap-1.5 text-xs font-semibold">
              <a href="#inicio" className="hover:text-white transition-colors py-1">Início</a>
              <a href="#servicos" className="hover:text-white transition-colors py-1">Serviços</a>
              <a href="#antes-depois" className="hover:text-white transition-colors py-1">Antes & Depois</a>
              <a href="#portfolio" className="hover:text-white transition-colors py-1">Meu Portfólio</a>
              <a href="#orcamento-online" className="hover:text-white transition-colors py-1">Simular Preço</a>
              <a href="#faq" className="hover:text-white transition-colors py-1">Dúvidas</a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 col-span-1 sm:col-span-2 md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Contato & Localização</h4>
            <div className="space-y-2.5 text-xs">
              {settings.address && (
                <p className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-[#0096D6] shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </p>
              )}
              {settings.email && (
                <p className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-[#0096D6] shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors py-0.5">{settings.email}</a>
                </p>
              )}
              {settings.phone && (
                <p className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-[#0096D6] shrink-0" />
                  <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="hover:text-white transition-colors py-1 underline-offset-2 hover:underline">
                    {settings.phone}
                  </a>
                </p>
              )}
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-400 text-center">
          <p>© {new Date().getFullYear()} {settings.company_name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="/login" className="hover:text-[#0096D6] transition-colors text-[11px] font-medium text-slate-400">
              Área Restrita (Admin)
            </a>
          </div>
          <p className="flex items-center gap-1 justify-center">
            Feito com dedicação e <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> para Blumenau e Região.
          </p>
        </div>
      </div>
    </footer>
  );
}
