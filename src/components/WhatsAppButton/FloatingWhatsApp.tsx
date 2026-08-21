import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useWhatsAppContact } from '../../context/WhatsAppContactContext';
import { DEFAULT_QUICK_QUOTE_MESSAGE } from '../../utils/whatsapp';

export default function FloatingWhatsApp() {
  const { settings } = useSettings();
  const { openWhatsAppSelector } = useWhatsAppContact();

  return (
    <button
      type="button"
      onClick={() => openWhatsAppSelector(settings.whatsapp_message || DEFAULT_QUICK_QUOTE_MESSAGE)}
      aria-label="Solicitar orçamento no WhatsApp"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-emerald-600 text-white shadow-floating transition-colors hover:bg-emerald-700 active:bg-emerald-800 sm:h-13 sm:w-auto sm:min-w-13 sm:gap-2 sm:px-4"
      id="floating-whatsapp-btn"
    >
      <MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span className="hidden text-sm font-bold sm:inline">WhatsApp</span>
    </button>
  );
}
