import {
  Building2,
  HardHat,
  Snowflake,
  LucideIcon,
} from 'lucide-react';

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
    icon: Snowflake,
    title: 'Climatização e refrigeração',
    description: 'Instalação, manutenção, higienização e outros serviços disponíveis.'
  },
  {
    icon: HardHat,
    title: 'Trabalho em altura',
    description: 'Atendimento em altura quando necessário e conforme as condições do serviço.'
  }
];
