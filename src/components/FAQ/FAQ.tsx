import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, HelpCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { faqService } from '../../services/faqService';
import { Faq } from '../../types';
import { getWhatsAppLink } from '../../utils/whatsapp';

export default function FAQ() {
  const { settings } = useSettings();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqList, setFaqList] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadFaq = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await faqService.getAll();
      if (requestId === requestIdRef.current) setFaqList(data);
    } catch (loadError) {
      console.warn('Erro ao carregar FAQ do Supabase:', loadError);
      if (requestId === requestIdRef.current) setError('Não foi possível carregar as perguntas frequentes.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFaq();
    window.addEventListener('online', loadFaq);
    return () => { requestIdRef.current += 1; window.removeEventListener('online', loadFaq); };
  }, [loadFaq]);

  return (
    <section id="faq" className="bg-surface py-section">
      <div className="mx-auto max-w-5xl px-gutter sm:px-gutter-lg">
        <header className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-cyan-700">Dúvidas frequentes</p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Informações para o seu atendimento.</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">Consulte as perguntas publicadas pela MG Climatização.</p>
        </header>

        {error && (
          <div role="alert" className="mb-5 flex flex-col items-start gap-3 rounded-card border border-line bg-surface-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3"><AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-cyan-700" /><p className="text-sm font-semibold text-ink">{error}</p></div>
            <button type="button" onClick={() => void loadFaq()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-cyan-700 disabled:opacity-60"><RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{loading ? 'Tentando novamente…' : 'Tentar novamente'}</button>
          </div>
        )}

        {loading && faqList.length === 0 ? (
          <div role="status" className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-feature border border-line bg-surface-subtle px-5 text-center"><span aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-2 border-brand-cyan-600 border-t-transparent" /><p className="text-sm font-semibold text-ink-muted">Carregando perguntas…</p></div>
        ) : error && faqList.length === 0 ? null : faqList.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-feature border border-line bg-surface-subtle px-5 text-center"><HelpCircle aria-hidden="true" className="mb-3 h-8 w-8 text-brand-cyan-700" /><p className="font-semibold text-ink">Nenhuma pergunta publicada no momento.</p><p className="mt-1 text-sm text-ink-muted">Novas informações aparecerão aqui quando forem adicionadas.</p></div>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {faqList.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <article key={faq.id || index}>
                  <h3>
                    <button type="button" onClick={() => setOpenFaqIndex(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} id={`faq-button-${index}`} className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold leading-snug text-ink transition-colors hover:text-brand-cyan-700 sm:min-h-16 sm:text-lg">
                      <span>{faq.q}</span><ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 text-brand-cyan-700 transition-transform duration-base ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && <motion.div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-button-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden"><p className="max-w-3xl pb-5 pr-8 text-sm leading-7 text-ink-muted sm:text-base">{faq.a}</p></motion.div>}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 border-l-2 border-brand-cyan-600 pl-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pl-6">
          <div><h3 className="text-lg font-bold text-ink">Ainda ficou com alguma dúvida?</h3><p className="mt-1 text-sm text-ink-muted">Converse diretamente com a MG Climatização.</p></div>
          <a href={getWhatsAppLink('Olá! Tenho uma dúvida sobre os serviços de climatização.', settings.whatsapp_number)} target="whatsapp" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-brand-cyan-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-cyan-700"><MessageCircle aria-hidden="true" className="h-4 w-4" /> Chamar no WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
