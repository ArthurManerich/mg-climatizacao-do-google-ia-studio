import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hasConfig: vi.fn(),
  maybeSingle: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: mocks.hasConfig,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mocks.maybeSingle })),
      })),
      upsert: mocks.upsert,
    })),
  },
}));

import { settingsService } from './settingsService';
import { DEFAULT_COMPANY_SETTINGS } from '../types/settings.types';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.hasConfig.mockReturnValue(true);
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

describe('settingsService.set', () => {
  it('executa um único upsert para company_settings', async () => {
    mocks.upsert.mockResolvedValue({ error: null });
    await settingsService.set('company_settings', DEFAULT_COMPANY_SETTINGS);
    expect(mocks.upsert).toHaveBeenCalledTimes(1);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      key: 'company_settings',
      value: DEFAULT_COMPANY_SETTINGS,
    }));
  });
});
