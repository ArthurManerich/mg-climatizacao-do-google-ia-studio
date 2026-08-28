import { defaultAdminSimulatorConfig } from '../config/adminSimulator';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import type { SimulatorConfig } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const nonEmpty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export function sanitizeAdminSimulatorConfig(value: unknown): SimulatorConfig | undefined {
  if (!isRecord(value) || !Array.isArray(value.services) || !Array.isArray(value.capacities) || !Array.isArray(value.propertyTypes)) {
    return undefined;
  }

  return {
    services: value.services.flatMap(item => {
      if (!isRecord(item) || !nonEmpty(item.id) || !nonEmpty(item.label) || !nonEmpty(item.icon)) return [];
      return [{
        id: item.id,
        label: item.label,
        icon: item.icon,
        description: nonEmpty(item.description) ? item.description : '',
      }];
    }),
    capacities: value.capacities.flatMap(item => {
      if (!isRecord(item) || !nonEmpty(item.id) || !nonEmpty(item.label)) return [];
      return [{ id: item.id, label: item.label, desc: nonEmpty(item.desc) ? item.desc : '' }];
    }),
    propertyTypes: value.propertyTypes.flatMap(item => {
      if (!isRecord(item) || !nonEmpty(item.id) || !nonEmpty(item.label)) return [];
      return [{ id: item.id, label: item.label }];
    }),
  };
}

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
    const value = await readSetting<unknown>('simulator_config');
    return sanitizeAdminSimulatorConfig(value) ?? defaultAdminSimulatorConfig;
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar as configurações: conexão com o Supabase não está configurada.');
    }

    const safeValue = key === 'simulator_config'
      ? sanitizeAdminSimulatorConfig(value) ?? defaultAdminSimulatorConfig
      : value;

    const { error } = await supabase
      .from('settings')
      .upsert({ key, value: safeValue, updated_at: new Date().toISOString() });

    if (error) throw new Error('Não foi possível salvar as configurações no banco de dados.');
  },
};
