import React, { memo } from 'react';
import { Phone, Trash2, Maximize2 } from 'lucide-react';
import { Photo } from '../../types';
import { getWhatsAppLink } from '../../utils/whatsapp';
import { useSettings } from '../../context/SettingsContext';
import { IMAGES } from '../../config';
import { motion } from 'motion/react';

interface PortfolioCardProps {
  key?: React.Key;
  item: Photo;
  onRemove?: (id: number) => void;
  onPreview?: (item: Photo) => void;
}

const PortfolioCard = memo(function PortfolioCard({ item, onRemove, onPreview }: PortfolioCardProps) {
  const { settings } = useSettings();
  const categoryLabel = 
    item.category === 'instalacao' 
      ? 'Instalação' 
      : item.category === 'manutencao' 
        ? 'Manutenção' 
        : item.category === 'higienizacao' 
          ? 'Higienização' 
          : item.category === 'comercial'
            ? 'Comercial'
            : 'Ar Condicionado';

  const whatsappMessage = `Olá MG Climatização! Vi o serviço "${item.title}" no seu portfólio. Gostaria de solicitar um orçamento parecido para minha residência!`;

  return (
    <motion.div 
      id={`portfolio-item-${item.id}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
      className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-sm flex flex-col justify-between transition-colors duration-300 hover:border-[#0096D6]"
    >
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Ampliar foto do serviço: ${item.title}`}
        onClick={() => onPreview && onPreview(item)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onPreview) onPreview(item);
          }
        }}
        className="relative aspect-[4/3] overflow-hidden bg-[#002E5C] cursor-pointer group/img focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6] focus-visible:ring-offset-2"
        title="Clique ou pressione Enter para ampliar a foto"
      >
        <img 
          src={item.img} 
          alt={item.title} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = IMAGES.portfolioDefault;
          }}
        />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#002E5C]/90 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
          {categoryLabel}
        </div>

        <div className="absolute bottom-3 right-3 bg-[#002E5C]/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover/img:opacity-100 transition-opacity">
          <Maximize2 className="w-3.5 h-3.5 text-[#0096D6]" />
          <span>Ampliar</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-[#002E5C] text-sm sm:text-base font-display mb-1">{item.title}</h3>
          <p className="text-[#475569] text-xs leading-relaxed">
            Serviço executado com qualidade e acabamento profissional MG Climatização.
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 gap-2">
          <a 
            href={getWhatsAppLink(whatsappMessage, settings.whatsapp_number)}
            target="whatsapp"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-extrabold text-[#002E5C] bg-[#E6F5FC] hover:bg-[#0096D6] hover:text-white transition-colors py-2.5 px-3 rounded-xl min-h-[44px]"
          >
            <Phone className="w-3.5 h-3.5 fill-current flex-shrink-0" />
            <span>Fazer Orçamento</span>
          </a>

          {onRemove && (
            <button 
              onClick={() => onRemove(item.id)}
              className="text-slate-400 hover:text-red-500 p-2 rounded-xl border border-slate-200 hover:border-red-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Remover do site"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default PortfolioCard;
