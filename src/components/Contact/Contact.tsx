import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useWhatsAppContact } from '../../context/WhatsAppContactContext';
import { TEAM_CONTACTS } from '../../config';
import { DEFAULT_QUICK_QUOTE_MESSAGE } from '../../utils/whatsapp';

export default function Contact() {
  const { settings } = useSettings();
  const { openWhatsAppSelector } = useWhatsAppContact();
  const whatsappMessage = settings.whatsapp_message || DEFAULT_QUICK_QUOTE_MESSAGE;
  const region = settings.address || 'Blumenau e região';

  return (
    <section id="contato" className="relative overflow-hidden bg-brand-navy-950 py-section text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(0,178,255,0.16),transparent_34%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-gutter sm:px-gutter-lg lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:items-end lg:gap-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-cyan-400">Contato</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">Precisa de atendimento em climatização?</h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">Atendemos Blumenau e região. Dependendo da localização, pode haver taxa adicional de deslocamento.</p>
          <div className="mt-6 flex flex-col gap-2 text-sm text-slate-200 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {Object.values(TEAM_CONTACTS).map((contact) => <p key={contact.number} className="inline-flex min-h-11 items-center gap-2"><Phone aria-hidden="true" className="h-4 w-4 text-brand-cyan-400" /><span><span className="block font-semibold">{contact.name}</span><span className="block">{contact.displayNumber}</span></span></p>)}
            <p className="inline-flex min-h-11 items-center gap-2"><MapPin aria-hidden="true" className="h-4 w-4 text-brand-cyan-400" /><span>{region}</span></p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-stretch">
          <button type="button" onClick={() => openWhatsAppSelector(whatsappMessage)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-brand-orange-500 px-6 py-3.5 text-sm font-bold text-brand-navy-950 transition-colors hover:bg-brand-orange-600 sm:text-base"><Phone aria-hidden="true" className="h-5 w-5" /> Solicitar orçamento</button>
          <a href="#orcamento-online" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control border border-white/20 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/[0.08] sm:text-base">Montar solicitação <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </div>
      </div>
    </section>
  );
}
