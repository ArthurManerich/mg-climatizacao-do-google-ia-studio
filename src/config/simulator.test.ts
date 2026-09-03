import { describe, expect, it } from 'vitest';
import { defaultPublicSimulatorConfig } from './simulator';

describe('fallbacks públicos do simulador', () => {
  it('usa descrições neutras e confirmadas sem alterar as opções', () => {
    expect(defaultPublicSimulatorConfig.services.map(({ id, description }) => [id, description])).toEqual([
      ['instalacao', 'Instalação conforme as condições do equipamento e do local.'],
      ['manutencao-preventiva', 'Revisão e manutenção preventiva do equipamento.'],
      ['manutencao-corretiva', 'Diagnóstico e manutenção para equipamentos com falhas.'],
      ['higienizacao', 'Higienização dos componentes do equipamento.'],
      ['carga-gas', 'Avaliação e carga de fluido refrigerante quando necessária.'],
      ['desinstalacao', 'Retirada cuidadosa do equipamento.'],
    ]);

    expect(JSON.stringify(defaultPublicSimulatorConfig.services)).not.toMatch(
      /economia de energia|recarga precisa|preservação garantida|fungos|bactérias|resultado garantido/i,
    );
  });
});
