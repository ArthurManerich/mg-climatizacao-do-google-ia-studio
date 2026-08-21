import React, { memo } from 'react';
import {
  ArrowUpRight,
  Building2,
  Fan,
  Flame,
  Gauge,
  LucideIcon,
  Settings,
  ShieldCheck,
  Sparkles,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { getWhatsAppLink } from '../../utils/whatsapp';

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
  Fan,
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
  const visiblePoints = bulletPoints.slice(0, 2);
  const serviceMsg = `Olá! Gostaria de solicitar um orçamento para: ${title}`;

  return (
    <motion.article
      id={id}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      }}
      className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-colors hover:border-brand-cyan-600/50 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-cyan-50 text-brand-cyan-700">
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-snug text-brand-navy-800">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
        </div>
      </div>

      {visiblePoints.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-ink-muted">
          {visiblePoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-brand-cyan-600" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      <a
        href={getWhatsAppLink(serviceMsg, settings.whatsapp_number)}
        target="whatsapp"
        rel="noopener noreferrer"
        className="mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-control pt-5 text-sm font-bold text-brand-cyan-700 transition-colors hover:text-brand-navy-800"
      >
        Solicitar orçamento
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </motion.article>
  );
});

export default ServiceCard;
