import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  fetchResult: { data: null as any, error: null as any },
  deleteResult: { data: null as any, error: null as any },
  deleteImage: vi.fn(),
  from: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: () => true,
  supabase: { from: state.from },
}));

vi.mock('./uploadService', () => ({
  uploadService: { deleteImage: state.deleteImage },
}));

import { portfolioService } from './portfolioService';
import { beforeAfterService } from './beforeAfterService';

function configureSupabaseMock() {
  state.from.mockImplementation(() => {
    let deleting = false;
    const builder: any = {
      select: vi.fn(() => deleting ? Promise.resolve(state.deleteResult) : builder),
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(() => Promise.resolve(state.fetchResult)),
      delete: vi.fn(() => {
        deleting = true;
        return builder;
      }),
    };
    return builder;
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  state.fetchResult = { data: null, error: null };
  state.deleteResult = { data: null, error: null };
  state.deleteImage.mockResolvedValue(true);
  configureSupabaseMock();
});

describe('portfolioService.delete', () => {
  it('interrompe se a busca falhar', async () => {
    state.fetchResult = { data: null, error: { message: 'falha de busca' } };

    await expect(portfolioService.delete(1)).rejects.toThrow('falha de busca');
    expect(state.from).toHaveBeenCalledTimes(1);
    expect(state.deleteImage).not.toHaveBeenCalled();
  });

  it('não tenta excluir um registro inexistente', async () => {
    await expect(portfolioService.delete(1)).rejects.toThrow('não encontrado');
    expect(state.from).toHaveBeenCalledTimes(1);
    expect(state.deleteImage).not.toHaveBeenCalled();
  });

  it('não toca no Storage quando o DELETE falha', async () => {
    state.fetchResult = { data: { id: 1, img: 'portfolio-url' }, error: null };
    state.deleteResult = { data: null, error: { message: 'falha no banco' } };

    await expect(portfolioService.delete(1)).rejects.toThrow('falha no banco');
    expect(state.deleteImage).not.toHaveBeenCalled();
  });

  it('confirma o DELETE antes de remover a imagem', async () => {
    state.fetchResult = { data: { id: 1, img: 'portfolio-url' }, error: null };
    state.deleteResult = { data: [{ id: 1 }], error: null };

    await expect(portfolioService.delete(1)).resolves.toEqual({
      databaseDeleted: true,
      storageCleanupSucceeded: true,
      cleanupErrors: [],
    });
    expect(state.deleteImage).toHaveBeenCalledWith('portfolio-url');
  });

  it('informa que a imagem pode ter ficado órfã', async () => {
    state.fetchResult = { data: { id: 1, img: 'portfolio-url' }, error: null };
    state.deleteResult = { data: [{ id: 1 }], error: null };
    state.deleteImage.mockRejectedValue(new Error('storage indisponível'));

    await expect(portfolioService.delete(1)).resolves.toEqual({
      databaseDeleted: true,
      storageCleanupSucceeded: false,
      cleanupErrors: ['Imagem do portfólio: storage indisponível'],
    });
  });
});

describe('beforeAfterService.delete', () => {
  beforeEach(() => {
    state.fetchResult = {
      data: { id: 2, before_img: 'before-url', after_img: 'after-url' },
      error: null,
    };
    state.deleteResult = { data: [{ id: 2 }], error: null };
  });

  it('remove as duas imagens somente após confirmar o DELETE', async () => {
    await expect(beforeAfterService.delete(2)).resolves.toEqual({
      databaseDeleted: true,
      storageCleanupSucceeded: true,
      cleanupErrors: [],
    });
    expect(state.deleteImage).toHaveBeenNthCalledWith(1, 'before-url');
    expect(state.deleteImage).toHaveBeenNthCalledWith(2, 'after-url');
  });

  it.each([
    ['Antes', 'before-url'],
    ['Depois', 'after-url'],
  ])('informa falha somente na imagem %s', async (label, failedUrl) => {
    state.deleteImage.mockImplementation((url: string) =>
      url === failedUrl ? Promise.reject(new Error('falhou')) : Promise.resolve(true)
    );

    const result = await beforeAfterService.delete(2);
    expect(result).toMatchObject({
      databaseDeleted: true,
      storageCleanupSucceeded: false,
    });
    expect(result.cleanupErrors.join('; ')).toContain(label);
    expect(state.deleteImage).toHaveBeenCalledTimes(2);
  });

  it('tenta as duas remoções e reúne as duas falhas', async () => {
    state.deleteImage.mockRejectedValue(new Error('falhou'));

    const result = await beforeAfterService.delete(2);
    expect(result.cleanupErrors.join('; ')).toMatch(/Antes:.*Depois:/);
    expect(state.deleteImage).toHaveBeenCalledTimes(2);
  });

  it('não toca no Storage quando o DELETE falha', async () => {
    state.deleteResult = { data: null, error: { message: 'falha no banco' } };

    await expect(beforeAfterService.delete(2)).rejects.toThrow('falha no banco');
    expect(state.deleteImage).not.toHaveBeenCalled();
  });
});
