import { describe, expect, it } from 'vitest';
import { findRestrictedServiceContent } from './serviceContent';

describe('validação institucional dos serviços', () => {
  it.each([
    'Contrato PMOC',
    'Aprovado pela ANVISA',
    'Inclui ART',
    'Laudo técnico',
    'Responsável técnico registrado',
    'Atendimento 24 horas',
    'Preço promocional',
    'Desconto especial',
    'Parcelamento disponível',
    'Garantia de um ano',
    'Garantia de 12 meses',
    'Carga de R-410A',
    'Uso de bactericida',
  ])('bloqueia conteúdo não confirmado: %s', description => {
    expect(findRestrictedServiceContent({ title: 'Serviço', description, bullet_points: [] })).not.toBeNull();
  });

  it('aceita conteúdo geral e confirmado', () => {
    expect(findRestrictedServiceContent({
      title: 'Manutenção corretiva',
      description: 'Diagnóstico e manutenção para equipamentos com falhas.',
      bullet_points: ['Atendimento residencial e empresarial'],
    })).toBeNull();
  });
});
