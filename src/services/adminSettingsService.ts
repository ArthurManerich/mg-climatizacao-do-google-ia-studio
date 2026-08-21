import { defaultAdminSimulatorConfig } from '../config/adminSimulator';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import type { SimulatorConfig } from '../types';

async function readSetting<T>(key: string): Promise<T | undefined> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw new Error('Não foi possível carregar as configurações administrativas.');
  return data ? data.value as T : undefined;
}

export const adminSettingsService = {
  async getAdminSimulatorConfig(): Promise<SimulatorConfig> {
    if (!hasSupabaseConfig()) return defaultAdminSimulatorConfig;
    return await readSetting<SimulatorConfig>('simulator_config') ?? defaultAdminSimulatorConfig;
  },

  async getBudgetPrices(): Promise<unknown> {
    if (!hasSupabaseConfig()) return undefined;
    return readSetting<unknown>('budget_prices');
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar as configurações: conexão com o Supabase não está configurada.');
    }

    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) throw new Error('Não foi possível salvar as configurações no banco de dados.');
  },
};
