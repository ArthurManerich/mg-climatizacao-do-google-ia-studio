import {
  Calculator,
  FileImage,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Phone,
  Settings,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import type { TabType } from '../Hooks/useAdminData';

export interface AdminDestination {
  id: TabType;
  label: string;
  shortLabel: string;
  bottomLabel: string;
  icon: LucideIcon;
  mobilePrimary: boolean;
}

export const ADMIN_DESTINATIONS: AdminDestination[] = [
  { id: 'dashboard', label: 'Painel Geral', shortLabel: 'Início', bottomLabel: 'Início', icon: LayoutDashboard, mobilePrimary: true },
  { id: 'portfolio', label: 'Portfólio / Galeria', shortLabel: 'Portfólio', bottomLabel: 'Portfólio', icon: FileImage, mobilePrimary: true },
  { id: 'before_after', label: 'Antes & Depois', shortLabel: 'Antes & Depois', bottomLabel: 'Antes', icon: Layers, mobilePrimary: true },
  { id: 'services', label: 'Especialidades', shortLabel: 'Serviços', bottomLabel: 'Serviços', icon: Shield, mobilePrimary: false },
  { id: 'faq', label: 'Dúvidas / FAQ', shortLabel: 'FAQ', bottomLabel: 'FAQ', icon: HelpCircle, mobilePrimary: true },
  { id: 'simulator', label: 'Simulador / Preços', shortLabel: 'Simulador', bottomLabel: 'Simulador', icon: Calculator, mobilePrimary: false },
  { id: 'settings', label: 'Configurações', shortLabel: 'Configurações', bottomLabel: 'Configurações', icon: Settings, mobilePrimary: false },
  { id: 'whatsapp', label: 'WhatsApp / Contato', shortLabel: 'WhatsApp', bottomLabel: 'WhatsApp', icon: Phone, mobilePrimary: false },
];

export const MOBILE_PRIMARY_DESTINATIONS = ADMIN_DESTINATIONS.filter(destination => destination.mobilePrimary);
export const MOBILE_MORE_DESTINATIONS = ADMIN_DESTINATIONS.filter(destination => !destination.mobilePrimary);

export function getAdminDestination(tab: TabType): AdminDestination {
  return ADMIN_DESTINATIONS.find(destination => destination.id === tab) ?? ADMIN_DESTINATIONS[0];
}

export function isMoreDestination(tab: TabType): boolean {
  return MOBILE_MORE_DESTINATIONS.some(destination => destination.id === tab);
}
