import React from 'react';
import { Phone } from 'lucide-react';
import { getWhatsAppLink, DEFAULT_QUICK_QUOTE_MESSAGE } from '../../utils/whatsapp';
import { useSettings } from '../../context/SettingsContext';

export default function FloatingWhatsApp() {
  const { settings } = useSettings();

  return (
    <a
      href={getWhatsAppLink(settings.whatsapp_message || DEFAULT_QUICK_QUOTE_MESSAGE, settings.whatsapp_number)}
      target="whatsapp"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 sm:p-0 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-emerald-500/30 group sm:w-14 sm:h-14 sm:justify-center"
      id="floating-whatsapp-btn"
    >
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
      </span>
      <Phone className="w-5 h-5 sm:w-7 sm:h-7 fill-current animate-bounce shrink-0" />
      <span className="text-xs font-extrabold sm:hidden tracking-wide whitespace-nowrap">Orçamento WhatsApp</span>
      <span className="sr-only">Solicitar orçamento no WhatsApp</span>
    </a>
  );
}
