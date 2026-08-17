import React, { useState, useEffect } from 'react';
import { Sparkles, Info, RefreshCw, AlertCircle, X, Phone } from 'lucide-react';
import { usePortfolio } from '../../hooks/usePortfolio';
import PortfolioCard from './PortfolioCard';
import { motion, AnimatePresence } from 'motion/react';
import { Photo } from '../../types';
import { getWhatsAppLink } from '../../utils/whatsapp';
import { useSettings } from '../../context/SettingsContext';

export default function Portfolio() {
  const { settings } = useSettings();
  const {
    userPhotos,
    loading,
    error,
    reloadPhotos
  } = usePortfolio();

  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  // Close preview on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewPhoto) {
        setPreviewPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPhoto]);

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
      id="portfolio" 
      className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 px-3 py-1.5 rounded-full">
            Espaço Real MG Climatização
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002E5C] font-display mt-3 sm:mt-4 mb-2">
            Nosso Portfólio de Serviços
          </h2>
          <p className="text-[#475569] text-xs sm:text-base leading-relaxed">
            Acreditamos na honestidade. <strong className="text-[#0096D6]">Exibimos apenas trabalhos reais que realizamos.</strong> Instalações, manutenções e higienizações documentadas com fotos autênticas dos nossos serviços.
          </p>
        </div>

        {/* Grid de Portfólio Dinâmico */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-8 h-8 border-3 border-[#0096D6] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#475569] font-bold text-sm">Carregando...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col items-center justify-center gap-3"
            >
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-slate-900 font-extrabold text-sm">Erro ao carregar os dados.</p>
              <button 
                onClick={reloadPhotos}
                className="bg-[#0096D6] hover:bg-[#0082BA] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
              </button>
            </motion.div>
          ) : userPhotos.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 px-4"
            >
              <Sparkles className="w-10 h-10 text-[#0096D6] mx-auto mb-3" />
              <p className="text-[#002E5C] font-bold text-base">As fotos dos serviços serão adicionadas em breve.</p>
              <p className="text-[#475569] text-xs mt-1">Fotos reais de projetos e serviços da MG Climatização serão publicadas em breve.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            >
              {userPhotos.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  onPreview={(photo) => setPreviewPhoto(photo)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal / Lightbox de Ampliação para Fotos Mobile/Desktop */}
        <AnimatePresence>
          {previewPhoto && (
            <div 
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#002447] border border-slate-700 text-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="absolute top-3 right-3 z-10 bg-slate-950/80 hover:bg-slate-800 text-white p-2.5 rounded-full border border-slate-700 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6]"
                  aria-label="Fechar visualização da foto"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Large Photo Display */}
                <div className="relative bg-black flex-1 min-h-[250px] sm:min-h-[380px] max-h-[60vh] flex items-center justify-center overflow-hidden">
                  <img 
                    src={previewPhoto.img} 
                    alt={previewPhoto.title}
                    decoding="async"
                    className="w-full h-full object-contain max-h-[60vh]"
                  />
                </div>

                {/* Photo Info & WhatsApp Button */}
                <div className="p-4 sm:p-6 bg-[#002447] border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/40 px-2.5 py-1 rounded-lg inline-block mb-1.5">
                      {previewPhoto.category || 'Serviço MG Climatização'}
                    </span>
                    <h3 id="portfolio-modal-title" className="text-base sm:text-xl font-bold font-display text-white">{previewPhoto.title}</h3>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Projeto real documentado e executado em Blumenau e região.
                    </p>
                  </div>

                  <a
                    href={getWhatsAppLink(`Olá! Vi a foto do serviço "${previewPhoto.title}" no seu portfólio e gostaria de um orçamento idêntico!`, settings.whatsapp_number)}
                    target="whatsapp"
                    rel="noopener noreferrer"
                    className="bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[48px] shadow-lg shrink-0"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                    <span>Quero Orçamento com esta Foto</span>
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Sinceridade e Integridade */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-[#FFFBEB] rounded-2xl border border-[#F5A524]/30 max-w-2xl mx-auto flex gap-3 sm:gap-4 items-start">
          <Info className="w-5 h-5 text-[#F5A524] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-[#002E5C] text-xs sm:text-sm mb-1">Nosso Compromisso Prático</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Damos total preferência ao seu feedback real. Quando realizarmos o seu primeiro projeto, tiraremos fotos reais para atualizar nosso site! Valorizamos um trabalho limpo e autêntico acima de tudo.
            </p>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
