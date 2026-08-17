import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  databaseResult: { data: null as unknown, error: null as unknown },
  from: vi.fn(),
  deleteImage: vi.fn(),
  databaseConfirmed: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({ hasSupabaseConfig: () => true, supabase: { from: mocks.from } }));
vi.mock('./uploadService', () => ({ uploadService: { deleteImage: mocks.deleteImage } }));

import { portfolioService } from './portfolioService';
import { beforeAfterService } from './beforeAfterService';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.deleteImage.mockResolvedValue(true);
  mocks.from.mockImplementation(() => {
    const builder = {
      insert: vi.fn(() => builder),
      update: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      select: vi.fn(() => {
        mocks.databaseConfirmed();
        return builder;
      }),
      single: vi.fn(() => Promise.resolve(mocks.databaseResult)),
      then: (resolve: (value: unknown) => void) => resolve(mocks.databaseResult),
    };
    return builder;
  });
});

describe('mutações do Portfólio', () => {
  it('faz um único INSERT para o lote e confirma todos os itens', async () => {
    const items = [
      { title: 'A', category: 'x', img: 'a' },
      { title: 'B', category: 'x', img: 'b' },
    ];
    mocks.databaseResult = { data: [{ id: 1, ...items[0] }, { id: 2, ...items[1] }], error: null };
    await expect(portfolioService.createBatch(items)).resolves.toEqual({
      status: 'confirmed',
      data: [{ id: 1, ...items[0] }, { id: 2, ...items[1] }],
      confirmedUrls: ['a', 'b'],
    });
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['data nulo', null, [], ['a', 'b']],
    ['quantidade menor', [{ id: 1, title: 'A', category: 'x', img: 'a' }], ['a'], ['b']],
    ['quantidade maior', [{ id: 1, img: 'a' }, { id: 2, img: 'b' }, { id: 3, img: 'extra' }], ['a', 'b'], []],
    ['URL diferente', [{ id: 1, img: 'a' }, { id: 2, img: 'outra' }], ['a'], ['b']],
  ])('retorna estado incerto para %s', async (_case, data, confirmedUrls, unconfirmedUrls) => {
    const items = [{ title: 'A', category: 'x', img: 'a' }, { title: 'B', category: 'x', img: 'b' }];
    mocks.databaseResult = { data, error: null };
    await expect(portfolioService.createBatch(items)).resolves.toMatchObject({
      status: 'uncertain', confirmedUrls, unconfirmedUrls,
    });
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });

  it('considera multiplicidade de URLs duplicadas', async () => {
    const items = [{ title: 'A', category: 'x', img: 'a' }, { title: 'B', category: 'x', img: 'a' }];
    mocks.databaseResult = { data: [{ id: 1, img: 'a' }], error: null };
    await expect(portfolioService.createBatch(items)).resolves.toMatchObject({
      status: 'uncertain', confirmedUrls: ['a'], unconfirmedUrls: ['a'],
    });
  });

  it('remove imagem antiga somente depois do UPDATE confirmado', async () => {
    mocks.databaseResult = { data: { id: 1, title: 'A', category: 'x', img: 'nova' }, error: null };
    await portfolioService.update(1, { img: 'nova' }, 'antiga');
    expect(mocks.databaseConfirmed.mock.invocationCallOrder[0]).toBeLessThan(mocks.deleteImage.mock.invocationCallOrder[0]);
    expect(mocks.deleteImage).toHaveBeenCalledWith('antiga');
  });

  it('não remove imagem em edição sem troca', async () => {
    mocks.databaseResult = { data: { id: 1, title: 'B', category: 'x', img: 'mesma' }, error: null };
    await portfolioService.update(1, { title: 'B', img: 'mesma' }, 'mesma');
    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });

  it('retorna sucesso parcial se a antiga não puder ser limpa', async () => {
    mocks.databaseResult = { data: { id: 1, title: 'A', category: 'x', img: 'nova' }, error: null };
    mocks.deleteImage.mockRejectedValue(new Error('storage falhou'));
    await expect(portfolioService.update(1, { img: 'nova' }, 'antiga')).resolves.toMatchObject({
      databaseSucceeded: true,
      storageCleanupSucceeded: false,
      cleanupErrors: ['storage falhou'],
    });
  });

  it('não limpa a antiga quando o UPDATE falha', async () => {
    mocks.databaseResult = { data: null, error: { message: 'update falhou' } };
    await expect(portfolioService.update(1, { img: 'nova' }, 'antiga')).rejects.toThrow('update falhou');
    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });
});

describe('mutações do Antes & Depois', () => {
  it.each([
    ['antes', { before_img: 'antes-nova', after_img: 'depois-antiga' }, ['antes-antiga']],
    ['depois', { before_img: 'antes-antiga', after_img: 'depois-nova' }, ['depois-antiga']],
    ['ambas', { before_img: 'antes-nova', after_img: 'depois-nova' }, ['antes-antiga', 'depois-antiga']],
  ])('limpa corretamente a substituição de %s', async (_case, updatedImages, expected) => {
    mocks.databaseResult = { data: { id: 1, title: 'X', ...updatedImages }, error: null };
    await beforeAfterService.update(1, updatedImages, { before_img: 'antes-antiga', after_img: 'depois-antiga' });
    expect(mocks.deleteImage.mock.calls.map(call => call[0])).toEqual(expected);
  });

  it('tenta as duas limpezas mesmo se a primeira falhar', async () => {
    mocks.databaseResult = { data: { id: 1, title: 'X', before_img: 'antes-nova', after_img: 'depois-nova' }, error: null };
    mocks.deleteImage.mockRejectedValueOnce(new Error('antes falhou')).mockResolvedValueOnce(true);
    const result = await beforeAfterService.update(1, mocks.databaseResult.data as never, { before_img: 'antes-antiga', after_img: 'depois-antiga' });
    expect(mocks.deleteImage).toHaveBeenCalledTimes(2);
    expect(result.storageCleanupSucceeded).toBe(false);
  });

  it('edição textual não toca no Storage', async () => {
    mocks.databaseResult = { data: { id: 1, title: 'Y', before_img: 'a', after_img: 'b' }, error: null };
    await beforeAfterService.update(1, { title: 'Y' }, { before_img: 'a', after_img: 'b' });
    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });
});
