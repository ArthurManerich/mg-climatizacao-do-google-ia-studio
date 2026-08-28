import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hasConfig: vi.fn(),
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: mocks.hasConfig,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: mocks.eq })),
      upsert: mocks.upsert,
    })),
  },
}));

import { adminSettingsService } from './adminSettingsService';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.hasConfig.mockReturnValue(true);
  mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
});

describe('adminSettingsService', () => {
  it('mantém simulator_config disponível somente pela API administrativa', async () => {
    const legacyConfig = {
      services: [{ id: 'instalacao', label: 'Instalação', icon: 'Wind', description: 'Instalação' }],
      capacities: [{ id: '12000', label: '12.000 BTUs', desc: 'Capacidade' }],
      propertyTypes: [{ id: 'casa', label: 'Casa', multiplier: 1.5 }],
      basePrices: { instalacao: { 12000: { min: 100, max: 200, time: '2 horas' } } },
    };
    mocks.maybeSingle.mockResolvedValueOnce({ data: { value: legacyConfig }, error: null });
    await expect(adminSettingsService.getAdminSimulatorConfig()).resolves.toEqual({
      services: legacyConfig.services,
      capacities: legacyConfig.capacities,
      propertyTypes: [{ id: 'casa', label: 'Casa' }],
    });
    expect(mocks.eq).toHaveBeenCalledWith('key', 'simulator_config');
  });

  it('salva apenas as opções necessárias, ignorando campos legados', async () => {
    mocks.upsert.mockResolvedValueOnce({ error: null });
    await adminSettingsService.set('simulator_config', {
      services: [{ id: 'instalacao', label: 'Instalação', icon: 'Wind', description: '' }],
      capacities: [{ id: '12000', label: '12.000 BTUs', desc: '' }],
      propertyTypes: [{ id: 'casa', label: 'Casa', multiplier: 2 }],
      basePrices: { instalacao: {} },
    });
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      key: 'simulator_config',
      value: {
        services: [{ id: 'instalacao', label: 'Instalação', icon: 'Wind', description: '' }],
        capacities: [{ id: '12000', label: '12.000 BTUs', desc: '' }],
        propertyTypes: [{ id: 'casa', label: 'Casa' }],
      },
    }));
  });
});
