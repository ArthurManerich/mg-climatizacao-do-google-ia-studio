import React, { memo } from 'react';
import { LucideIcon, Check, Wind, ShieldCheck, Sparkles, Gauge, Wrench, Settings, Flame, Zap, Fan, Phone, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getWhatsAppLink } from '../../utils/whatsapp';
import { useSettings } from '../../context/SettingsContext';

const iconMap: Record<string, LucideIcon> = {
  Wind,
  ShieldCheck,
  Sparkles,
  Gauge,
  Wrench,
  Building2,
  Settings,
  Flame,
  Zap,
  Fan
};

interface ServiceCardProps {
  key?: React.Key;
  id?: string;
  icon: LucideIcon | string;
  title: string;
  description: string;
  bulletPoints: string[];
}

const ServiceCard = memo(function ServiceCard({
  id,
  icon,
  title,
  description,
  bulletPoints,
}: ServiceCardProps) {
  const { settings } = useSettings();
  const IconComponent: LucideIcon = typeof icon === 'string' ? (iconMap[icon] || Wrench) : icon;

  const cardVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  const serviceMsg = `Olá! Gostaria de solicitar um orçamento para: ${title}`;

  return (
    <motion.div 
      id={id} 
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: '0 10px 25px -5px rgba(0, 46, 92, 0.12), 0 8px 10px -6px rgba(0, 150, 214, 0.1)' }}
      className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm flex flex-col justify-between group transition-all duration-300 hover:border-[#0096D6]"
    >
      <div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E6F5FC] text-[#0096D6] flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#002E5C] group-hover:text-white transition-colors duration-300 flex-shrink-0">
          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#002E5C] mb-2 font-display">{title}</h3>
        <p className="text-[#475569] text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
          {description}
        </p>
        <ul className="text-xs text-[#475569] space-y-1.5 sm:space-y-2 mb-4">
          {bulletPoints.map((point, index) => (
            <li key={index} className="flex items-start sm:items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#0096D6] flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="leading-tight">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] mt-2">
        <a 
          href={getWhatsAppLink(serviceMsg, settings.whatsapp_number)}
          target="whatsapp"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#E6F5FC] hover:bg-[#0096D6] text-[#002E5C] hover:text-white font-extrabold py-2.5 px-3 rounded-xl text-xs sm:text-sm border border-[#0096D6]/20 transition-all min-h-[44px] group/btn"
        >
          <Phone className="w-4 h-4 text-[#0096D6] group-hover/btn:text-white fill-current flex-shrink-0" />
          <span>Solicitar Orçamento</span>
        </a>
      </div>
    </motion.div>
  );
});

export default ServiceCard;
