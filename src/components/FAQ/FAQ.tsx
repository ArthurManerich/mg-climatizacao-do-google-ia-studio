import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, MessageCircle, Sparkles } from 'lucide-react';
import { faqService } from '../../services/faqService';
import { Faq } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { getWhatsAppLink } from '../../utils/whatsapp';
import { useSettings } from '../../context/SettingsContext';

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
      if (requestId === requestIdRef.current) {
        setFaqList(data);
      }
    } catch (loadError) {
      console.warn('Erro ao carregar FAQ do Supabase:', loadError);
      if (requestId === requestIdRef.current) {
        setError('Não foi possível carregar as perguntas frequentes. Tente novamente.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadFaq();
    window.addEventListener('online', loadFaq);
    return () => {
      requestIdRef.current += 1;
      window.removeEventListener('online', loadFaq);
    };
  }, [loadFaq]);

  const sectionVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <motion.section 
      id="faq" 
      className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 px-3 py-1.5 rounded-full">
            Dúvidas Frequentes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002E5C] font-display mt-3 sm:mt-4">
            Perguntas sobre Climatização
          </h2>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <p className="text-sm font-bold text-amber-900">{error}</p>
            <button
              type="button"
              onClick={() => void loadFaq()}
              disabled={loading}
              className="mt-2 text-xs font-extrabold text-[#002E5C] underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Tentando novamente...' : 'Tentar novamente'}
            </button>
          </div>
        )}

        {loading && faqList.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#0096D6] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#475569] font-bold text-sm">Carregando perguntas...</p>
          </div>
        ) : error && faqList.length === 0 ? null : faqList.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 px-4 max-w-2xl mx-auto">
            <Sparkles className="w-10 h-10 text-[#0096D6] mx-auto mb-3" />
            <p className="text-[#002E5C] font-bold text-base">Em breve adicionaremos novas perguntas e respostas.</p>
            <p className="text-[#475569] text-xs mt-1">Dúvidas frequentes sobre nossos serviços serão publicadas em breve.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {faqList.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={faq.id || index}
                  className="border border-[#E2E8F0] rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 bg-slate-50/50 hover:bg-slate-50"
                >
                  <button 
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-button-${index}`}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 min-h-[52px] text-left flex items-center justify-between gap-3 sm:gap-4 font-bold text-[#002E5C] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6] focus-visible:ring-offset-2 rounded-xl"
                  >
                    <span className="text-sm sm:text-lg leading-snug">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#0096D6] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-button-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-base text-[#475569] leading-relaxed border-t border-slate-100 pt-3 sm:pt-4 bg-white">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* WhatsApp Callout after FAQ */}
        <div className="mt-8 sm:mt-12 p-5 sm:p-6 bg-[#E6F5FC] rounded-2xl border border-[#0096D6]/30 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="font-bold text-[#002E5C] text-sm sm:text-base">Ficou com alguma dúvida específica?</h3>
            <p className="text-[#475569] text-xs sm:text-sm mt-0.5">
              Fale direto conosco no WhatsApp e tire todas as suas dúvidas em minutos.
            </p>
          </div>
          <a
            href={getWhatsAppLink("Olá! Tenho uma dúvida sobre os serviços de climatização.", settings.whatsapp_number)}
            target="whatsapp"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors min-h-[48px] shrink-0 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chamar no WhatsApp</span>
          </a>
        </div>

      </div>
    </motion.section>
  );
}
