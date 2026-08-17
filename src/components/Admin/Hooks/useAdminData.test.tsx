import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_COMPANY_SETTINGS } from '../../../types/settings.types';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  signOut: vi.fn(),
  portfolioGetAll: vi.fn(),
  beforeAfterGetAll: vi.fn(),
  servicesGetAll: vi.fn(),
  faqGetAll: vi.fn(),
  testimonialsGetAll: vi.fn(),
  settingsGet: vi.fn(),
  getCompanySettings: vi.fn(),
}));

vi.mock('../../../services/authService', () => ({
  authService: { getCurrentUser: mocks.getCurrentUser, signOut: mocks.signOut },
}));
vi.mock('../../../services/portfolioService', () => ({ portfolioService: { getAll: mocks.portfolioGetAll } }));
vi.mock('../../../services/beforeAfterService', () => ({ beforeAfterService: { getAll: mocks.beforeAfterGetAll } }));
vi.mock('../../../services/servicesService', () => ({ servicesService: { getAll: mocks.servicesGetAll } }));
vi.mock('../../../services/faqService', () => ({ faqService: { getAll: mocks.faqGetAll } }));
vi.mock('../../../services/testimonialsService', () => ({ testimonialsService: { getAll: mocks.testimonialsGetAll } }));
vi.mock('../../../services/settingsService', () => ({
  settingsService: { get: mocks.settingsGet, getCompanySettings: mocks.getCompanySettings },
}));
vi.mock('../../../services/uploadService', () => ({
  uploadService: { uploadImage: vi.fn(), deleteImage: vi.fn() },
}));

import { useAdminData } from './useAdminData';

const oldPortfolio = [{ id: 1, title: 'Registro preservado', category: 'Residencial', img: 'old.webp' }];
const newServices = [{ id: 'new', icon: 'Snowflake', title: 'Serviço novo', description: 'Descrição', bullet_points: [] }];

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

function setSuccessfulReads() {
  mocks.getCurrentUser.mockResolvedValue({ data: { user: { email: 'admin@example.test' } }, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.portfolioGetAll.mockResolvedValue(oldPortfolio);
  mocks.beforeAfterGetAll.mockResolvedValue([]);
  mocks.servicesGetAll.mockResolvedValue([]);
  mocks.faqGetAll.mockResolvedValue([]);
  mocks.testimonialsGetAll.mockResolvedValue([]);
  mocks.settingsGet.mockResolvedValue({ base: 100 });
  mocks.getCompanySettings.mockResolvedValue({ settings: DEFAULT_COMPANY_SETTINGS, source: 'company_settings' });
}

beforeEach(() => {
  vi.clearAllMocks();
  setSuccessfulReads();
});

describe('useAdminData - leituras independentes', () => {
  it('atualiza seções bem-sucedidas e preserva a seção que falhou', async () => {
    const { result } = renderHook(() => useAdminData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.portfolios).toEqual(oldPortfolio);

    mocks.portfolioGetAll.mockRejectedValueOnce(new Error('falha privada'));
    mocks.servicesGetAll.mockResolvedValueOnce(newServices);

    await act(async () => {
      await result.current.reloadAllData();
    });

    expect(result.current.portfolios).toEqual(oldPortfolio);
    expect(result.current.services).toEqual(newServices);
    expect(result.current.hasError).toBe(true);
    expect(result.current.errorMessage).toContain('Portfólio');
    expect(result.current.errorMessage).toContain('preservados');

    await act(async () => {
      await result.current.reloadAllData();
    });
    expect(result.current.hasError).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it('substitui dados anteriores quando uma leitura vazia é confirmada', async () => {
    const { result } = renderHook(() => useAdminData(), { wrapper });
    await waitFor(() => expect(result.current.portfolios).toEqual(oldPortfolio));
    mocks.portfolioGetAll.mockResolvedValueOnce([]);

    await act(async () => {
      await result.current.reloadAllData();
    });

    expect(result.current.portfolios).toEqual([]);
    expect(result.current.hasError).toBe(false);
  });

  it('ignora uma resposta antiga que termina depois da recarga mais recente', async () => {
    let resolveOld: (value: typeof oldPortfolio) => void = () => undefined;
    const oldRequest = new Promise<typeof oldPortfolio>(resolve => {
      resolveOld = resolve;
    });
    mocks.portfolioGetAll
      .mockReturnValueOnce(oldRequest)
      .mockResolvedValueOnce([{ id: 2, title: 'Resposta recente', category: 'Comercial', img: 'new.webp' }]);

    const { result } = renderHook(() => useAdminData(), { wrapper });
    await waitFor(() => expect(mocks.portfolioGetAll).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.reloadAllData();
    });
    expect(result.current.portfolios[0]?.title).toBe('Resposta recente');

    await act(async () => {
      resolveOld(oldPortfolio);
      await oldRequest;
    });

    expect(result.current.portfolios[0]?.title).toBe('Resposta recente');
  });
});
