import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_COMPANY_SETTINGS } from '../types/settings.types';

const mocks = vi.hoisted(() => ({ getCompanySettings: vi.fn() }));
vi.mock('../services/settingsService', () => ({
  settingsService: { getCompanySettings: mocks.getCompanySettings },
}));

import { SettingsProvider, useSettings } from './SettingsContext';

function Consumer() {
  const { settings, loading, error, refreshSettings } = useSettings();
  return <><span>{settings.company_name}</span><span role="status">{loading ? 'carregando' : 'pronto'}</span>{error && <span role="alert">{error}</span>}<button onClick={() => void refreshSettings()}>recarregar</button></>;
}

beforeEach(() => vi.clearAllMocks());

describe('SettingsProvider', () => {
  it('expõe a configuração canônica aos consumidores', async () => {
    mocks.getCompanySettings.mockResolvedValue({
      settings: { ...DEFAULT_COMPANY_SETTINGS, company_name: 'Empresa canônica' },
      source: 'company_settings',
    });
    render(<SettingsProvider><Consumer /></SettingsProvider>);
    expect(await screen.findByText('Empresa canônica')).toBeInTheDocument();
  });

  it('mantém os dados carregados quando uma recarga falha', async () => {
    mocks.getCompanySettings
      .mockResolvedValueOnce({ settings: { ...DEFAULT_COMPANY_SETTINGS, company_name: 'Dados preservados' }, source: 'company_settings' })
      .mockRejectedValueOnce(new Error('falha de rede'));
    render(<SettingsProvider><Consumer /></SettingsProvider>);
    expect(await screen.findByText('Dados preservados')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'recarregar' }));
    await waitFor(() => expect(mocks.getCompanySettings).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Dados preservados')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as configurações');
  });

  it('limpa o erro durante uma nova tentativa e aplica a resposta confirmada', async () => {
    let resolveRetry: (value: { settings: typeof DEFAULT_COMPANY_SETTINGS; source: 'company_settings' }) => void = () => undefined;
    const retry = new Promise<{ settings: typeof DEFAULT_COMPANY_SETTINGS; source: 'company_settings' }>(resolve => {
      resolveRetry = resolve;
    });
    mocks.getCompanySettings
      .mockRejectedValueOnce(new Error('falha inicial'))
      .mockReturnValueOnce(retry);

    render(<SettingsProvider><Consumer /></SettingsProvider>);
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'recarregar' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('carregando');

    resolveRetry({
      settings: { ...DEFAULT_COMPANY_SETTINGS, company_name: 'Resposta confirmada' },
      source: 'company_settings',
    });
    expect(await screen.findByText('Resposta confirmada')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('pronto');
  });

  it('ignora resposta antiga que termina depois de uma recarga', async () => {
    let resolveOld: (value: { settings: typeof DEFAULT_COMPANY_SETTINGS; source: 'company_settings' }) => void = () => undefined;
    const oldRequest = new Promise<{ settings: typeof DEFAULT_COMPANY_SETTINGS; source: 'company_settings' }>(resolve => {
      resolveOld = resolve;
    });
    mocks.getCompanySettings
      .mockReturnValueOnce(oldRequest)
      .mockResolvedValueOnce({
        settings: { ...DEFAULT_COMPANY_SETTINGS, company_name: 'Dados mais recentes' },
        source: 'company_settings',
      });

    render(<SettingsProvider><Consumer /></SettingsProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'recarregar' }));
    expect(await screen.findByText('Dados mais recentes')).toBeInTheDocument();

    resolveOld({
      settings: { ...DEFAULT_COMPANY_SETTINGS, company_name: 'Dados antigos' },
      source: 'company_settings',
    });
    await oldRequest;

    expect(screen.getByText('Dados mais recentes')).toBeInTheDocument();
    expect(screen.queryByText('Dados antigos')).not.toBeInTheDocument();
  });
});
