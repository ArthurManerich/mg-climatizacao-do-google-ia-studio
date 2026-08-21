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
    const config = { services: [], capacities: [], propertyTypes: [], basePrices: { instalacao: {} } };
    mocks.maybeSingle.mockResolvedValueOnce({ data: { value: config }, error: null });
    await expect(adminSettingsService.getAdminSimulatorConfig()).resolves.toEqual(config);
    expect(mocks.eq).toHaveBeenCalledWith('key', 'simulator_config');
  });

  it('mantém budget_prices disponível somente pela API administrativa', async () => {
    const prices = { categories: { instalacao: 100 } };
    mocks.maybeSingle.mockResolvedValueOnce({ data: { value: prices }, error: null });
    await expect(adminSettingsService.getBudgetPrices()).resolves.toEqual(prices);
    expect(mocks.eq).toHaveBeenCalledWith('key', 'budget_prices');
  });

  it('preserva a gravação das configurações administrativas', async () => {
    mocks.upsert.mockResolvedValueOnce({ error: null });
    await adminSettingsService.set('simulator_config', { basePrices: {} });
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      key: 'simulator_config',
      value: { basePrices: {} },
    }));
  });
});
