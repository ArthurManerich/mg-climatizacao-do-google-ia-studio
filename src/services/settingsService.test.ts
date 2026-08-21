import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hasConfig: vi.fn(),
  maybeSingle: vi.fn(),
  eq: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: mocks.hasConfig,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: mocks.eq,
      })),
    })),
  },
}));

import { settingsService } from './settingsService';
import { DEFAULT_COMPANY_SETTINGS } from '../types/settings.types';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.hasConfig.mockReturnValue(true);
  mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
});

describe('settingsService.getCompanySettings', () => {
  it('usa company_settings como fonte canônica sem consultar o legado quando está completo', async () => {
    const canonical = { ...DEFAULT_COMPANY_SETTINGS, whatsapp_number: '5511999999999' };
    mocks.maybeSingle.mockResolvedValueOnce({ data: { value: canonical }, error: null });
    const result = await settingsService.getCompanySettings();
    expect(result.settings).toEqual(canonical);
    expect(result.source).toBe('company_settings');
    expect(mocks.maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('preenche campos de WhatsApp ausentes ou vazios usando o legado', async () => {
    mocks.maybeSingle
      .mockResolvedValueOnce({ data: { value: { company_name: 'MG', whatsapp_number: '', whatsapp_message: '' } }, error: null })
      .mockResolvedValueOnce({ data: { value: { number: '5547000000000', message: 'Mensagem legada' } }, error: null });
    const result = await settingsService.getCompanySettings();
    expect(result.settings.company_name).toBe('MG');
    expect(result.settings.whatsapp_number).toBe('5547000000000');
    expect(result.settings.whatsapp_message).toBe('Mensagem legada');
  });

  it('usa defaults locais quando ambas as chaves estão ausentes', async () => {
    mocks.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const result = await settingsService.getCompanySettings();
    expect(result.settings).toEqual(DEFAULT_COMPANY_SETTINGS);
    expect(result.source).toBe('defaults');
  });

  it('usa defaults locais quando o Supabase não está configurado', async () => {
    mocks.hasConfig.mockReturnValue(false);
    const result = await settingsService.getCompanySettings();
    expect(result.settings).toEqual(DEFAULT_COMPANY_SETTINGS);
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
  });

  it('propaga erro real sem tratá-lo como ausência', async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'RLS details' } });
    await expect(settingsService.getCompanySettings()).rejects.toThrow('Não foi possível carregar');
  });
});

describe('settingsService.getPublicSimulatorConfig', () => {
  it('aceita capacidades remotas somente com id e label sem acionar o fallback', async () => {
    const remoteConfig = {
      services: [{ id: 'remoto', label: 'Serviço remoto', icon: 'Wind' }],
      capacities: [{ id: 'remota', label: 'Capacidade remota' }],
      propertyTypes: [{ id: 'remoto', label: 'Imóvel remoto' }],
    };
    mocks.maybeSingle.mockResolvedValueOnce({ data: { value: remoteConfig }, error: null });

    const result = await settingsService.getPublicSimulatorConfig();

    expect(result).toEqual(remoteConfig);
    expect(result.services[0].id).toBe('remoto');
    expect(result.capacities[0]).toEqual({ id: 'remota', label: 'Capacidade remota' });
  });

  it('consulta somente a chave pública e remove campos comerciais da resposta', async () => {
    mocks.maybeSingle.mockResolvedValueOnce({
      data: {
        value: {
          services: [{ id: 'instalacao', label: 'Instalação', icon: 'Wind', description: 'Descrição', minPrice: 99 }],
          capacities: [{ id: '12000', label: '12.000 BTUs', desc: 'Sala', duration: '2 horas' }],
          propertyTypes: [{ id: 'casa', label: 'Casa', multiplier: 1.5 }],
          basePrices: { instalacao: { min: 99 } },
          budget_prices: { instalacao: 99 },
        },
      },
      error: null,
    });

    const result = await settingsService.getPublicSimulatorConfig();

    expect(mocks.eq).toHaveBeenCalledOnce();
    expect(mocks.eq).toHaveBeenCalledWith('key', 'simulator_public_config');
    expect(result).toEqual({
      services: [{ id: 'instalacao', label: 'Instalação', icon: 'Wind', description: 'Descrição' }],
      capacities: [{ id: '12000', label: '12.000 BTUs', desc: 'Sala' }],
      propertyTypes: [{ id: 'casa', label: 'Casa' }],
    });
    expect(JSON.stringify(result)).not.toMatch(/budget_prices|basePrices|minPrice|duration|multiplier/);
  });

  it('preserva desc opcional quando ela está presente', async () => {
    mocks.maybeSingle.mockResolvedValueOnce({
      data: {
        value: {
          services: [{ id: 'instalacao', label: 'Instalação', icon: 'Wind' }],
          capacities: [{ id: '12000', label: '12.000 BTUs', desc: 'Sala média' }],
          propertyTypes: [{ id: 'casa', label: 'Casa' }],
        },
      },
      error: null,
    });

    const result = await settingsService.getPublicSimulatorConfig();

    expect(result.capacities[0]).toEqual({ id: '12000', label: '12.000 BTUs', desc: 'Sala média' });
  });

  it('usa a configuração pública local sem Supabase', async () => {
    mocks.hasConfig.mockReturnValue(false);
    const result = await settingsService.getPublicSimulatorConfig();
    expect(result.services.length).toBeGreaterThan(0);
    expect(JSON.stringify(result)).not.toMatch(/budget_prices|basePrices|minPrice|maxPrice|duration|discount|multiplier|"min"|"max"|"time"/);
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
  });
});
