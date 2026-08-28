import type { PublicSimulatorConfig } from '../types';

export const defaultPublicSimulatorConfig = {
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
      description: 'Diagnóstico e manutenção para equipamentos com falhas.'
    },
    { 
      id: 'higienizacao', 
      label: 'Higienização', 
      icon: 'Sparkles', 
      description: 'Higienização dos componentes do equipamento.'
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
    { id: 'casa', label: 'Casa' },
    { id: 'apartamento', label: 'Apartamento' },
    { id: 'empresa', label: 'Empresa' },
    { id: 'comercio', label: 'Comércio' }
  ]
} satisfies PublicSimulatorConfig;
