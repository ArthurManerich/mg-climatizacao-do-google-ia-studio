import { SimulatorConfig } from '../types';

export const defaultSimulatorConfig: SimulatorConfig = {
  services: [
    { 
      id: 'instalacao', 
      label: 'Instalação', 
      icon: 'Wind', 
      description: 'Instalação completa com fixação segura, drenagem e testes de estanqueidade.' 
    },
    { 
      id: 'manutencao-preventiva', 
      label: 'Manutenção Preventiva', 
      icon: 'ShieldCheck', 
      description: 'Revisão periódica preventiva para evitar quebras e otimizar o consumo.' 
    },
    { 
      id: 'manutencao-corretiva', 
      label: 'Manutenção Corretiva', 
      icon: 'Wrench', 
      description: 'Diagnóstico e reparo técnico imediato para aparelhos com falhas.' 
    },
    { 
      id: 'higienizacao', 
      label: 'Higienização', 
      icon: 'Sparkles', 
      description: 'Limpeza profunda bactericida de evaporadora e condensadora com sanificação.' 
    },
    { 
      id: 'carga-gas', 
      label: 'Carga de Gás', 
      icon: 'Gauge', 
      description: 'Teste de estanqueidade e recarga precisa do gás refrigerante.' 
    },
    { 
      id: 'desinstalacao', 
      label: 'Desinstalação', 
      icon: 'Unplug', 
      description: 'Retirada técnica segura recolhendo o gás e preservando o equipamento.' 
    },
  ],
  capacities: [
    { id: '9000', label: '9.000 BTUs', desc: 'Até 12m² (quartos, pequenos escritórios)' },
    { id: '12000', label: '12.000 BTUs', desc: 'Até 20m² (suítes, salas médias)' },
    { id: '18000', label: '18.000 BTUs', desc: 'Até 30m² (salas amplas, escritórios)' },
    { id: '24000', label: '24.000 BTUs', desc: 'Até 40m² (comércios, salas integradas)' },
    { id: '36000', label: '36.000 BTUs', desc: 'Acima de 40m² (grandes salões e auditórios)' },
  ],
  propertyTypes: [
    { id: 'casa', label: 'Casa', multiplier: 1.0 },
    { id: 'apartamento', label: 'Apartamento', multiplier: 1.0 },
    { id: 'empresa', label: 'Empresa', multiplier: 1.15 },
    { id: 'comercio', label: 'Comércio', multiplier: 1.10 }
  ],
  basePrices: {
    'instalacao': {
      '9000': { min: 350, max: 450, time: "2 a 3 horas" },
      '12000': { min: 400, max: 550, time: "2 a 4 horas" },
      '18000': { min: 500, max: 650, time: "3 a 5 horas" },
      '24000': { min: 600, max: 800, time: "4 a 6 horas" },
      '36000': { min: 800, max: 1100, time: "5 a 8 horas" }
    },
    'manutencao-preventiva': {
      '9000': { min: 100, max: 150, time: "1 hora" },
      '12000': { min: 120, max: 180, time: "1 a 2 horas" },
      '18000': { min: 150, max: 220, time: "1 a 2 horas" },
      '24000': { min: 180, max: 260, time: "2 horas" },
      '36000': { min: 220, max: 320, time: "2 a 3 horas" }
    },
    'manutencao-corretiva': {
      '9000': { min: 150, max: 250, time: "1 a 2 horas" },
      '12000': { min: 180, max: 300, time: "1 a 3 horas" },
      '18000': { min: 220, max: 350, time: "2 a 3 horas" },
      '24000': { min: 280, max: 420, time: "2 a 4 horas" },
      '36000': { min: 350, max: 550, time: "3 a 5 horas" }
    },
    'higienizacao': {
      '9000': { min: 150, max: 220, time: "1 a 2 horas" },
      '12000': { min: 180, max: 260, time: "1 a 2 horas" },
      '18000': { min: 220, max: 300, time: "2 a 3 horas" },
      '24000': { min: 260, max: 350, time: "2 a 3 horas" },
      '36000': { min: 320, max: 450, time: "3 a 4 horas" }
    },
    'carga-gas': {
      '9000': { min: 200, max: 300, time: "1 a 2 horas" },
      '12000': { min: 250, max: 350, time: "1 a 2 horas" },
      '18000': { min: 300, max: 420, time: "2 a 3 horas" },
      '24000': { min: 350, max: 480, time: "2 a 3 horas" },
      '36000': { min: 450, max: 600, time: "3 a 4 horas" }
    },
    'desinstalacao': {
      '9000': { min: 150, max: 220, time: "1 hora" },
      '12000': { min: 180, max: 250, time: "1 a 2 horas" },
      '18000': { min: 220, max: 300, time: "1 a 2 horas" },
      '24000': { min: 260, max: 350, time: "2 horas" },
      '36000': { min: 320, max: 420, time: "2 a 3 horas" }
    }
  }
};
