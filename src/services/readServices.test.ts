import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  configured: true,
  response: { data: [] as unknown[], error: null as { message: string } | null },
  from: vi.fn(),
  order: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: () => mocks.configured,
  supabase: { from: mocks.from },
}));

vi.mock('./uploadService', () => ({
  uploadService: { deleteImage: vi.fn() },
}));

import { portfolioService } from './portfolioService';
import { beforeAfterService } from './beforeAfterService';
import { servicesService } from './servicesService';
import { faqService } from './faqService';
import { testimonialsService } from './testimonialsService';

const readers = [
  ['portfólio', () => portfolioService.getAll()],
  ['Antes & Depois', () => beforeAfterService.getAll()],
  ['serviços', () => servicesService.getAll()],
  ['FAQ', () => faqService.getAll()],
  ['depoimentos', () => testimonialsService.getAll()],
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.configured = true;
  mocks.response = { data: [], error: null };
  mocks.order.mockImplementation(async () => mocks.response);
  mocks.from.mockImplementation(() => ({
    select: vi.fn(() => ({ order: mocks.order })),
  }));
});

describe('contrato das leituras em lista', () => {
  it.each([
    'Climatização em escritório',
    'Instalação de ar-condicionado na cozinha',
    'Manutenção do painel do ar-condicionado',
    'Desmontagem do ar-condicionado',
  ])('preserva conteúdo legítimo em serviços e FAQ: %s', async (text) => {
    const service = { title: text, description: text, bullet_points: [] };
    mocks.response.data = [service];
    await expect(servicesService.getAll()).resolves.toEqual([service]);
    const faq = { q: text, a: text };
    mocks.response.data = [faq];
    await expect(faqService.getAll()).resolves.toEqual([faq]);
  });
  it.each(['Montagem de móveis', 'Desmontagem de guarda-roupa', 'Montar armários'])('filtra somente a expressão explícita de móveis: %s', async (text) => {
    mocks.response.data = [{ title: text, description: '' }];
    await expect(servicesService.getAll()).resolves.toEqual([]);
    mocks.response.data = [{ q: text, a: '' }];
    await expect(faqService.getAll()).resolves.toEqual([]);
  });
  it.each(readers)('%s retorna lista vazia quando a consulta confirma ausência de dados', async (_name, read) => {
    await expect(read()).resolves.toEqual([]);
  });

  it.each(readers)('%s mantém o fallback vazio quando o Supabase não está configurado', async (_name, read) => {
    mocks.configured = false;

    await expect(read()).resolves.toEqual([]);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each(readers)('%s rejeita falha real com mensagem segura', async (_name, read) => {
    mocks.response = {
      data: [],
      error: { message: 'detalhe interno sensível da conexão' },
    };

    const result = await read().catch((error: unknown) => error);

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('Não foi possível carregar');
    expect((result as Error).message).not.toContain('detalhe interno sensível');
  });

  it('preserva registros válidos do portfólio', async () => {
    const item = { id: 1, title: 'Instalação', category: 'Residencial', img: 'https://example.test/image.webp' };
    mocks.response = { data: [item], error: null };

    await expect(portfolioService.getAll()).resolves.toEqual([item]);
  });

  it('preserva registros válidos de Antes & Depois', async () => {
    const item = { id: 1, title: 'Limpeza', description: 'Resultado', before_img: 'before.webp', after_img: 'after.webp' };
    mocks.response = { data: [item], error: null };

    await expect(beforeAfterService.getAll()).resolves.toEqual([item]);
  });

  it('normaliza registros válidos de serviços sem apagar a leitura', async () => {
    const item = { id: 'installation', icon: 'Snowflake', title: 'Instalação', description: 'Descrição', bullet_points: null };
    mocks.response = { data: [item], error: null };

    await expect(servicesService.getAll()).resolves.toEqual([{ ...item, bullet_points: [] }]);
  });

  it('preserva registros válidos do FAQ', async () => {
    const item = { id: 1, q: 'Qual o prazo?', a: 'Conforme a agenda.' };
    mocks.response = { data: [item], error: null };

    await expect(faqService.getAll()).resolves.toEqual([item]);
  });

  it('preserva registros válidos de depoimentos', async () => {
    const item = { id: 1, name: 'Cliente', role: 'Residencial', text: 'Ótimo atendimento', rating: 5 };
    mocks.response = { data: [item], error: null };

    await expect(testimonialsService.getAll()).resolves.toEqual([item]);
  });
});
