import {
  Wind,
  Sparkles,
  Wrench,
  Gauge,
  Building2,
  ShieldCheck,
  Clock,
  ThumbsUp,
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
    icon: ShieldCheck,
    title: "Técnicos Certificados",
    description: "Profissionais experientes com treinamento em climatização residencial e comercial."
  },
  {
    icon: Clock,
    title: "Pontualidade Garantida",
    description: "Respeitamos o horário agendado. Seu tempo é prioridade."
  },
  {
    icon: FileCheck,
    title: "Nota Fiscal",
    description: "Emitimos nota fiscal em todos os serviços para sua tranquilidade."
  },
  {
    icon: ThumbsUp,
    title: "Garantia no Serviço",
    description: "Todos os serviços executados com garantia e suporte pós-atendimento."
  }
];
