import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sliders, Phone, Sparkles } from 'lucide-react';
import { beforeAfterService } from '../../services/beforeAfterService';
import { BeforeAfterItem } from '../../types';
import { getWhatsAppLink } from '../../utils/whatsapp';
import { useSettings } from '../../context/SettingsContext';
import { IMAGES, BRAND } from '../../config';
import { motion } from 'motion/react';

export default function BeforeAfter() {
  const { settings } = useSettings();
  const [items, setItems] = useState<BeforeAfterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const sliderContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const updateWidth = () => {
      if (container) {
        setContainerWidth(container.getBoundingClientRect().width);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [items, selectedIndex, loading]);

  useEffect(() => {
    let isMounted = true;
    beforeAfterService.getAll()
      .then(data => {
        if (isMounted) {
          setItems(data || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Erro ao carregar comparativos antes/depois:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const currentItem = items[selectedIndex] || items[0];

  const handleMove = useCallback((clientX: number) => {
    const container = sliderContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  // Bind mouse/touch down listeners on the container element
  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      handleMove(clientX);
    };

    container.addEventListener('mousedown', handleStart);
    container.addEventListener('touchstart', handleStart, { passive: true });

    return () => {
      container.removeEventListener('mousedown', handleStart);
      container.removeEventListener('touchstart', handleStart);
    };
  }, [handleMove]);

  // Bind move & up listeners globally when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleUpdate = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      handleMove(clientX);
    };

    const handleStop = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleUpdate);
    window.addEventListener('touchmove', handleUpdate, { passive: true });
    window.addEventListener('mouseup', handleStop);
    window.addEventListener('touchend', handleStop);

    return () => {
      window.removeEventListener('mousemove', handleUpdate);
      window.removeEventListener('touchmove', handleUpdate);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchend', handleStop);
    };
  }, [isDragging, handleMove]);

  const containerVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <motion.section 
      id="antes-depois" 
      className="py-12 sm:py-16 md:py-20 bg-[#002E5C] text-white relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#0096D6]/10 to-[#00B2FF]/10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#002E5C] bg-[#E6F5FC] px-3.5 py-1.5 rounded-full border border-[#0096D6]/40">
            Trabalhos Reais da MG Climatização
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white mt-3 sm:mt-4 mb-3 sm:mb-4">
            Comparativo Antes & Depois
          </h2>
          <p className="text-slate-200 text-xs sm:text-base leading-relaxed">
            Veja na prática o resultado dos nossos serviços de higienização, manutenção e instalação de ar-condicionado. Arraste a barra para comparar!
          </p>
        </div>

        {/* State check for loading / empty */}
        {loading ? (
          <div className="text-center py-12 bg-[#002447] rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#0096D6] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 font-bold text-sm">Carregando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-[#002447] rounded-2xl border border-white/10 px-4 max-w-2xl mx-auto">
            <Sparkles className="w-10 h-10 text-[#F5A524] mx-auto mb-3" />
            <p className="text-white font-bold text-base">Em breve adicionaremos novos trabalhos de Antes & Depois.</p>
            <p className="text-slate-300 text-xs mt-1">Os comparativos antes e depois dos serviços da MG Climatização serão publicados em breve.</p>
          </div>
        ) : (
          <>
            {/* Multi-item selector tabs if multiple items exist */}
            {items.length > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
                {items.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedIndex(idx);
                      setSliderPosition(50);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedIndex === idx
                        ? 'bg-[#0096D6] text-white shadow-md shadow-[#0096D6]/30 font-extrabold'
                        : 'bg-[#002447] text-slate-200 hover:bg-[#001D38]'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}

            {/* Visualizador de Antes e Depois */}
            <div className="max-w-4xl mx-auto bg-white text-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-4 sm:gap-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-[#002E5C]">{currentItem.title}</h3>
                  <p className="text-[#475569] text-xs mt-0.5">{currentItem.description}</p>
                </div>
                
                {/* Controles rápidos de visualização */}
                <div className="flex gap-1.5 flex-wrap sm:flex-nowrap flex-shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
                  <button 
                    onClick={() => setSliderPosition(100)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#002E5C] text-xs font-bold min-h-[40px] cursor-pointer flex-1 sm:flex-initial text-center transition-colors"
                  >
                    Ver Antes
                  </button>
                  <button 
                    onClick={() => setSliderPosition(50)}
                    className="px-3 py-2 rounded-xl bg-[#E6F5FC] hover:bg-[#0096D6]/20 text-[#002E5C] text-xs font-bold min-h-[40px] cursor-pointer flex-1 sm:flex-initial text-center transition-colors"
                  >
                    Meio a Meio
                  </button>
                  <button 
                    onClick={() => setSliderPosition(0)}
                    className="px-3 py-2 rounded-xl bg-[#0096D6]/10 hover:bg-[#0096D6]/20 text-[#002E5C] text-xs font-bold min-h-[40px] cursor-pointer flex-1 sm:flex-initial text-center transition-colors"
                  >
                    Ver Depois
                  </button>
                </div>
              </div>

              {/* Slider de Arrastar */}
              <div className="flex flex-col items-center">
                <div 
                  ref={sliderContainerRef}
                  className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-200 shadow-inner group touch-none"
                >
                  {/* Before Image (Background) */}
                  <img 
                    src={currentItem.before_img} 
                    alt="Foto de antes — aparelho antes do serviço" 
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = IMAGES.before;
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-red-700 text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded shadow-md">
                    Antes
                  </div>

                  {/* After Image (Foreground with dynamic width) */}
                  <div 
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img 
                      src={currentItem.after_img} 
                      alt="Foto de depois — aparelho após o serviço" 
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full object-cover max-w-none"
                      referrerPolicy="no-referrer"
                      style={{ 
                        width: containerWidth ? `${containerWidth}px` : '100%', 
                        height: '100%' 
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = IMAGES.after;
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-[#002E5C] text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded shadow-md whitespace-nowrap">
                      Depois (Serviço Concluído)
                    </div>
                  </div>

                  {/* Draggable Divider Bar */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0096D6] text-white flex items-center justify-center shadow-2xl border-2 border-white -ml-0.5 transform active:scale-110 transition-transform">
                      <Sliders className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Accessible Touch Range Slider Bar for Mobile */}
                <div className="w-full mt-3 px-1">
                  <div className="flex justify-between text-[11px] font-bold text-[#475569] mb-1">
                    <span>← Arraste para comparar</span>
                    <span>{Math.round(sliderPosition)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderPosition} 
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="w-full accent-[#0096D6] h-2 bg-slate-200 rounded-lg cursor-pointer touch-none"
                    aria-label="Controle de comparação antes e depois"
                  />
                </div>
              </div>

              {/* Botão de WhatsApp Dedicado */}
              <a 
                href={getWhatsAppLink(`Olá ${BRAND.name}! Vi o serviço de antes e depois "${currentItem.title}" no seu site e gostaria de solicitar um orçamento!`, settings.whatsapp_number)}
                target="whatsapp"
                rel="noopener noreferrer"
                className="w-full py-3.5 sm:py-4 rounded-xl text-center text-xs sm:text-sm font-bold bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white flex items-center justify-center gap-2 shadow-md transition-colors min-h-[48px]"
              >
                <Phone className="w-4 h-4 fill-current flex-shrink-0" /> Solicitar Orçamento para este Serviço por WhatsApp
              </a>

            </div>
          </>
        )}

      </div>
    </motion.section>
  );
}
