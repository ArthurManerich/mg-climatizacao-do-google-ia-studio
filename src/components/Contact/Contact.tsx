import React from 'react';
import { Wind, Phone, MapPin, Clock } from 'lucide-react';
import { getWhatsAppLink, DEFAULT_QUICK_QUOTE_MESSAGE } from '../../utils/whatsapp';
import { useSettings } from '../../context/SettingsContext';

export default function Contact() {
  const { settings } = useSettings();

  return (
    <section id="contato" className="py-12 sm:py-16 bg-[#002E5C] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#0096D6]/10 blur-3xl pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <Wind className="w-10 h-10 sm:w-12 sm:h-12 text-[#00B2FF] mx-auto mb-3 sm:mb-4 animate-pulse" />
        <h2 className="text-2xl sm:text-4xl font-extrabold font-display mb-2 sm:mb-3">
          Solicitar Orçamento
        </h2>
        <p className="text-slate-200 text-xs sm:text-base max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
          Atendimento rápido e direto pelo WhatsApp em Blumenau e região.
        </p>

        {/* 3 Pillars: WhatsApp, Cidade, Horario */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 text-left">
          <a 
            href={getWhatsAppLink(settings.whatsapp_message || DEFAULT_QUICK_QUOTE_MESSAGE, settings.whatsapp_number)}
            target="whatsapp"
            rel="noopener noreferrer"
            className="p-4 bg-[#002447] hover:bg-[#001D38] border border-slate-700/80 rounded-2xl transition-all group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0096D6]/20 text-[#00B2FF] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">WhatsApp</p>
              <p className="text-xs sm:text-sm font-bold text-white truncate">{settings.phone || '(47) 99746-4218'}</p>
            </div>
          </a>

          <div className="p-4 bg-[#002447] border border-slate-700/80 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5A524]/20 text-[#F5A524] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Cidade</p>
              <p className="text-xs sm:text-sm font-bold text-white truncate">{settings.address || 'Blumenau e Região'}</p>
            </div>
          </div>

          <div className="p-4 bg-[#002447] border border-slate-700/80 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0096D6]/20 text-[#00B2FF] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Horário</p>
              <p className="text-xs sm:text-sm font-bold text-white truncate">Seg a Sáb: 08h às 18h</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <a 
            href={getWhatsAppLink(settings.whatsapp_message || DEFAULT_QUICK_QUOTE_MESSAGE, settings.whatsapp_number)}
            target="whatsapp"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#0096D6] hover:bg-[#0082BA] text-white font-bold px-8 py-4 rounded-xl text-sm sm:text-base shadow-lg hover:shadow-[#0096D6]/20 transform hover:-translate-y-0.5 transition-all min-h-[48px]"
          >
            <Phone className="w-5 h-5 fill-current animate-bounce flex-shrink-0" />
            <span className="uppercase tracking-wide">Solicitar Orçamento no WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}

