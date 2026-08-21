import {
  Building2,
  ShieldCheck,
  FileCheck,
  LucideIcon,
} from 'lucide-react';

export interface ServiceData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bulletPoints: string[];
}

export const servicesData: ServiceData[] = [];

export interface PillarData {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const pillarsData: PillarData[] = [
  {
    icon: Building2,
    title: 'Residencial e empresarial',
    description: 'Atendimento para diferentes necessidades de climatização.'
  },
  {
    icon: FileCheck,
    title: 'Nota Fiscal',
    description: 'Emissão de Nota Fiscal nos serviços realizados.'
  },
  {
    icon: ShieldCheck,
    title: 'Garantia de 90 dias',
    description: 'Garantia informada para os serviços executados.'
  }
];
