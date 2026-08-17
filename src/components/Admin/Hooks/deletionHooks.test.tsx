import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  portfolioDelete: vi.fn(),
  beforeAfterDelete: vi.fn(),
  faqDelete: vi.fn(),
}));

vi.mock('../../../services/portfolioService', () => ({
  portfolioService: {
    delete: mocks.portfolioDelete,
    getAll: vi.fn(),
  },
}));

vi.mock('../../../services/beforeAfterService', () => ({
  beforeAfterService: {
    delete: mocks.beforeAfterDelete,
    getAll: vi.fn(),
  },
}));

vi.mock('../../../services/faqService', () => ({
  faqService: {
    delete: mocks.faqDelete,
    getAll: vi.fn(),
  },
}));

vi.mock('./useUploads', () => ({
  useUploads: () => ({
    isUploading: false,
    progress: 0,
    uploadImage: vi.fn(),
    error: null,
  }),
}));

import { usePortfolio } from './usePortfolio';
import { useBeforeAfter } from './useBeforeAfter';
import { useFAQ } from './useFAQ';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const completeResult = {
  databaseDeleted: true,
  storageCleanupSucceeded: true,
  cleanupErrors: [],
};

const partialResult = {
  databaseDeleted: true,
  storageCleanupSucceeded: false,
  cleanupErrors: ['Antes: remoção negada'],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('painel de portfólio', () => {
  it('dois cliques rápidos geram uma exclusão e expõem o estado em andamento', async () => {
    const pending = deferred<typeof completeResult>();
    mocks.portfolioDelete.mockReturnValue(pending.promise);
    const { result } = renderHook(() => usePortfolio());
    act(() => result.current.setPortfolios([{ id: 1, title: 'Item', category: 'x', img: 'url' } as never]));

    let first!: Promise<void>;
    act(() => {
      first = result.current.handleDeletePortfolio(1);
      void result.current.handleDeletePortfolio(1);
    });
    expect(mocks.portfolioDelete).toHaveBeenCalledTimes(1);
    expect(result.current.deletingPortfolioId).toBe(1);
    await act(async () => { pending.resolve(completeResult); await first; });
    expect(result.current.portfolios).toEqual([]);
  });

  it.each([
    ['sucesso completo', completeResult, 'success'],
    ['sucesso parcial', partialResult, 'error'],
  ])('remove o item e fecha a confirmação em %s', async (_case, serviceResult, messageType) => {
    mocks.portfolioDelete.mockResolvedValue(serviceResult);
    const { result } = renderHook(() => usePortfolio());

    act(() => {
      result.current.setPortfolios([{ id: 1, title: 'Item', category: 'x', img: 'url' } as any]);
      result.current.setDeleteConfirmationId(1);
    });
    await act(() => result.current.handleDeletePortfolio(1));

    expect(result.current.portfolios).toEqual([]);
    expect(result.current.deleteConfirmationId).toBeNull();
    expect(result.current.portfolioMessage?.type).toBe(messageType);
  });

  it('mantém o item e a confirmação quando o banco falha', async () => {
    mocks.portfolioDelete.mockRejectedValue(new Error('falha no banco'));
    const { result } = renderHook(() => usePortfolio());

    act(() => {
      result.current.setPortfolios([{ id: 1, title: 'Item', category: 'x', img: 'url' } as any]);
      result.current.setDeleteConfirmationId(1);
    });
    await act(() => result.current.handleDeletePortfolio(1));

    expect(result.current.portfolios).toHaveLength(1);
    expect(result.current.deleteConfirmationId).toBe(1);
    expect(result.current.portfolioMessage?.text).toContain('Erro ao deletar');
  });
});

describe('painel de Antes & Depois', () => {
  it('dois cliques rápidos geram uma exclusão e expõem o estado em andamento', async () => {
    const pending = deferred<typeof completeResult>();
    mocks.beforeAfterDelete.mockReturnValue(pending.promise);
    const { result } = renderHook(() => useBeforeAfter());
    act(() => result.current.setBeforeAfters([{ id: 2, title: 'Item', before_img: 'a', after_img: 'b' } as never]));

    let first!: Promise<void>;
    act(() => {
      first = result.current.handleDeleteBeforeAfter(2);
      void result.current.handleDeleteBeforeAfter(2);
    });
    expect(mocks.beforeAfterDelete).toHaveBeenCalledTimes(1);
    expect(result.current.deletingBeforeAfterId).toBe(2);
    await act(async () => { pending.resolve(completeResult); await first; });
    expect(result.current.beforeAfters).toEqual([]);
  });

  it('remove o item e mostra aviso após sucesso parcial', async () => {
    mocks.beforeAfterDelete.mockResolvedValue(partialResult);
    const { result } = renderHook(() => useBeforeAfter());

    act(() => {
      result.current.setBeforeAfters([{ id: 2, title: 'Item', before_img: 'a', after_img: 'b' } as any]);
      result.current.setDeleteBeforeAfterConfirmationId(2);
    });
    await act(() => result.current.handleDeleteBeforeAfter(2));

    expect(result.current.beforeAfters).toEqual([]);
    expect(result.current.deleteBeforeAfterConfirmationId).toBeNull();
    expect(result.current.beforeAfterMessage?.text).toContain('removido do banco de dados');
    expect(mocks.beforeAfterDelete).toHaveBeenCalledTimes(1);
  });

  it('mantém item e confirmação quando o banco falha', async () => {
    mocks.beforeAfterDelete.mockRejectedValue(new Error('falha no banco'));
    const { result } = renderHook(() => useBeforeAfter());
    act(() => {
      result.current.setBeforeAfters([{ id: 2, title: 'Item', before_img: 'a', after_img: 'b' } as never]);
      result.current.setDeleteBeforeAfterConfirmationId(2);
    });
    await act(() => result.current.handleDeleteBeforeAfter(2));
    expect(result.current.beforeAfters).toHaveLength(1);
    expect(result.current.deleteBeforeAfterConfirmationId).toBe(2);
  });
});

describe('painel de FAQ', () => {
  it('dois cliques rápidos geram uma exclusão e expõem o estado em andamento', async () => {
    const pending = deferred<void>();
    mocks.faqDelete.mockReturnValue(pending.promise);
    const { result } = renderHook(() => useFAQ());
    act(() => {
      result.current.setFaqs([{ id: 3, q: 'Q', a: 'A', order_index: 1 }]);
      result.current.setDeleteFaqConfirmationId(3);
    });

    let first!: Promise<void>;
    act(() => {
      first = result.current.handleDeleteFaq(3);
      void result.current.handleDeleteFaq(3);
    });
    expect(mocks.faqDelete).toHaveBeenCalledTimes(1);
    expect(result.current.deletingFaqId).toBe(3);
    await act(async () => { pending.resolve(); await first; });
    expect(result.current.faqs).toEqual([]);
    expect(result.current.deleteFaqConfirmationId).toBeNull();
  });

  it('falha mantém item e confirmação', async () => {
    mocks.faqDelete.mockRejectedValue(new Error('banco falhou'));
    const { result } = renderHook(() => useFAQ());
    act(() => {
      result.current.setFaqs([{ id: 3, q: 'Q', a: 'A', order_index: 1 }]);
      result.current.setDeleteFaqConfirmationId(3);
    });
    await act(() => result.current.handleDeleteFaq(3));
    expect(result.current.faqs).toHaveLength(1);
    expect(result.current.deleteFaqConfirmationId).toBe(3);
  });
});
