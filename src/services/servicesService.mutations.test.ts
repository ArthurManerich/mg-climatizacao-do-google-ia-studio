import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  configured: true,
  response: { data: null as unknown, error: null as { message: string } | null },
  from: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: () => mocks.configured,
  supabase: { from: mocks.from },
}));

import { servicesService } from './servicesService';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.configured = true;
  mocks.response = { data: null, error: null };
  mocks.from.mockImplementation(() => {
    const builder = {
      insert: vi.fn(() => builder),
      update: vi.fn(() => builder),
      delete: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      select: vi.fn(() => builder),
      single: vi.fn(() => Promise.resolve(mocks.response)),
      then: (resolve: (value: unknown) => void) => resolve(mocks.response),
    };
    return builder;
  });
});

describe('mutações administrativas de serviços', () => {
  it('confirma a linha realmente removida antes de considerar a exclusão concluída', async () => {
    mocks.response = { data: [{ id: 'servico-1' }], error: null };
    await expect(servicesService.delete('servico-1')).resolves.toBeUndefined();
  });

  it('não confirma exclusão silenciosamente bloqueada pelas regras do banco', async () => {
    mocks.response = { data: [], error: null };
    await expect(servicesService.delete('servico-1')).rejects.toThrow('Não foi possível confirmar a exclusão');
  });

  it('não confirma quando o banco retorna uma linha diferente', async () => {
    mocks.response = { data: [{ id: 'outro-servico' }], error: null };
    await expect(servicesService.delete('servico-1')).rejects.toThrow('Não foi possível confirmar a exclusão');
  });

  it('bloqueia conteúdo não autorizado antes de acessar o banco', async () => {
    await expect(servicesService.create({
      id: 'pmoc',
      title: 'Contrato PMOC',
      description: 'Conforme ANVISA',
      icon: 'Wrench',
      bullet_points: [],
      order_index: 1,
    })).rejects.toThrow('PMOC não está autorizado');
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
