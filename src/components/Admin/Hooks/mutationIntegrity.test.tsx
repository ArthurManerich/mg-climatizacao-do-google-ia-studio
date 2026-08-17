import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, FormEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  portfolioCreateBatch: vi.fn(),
  portfolioUpdate: vi.fn(),
  beforeAfterCreate: vi.fn(),
  beforeAfterUpdate: vi.fn(),
}));

vi.mock('./useUploads', () => ({
  useUploads: () => ({ isUploading: false, progress: 0, uploadImage: mocks.uploadImage, error: null }),
}));
vi.mock('../../../services/uploadService', () => ({ uploadService: { deleteImage: mocks.deleteImage } }));
vi.mock('../../../services/portfolioService', () => ({
  portfolioService: { getAll: vi.fn(), createBatch: mocks.portfolioCreateBatch, update: mocks.portfolioUpdate, delete: vi.fn() },
}));
vi.mock('../../../services/beforeAfterService', () => ({
  beforeAfterService: { getAll: vi.fn(), create: mocks.beforeAfterCreate, update: mocks.beforeAfterUpdate, delete: vi.fn() },
}));

import { usePortfolio } from './usePortfolio';
import { useBeforeAfter } from './useBeforeAfter';

const inputEvent = (name = 'foto.webp') => {
  const files = [new File(['x'], name, { type: 'image/webp' })];
  return {
    currentTarget: { files },
    target: { files, value: '' },
  } as unknown as ChangeEvent<HTMLInputElement>;
};
const formEvent = { preventDefault: vi.fn() } as unknown as FormEvent;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.deleteImage.mockResolvedValue(true);
});

describe('integridade do Portfólio', () => {
  it('confirma uploads no INSERT em lote bem-sucedido', async () => {
    mocks.uploadImage.mockResolvedValueOnce('nova-1').mockResolvedValueOnce('nova-2');
    mocks.portfolioCreateBatch.mockResolvedValue({
      status: 'confirmed',
      data: [{ id: 1, title: 'Novo', category: 'x', img: 'nova-1' }, { id: 2, title: 'Novo', category: 'x', img: 'nova-2' }],
      confirmedUrls: ['nova-1', 'nova-2'],
    });
    const { result } = renderHook(() => usePortfolio());
    act(() => { result.current.handleOpenCreateForm(); result.current.setPortfolioTitle('Novo'); });
    const event = { ...inputEvent(), currentTarget: { files: [new File(['1'], '1.webp'), new File(['2'], '2.webp')] } } as unknown as ChangeEvent<HTMLInputElement>;
    await act(() => result.current.handleImageUpload(event));
    await act(() => result.current.handleSavePortfolio(formEvent));
    expect(mocks.portfolioCreateBatch).toHaveBeenCalledTimes(1);
    expect(result.current.portfolios).toHaveLength(2);
    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });

  it('limpa todas as imagens pendentes quando o INSERT falha', async () => {
    mocks.uploadImage.mockResolvedValueOnce('nova-1').mockResolvedValueOnce('nova-2');
    mocks.portfolioCreateBatch.mockRejectedValue(new Error('insert falhou'));
    const { result } = renderHook(() => usePortfolio());
    act(() => { result.current.handleOpenCreateForm(); result.current.setPortfolioTitle('Novo'); });
    const event = { ...inputEvent(), currentTarget: { files: [new File(['1'], '1.webp'), new File(['2'], '2.webp')] } } as unknown as ChangeEvent<HTMLInputElement>;
    await act(() => result.current.handleImageUpload(event));
    await act(() => result.current.handleSavePortfolio(formEvent));
    expect(mocks.deleteImage).toHaveBeenCalledTimes(2);
    expect(result.current.portfolios).toEqual([]);
  });

  it('informa falha conjunta de banco e limpeza', async () => {
    mocks.uploadImage.mockResolvedValue('nova');
    mocks.portfolioCreateBatch.mockRejectedValue(new Error('insert falhou'));
    mocks.deleteImage.mockRejectedValue(new Error('cleanup falhou'));
    const { result } = renderHook(() => usePortfolio());
    act(() => { result.current.handleOpenCreateForm(); result.current.setPortfolioTitle('Novo'); });
    await act(() => result.current.handleImageUpload(inputEvent()));
    await act(() => result.current.handleSavePortfolio(formEvent));
    expect(result.current.portfolioMessage?.text).toMatch(/insert falhou.*órfãs.*cleanup falhou/);
  });

  it('preserva imagens e não atualiza painel quando o INSERT é incerto', async () => {
    mocks.uploadImage.mockResolvedValue('nova');
    mocks.portfolioCreateBatch.mockResolvedValue({ status: 'uncertain', data: [], confirmedUrls: [], unconfirmedUrls: ['nova'], message: 'gravação incerta' });
    const { result } = renderHook(() => usePortfolio());
    act(() => { result.current.handleOpenCreateForm(); result.current.setPortfolioTitle('Novo'); });
    await act(() => result.current.handleImageUpload(inputEvent()));
    await act(() => result.current.handleSavePortfolio(formEvent));
    expect(mocks.deleteImage).not.toHaveBeenCalled();
    expect(mocks.portfolioCreateBatch).toHaveBeenCalledTimes(1);
    expect(result.current.portfolios).toEqual([]);
    expect(result.current.portfolioMessage?.text).toContain('preservadas');
  });

  it('cancelamento limpa pendente e preserva imagem antiga', async () => {
    mocks.uploadImage.mockResolvedValue('nova');
    const { result } = renderHook(() => usePortfolio());
    act(() => result.current.handleStartEdit({ id: 1, title: 'Antigo', category: 'x', img: 'antiga' } as never));
    await act(() => result.current.handleImageUpload(inputEvent()));
    await act(() => result.current.handleCancelPortfolioForm());
    expect(mocks.deleteImage).toHaveBeenCalledWith('nova');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('antiga');
  });

  it('remover prévia nova limpa Storage; remover antiga não limpa', async () => {
    mocks.uploadImage.mockResolvedValue('nova');
    const { result } = renderHook(() => usePortfolio());
    act(() => result.current.handleStartEdit({ id: 1, title: 'Antigo', category: 'x', img: 'antiga' } as never));
    await act(() => result.current.handleRemoveImage(0));
    expect(mocks.deleteImage).not.toHaveBeenCalled();
    await act(() => result.current.handleImageUpload(inputEvent()));
    await act(() => result.current.handleRemoveImage(0));
    expect(mocks.deleteImage).toHaveBeenCalledWith('nova');
  });

  it('mantém controle do primeiro upload quando o segundo falha', async () => {
    mocks.uploadImage.mockResolvedValueOnce('nova-1').mockRejectedValueOnce(new Error('upload falhou'));
    const { result } = renderHook(() => usePortfolio());
    act(() => result.current.handleOpenCreateForm());
    const event = { ...inputEvent(), currentTarget: { files: [new File(['1'], '1.webp'), new File(['2'], '2.webp')] } } as unknown as ChangeEvent<HTMLInputElement>;
    await act(() => result.current.handleImageUpload(event));
    await act(() => result.current.handleCancelPortfolioForm());
    expect(mocks.deleteImage).toHaveBeenCalledWith('nova-1');
  });

  it('atualiza estado após sucesso parcial sem tratar como falha total', async () => {
    mocks.uploadImage.mockResolvedValue('nova');
    mocks.portfolioUpdate.mockResolvedValue({ data: { id: 1, title: 'Editado', category: 'x', img: 'nova' }, databaseSucceeded: true, storageCleanupSucceeded: false, cleanupErrors: ['antiga órfã'] });
    const { result } = renderHook(() => usePortfolio());
    act(() => { result.current.setPortfolios([{ id: 1, title: 'Antigo', category: 'x', img: 'antiga' } as never]); result.current.handleStartEdit({ id: 1, title: 'Antigo', category: 'x', img: 'antiga' } as never); });
    await act(() => result.current.handleRemoveImage(0));
    await act(() => result.current.handleImageUpload(inputEvent()));
    await act(() => result.current.handleSavePortfolio(formEvent));
    expect(result.current.portfolios[0].img).toBe('nova');
    expect(result.current.portfolioMessage?.text).toContain('Edição salva');
  });

  it('preserva a principal e limpa uploads excedentes após UPDATE', async () => {
    mocks.uploadImage.mockResolvedValueOnce('nova-principal').mockResolvedValueOnce('nova-excedente');
    mocks.portfolioUpdate.mockResolvedValue({ data: { id: 1, title: 'X', category: 'x', img: 'nova-principal' }, databaseSucceeded: true, storageCleanupSucceeded: true, cleanupErrors: [] });
    const { result } = renderHook(() => usePortfolio());
    act(() => result.current.handleStartEdit({ id: 1, title: 'X', category: 'x', img: 'antiga' } as never));
    await act(() => result.current.handleRemoveImage(0));
    const files = [new File(['1'], '1.webp'), new File(['2'], '2.webp')];
    await act(() => result.current.handleImageUpload({ currentTarget: { files }, target: { files, value: '' } } as unknown as ChangeEvent<HTMLInputElement>));
    await act(() => result.current.handleSavePortfolio(formEvent));
    expect(mocks.deleteImage).toHaveBeenCalledWith('nova-excedente');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('nova-principal');
  });

  it('reúne falha da imagem antiga e de upload excedente', async () => {
    mocks.uploadImage.mockResolvedValueOnce('principal').mockResolvedValueOnce('excedente');
    mocks.portfolioUpdate.mockResolvedValue({ data: { id: 1, title: 'X', category: 'x', img: 'principal' }, databaseSucceeded: true, storageCleanupSucceeded: false, cleanupErrors: ['antiga: falhou'] });
    mocks.deleteImage.mockRejectedValue(new Error('excedente falhou'));
    const { result } = renderHook(() => usePortfolio());
    act(() => result.current.handleStartEdit({ id: 1, title: 'X', category: 'x', img: 'antiga' } as never));
    await act(() => result.current.handleRemoveImage(0));
    const files = [new File(['1'], '1.webp'), new File(['2'], '2.webp')];
    await act(() => result.current.handleImageUpload({ currentTarget: { files }, target: { files, value: '' } } as unknown as ChangeEvent<HTMLInputElement>));
    await act(() => result.current.handleSavePortfolio(formEvent));
    expect(result.current.portfolioMessage?.text).toMatch(/antiga: falhou.*excedente.*excedente falhou/);
  });
});

describe('integridade do Antes & Depois', () => {
  it('limpa as duas novas imagens quando o INSERT falha, independentemente', async () => {
    mocks.uploadImage.mockResolvedValueOnce('antes-nova').mockResolvedValueOnce('depois-nova');
    mocks.beforeAfterCreate.mockRejectedValue(new Error('insert falhou'));
    const { result } = renderHook(() => useBeforeAfter());
    act(() => { result.current.handleOpenBeforeAfterCreateForm(); result.current.setBeforeAfterTitle('Novo'); });
    await act(() => result.current.handleBeforeImageUpload(inputEvent('a.webp')));
    await act(() => result.current.handleAfterImageUpload(inputEvent('b.webp')));
    await act(() => result.current.handleSaveBeforeAfter(formEvent));
    expect(mocks.deleteImage).toHaveBeenCalledTimes(2);
  });

  it('cancelamento limpa somente imagens novas', async () => {
    mocks.uploadImage.mockResolvedValue('antes-nova');
    const { result } = renderHook(() => useBeforeAfter());
    act(() => result.current.handleStartBeforeAfterEdit({ id: 1, title: 'X', before_img: 'antes-antiga', after_img: 'depois-antiga' } as never));
    await act(() => result.current.handleBeforeImageUpload(inputEvent()));
    await act(() => result.current.handleCancelBeforeAfterForm());
    expect(mocks.deleteImage).toHaveBeenCalledWith('antes-nova');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('antes-antiga');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('depois-antiga');
  });

  it.each([
    ['antes', 'antes-nova', 'depois-antiga'],
    ['depois', 'antes-antiga', 'depois-nova'],
  ])('envia substituição somente de %s ao UPDATE', async (side, beforeUrl, afterUrl) => {
    mocks.uploadImage.mockResolvedValue(side === 'antes' ? beforeUrl : afterUrl);
    mocks.beforeAfterUpdate.mockResolvedValue({ data: { id: 1, title: 'X', before_img: beforeUrl, after_img: afterUrl }, databaseSucceeded: true, storageCleanupSucceeded: true, cleanupErrors: [] });
    const { result } = renderHook(() => useBeforeAfter());
    act(() => result.current.handleStartBeforeAfterEdit({ id: 1, title: 'X', before_img: 'antes-antiga', after_img: 'depois-antiga' } as never));
    if (side === 'antes') await act(() => result.current.handleBeforeImageUpload(inputEvent()));
    else await act(() => result.current.handleAfterImageUpload(inputEvent()));
    await act(() => result.current.handleSaveBeforeAfter(formEvent));
    expect(mocks.beforeAfterUpdate.mock.calls[0][1]).toMatchObject({ before_img: beforeUrl, after_img: afterUrl });
  });

  it('falha no UPDATE limpa novas e preserva antigas', async () => {
    mocks.uploadImage.mockResolvedValueOnce('antes-nova').mockResolvedValueOnce('depois-nova');
    mocks.beforeAfterUpdate.mockRejectedValue(new Error('update falhou'));
    const { result } = renderHook(() => useBeforeAfter());
    act(() => result.current.handleStartBeforeAfterEdit({ id: 1, title: 'X', before_img: 'antes-antiga', after_img: 'depois-antiga' } as never));
    await act(() => result.current.handleBeforeImageUpload(inputEvent()));
    await act(() => result.current.handleAfterImageUpload(inputEvent()));
    await act(() => result.current.handleSaveBeforeAfter(formEvent));
    expect(mocks.deleteImage).toHaveBeenCalledTimes(2);
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('antes-antiga');
  });

  it('edição textual não solicita limpeza no hook', async () => {
    mocks.beforeAfterUpdate.mockResolvedValue({ data: { id: 1, title: 'X', before_img: 'a', after_img: 'b' }, databaseSucceeded: true, storageCleanupSucceeded: true, cleanupErrors: [] });
    const { result } = renderHook(() => useBeforeAfter());
    act(() => result.current.handleStartBeforeAfterEdit({ id: 1, title: 'X', before_img: 'a', after_img: 'b' } as never));
    await act(() => result.current.handleSaveBeforeAfter(formEvent));
    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });

  it.each([
    ['antes', 'antes-1', 'antes-2'],
    ['depois', 'depois-1', 'depois-2'],
  ])('limpa a pendente anterior em substituições sucessivas de %s', async (side, firstUrl, finalUrl) => {
    mocks.uploadImage.mockResolvedValueOnce(firstUrl).mockResolvedValueOnce(finalUrl);
    const { result } = renderHook(() => useBeforeAfter());
    act(() => result.current.handleStartBeforeAfterEdit({ id: 1, title: 'X', before_img: 'antes-antiga', after_img: 'depois-antiga' } as never));
    if (side === 'antes') {
      await act(() => result.current.handleBeforeImageUpload(inputEvent('1.webp')));
      await act(() => result.current.handleBeforeImageUpload(inputEvent('2.webp')));
    } else {
      await act(() => result.current.handleAfterImageUpload(inputEvent('1.webp')));
      await act(() => result.current.handleAfterImageUpload(inputEvent('2.webp')));
    }
    expect(mocks.deleteImage).toHaveBeenCalledWith(firstUrl);
    expect(mocks.deleteImage).not.toHaveBeenCalledWith(finalUrl);
  });

  it('mantém falha da pendente anterior e reúne no UPDATE', async () => {
    mocks.uploadImage.mockResolvedValueOnce('antes-1').mockResolvedValueOnce('antes-2');
    mocks.deleteImage.mockRejectedValue(new Error('limpeza pendente falhou'));
    mocks.beforeAfterUpdate.mockResolvedValue({ data: { id: 1, title: 'X', before_img: 'antes-2', after_img: 'depois-antiga' }, databaseSucceeded: true, storageCleanupSucceeded: false, cleanupErrors: ['antiga falhou'] });
    const { result } = renderHook(() => useBeforeAfter());
    act(() => result.current.handleStartBeforeAfterEdit({ id: 1, title: 'X', before_img: 'antes-antiga', after_img: 'depois-antiga' } as never));
    await act(() => result.current.handleBeforeImageUpload(inputEvent('1.webp')));
    await act(() => result.current.handleBeforeImageUpload(inputEvent('2.webp')));
    await act(() => result.current.handleSaveBeforeAfter(formEvent));
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('antes-2');
    expect(result.current.beforeAfterMessage?.text).toMatch(/antiga falhou.*antes-1.*limpeza pendente falhou/);
  });

  it('substituições sucessivas dos dois lados preservam somente as finais', async () => {
    mocks.uploadImage
      .mockResolvedValueOnce('antes-1').mockResolvedValueOnce('antes-final')
      .mockResolvedValueOnce('depois-1').mockResolvedValueOnce('depois-final');
    mocks.beforeAfterUpdate.mockResolvedValue({ data: { id: 1, title: 'X', before_img: 'antes-final', after_img: 'depois-final' }, databaseSucceeded: true, storageCleanupSucceeded: true, cleanupErrors: [] });
    const { result } = renderHook(() => useBeforeAfter());
    act(() => result.current.handleStartBeforeAfterEdit({ id: 1, title: 'X', before_img: 'antes-antiga', after_img: 'depois-antiga' } as never));
    await act(() => result.current.handleBeforeImageUpload(inputEvent()));
    await act(() => result.current.handleBeforeImageUpload(inputEvent()));
    await act(() => result.current.handleAfterImageUpload(inputEvent()));
    await act(() => result.current.handleAfterImageUpload(inputEvent()));
    await act(() => result.current.handleSaveBeforeAfter(formEvent));
    expect(mocks.deleteImage).toHaveBeenCalledWith('antes-1');
    expect(mocks.deleteImage).toHaveBeenCalledWith('depois-1');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('antes-final');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('depois-final');
  });
});
