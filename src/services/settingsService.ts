import { defaultPublicSimulatorConfig } from '../config/simulator';
import type { PublicSimulatorConfig } from '../types';
import { waitForCriticalRender } from '../utils/criticalRender';
import { sanitizeCompanySettings } from '../utils/companySettings';
import {
  DEFAULT_COMPANY_SETTINGS,
  type CompanySettings,
  type SettingsWithFallback,
  type WhatsappContact,
} from '../types/settings.types';

const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function sanitizePublicSimulatorConfig(value: unknown): PublicSimulatorConfig | undefined {
  if (!isRecord(value) || !Array.isArray(value.services) || !Array.isArray(value.capacities) || !Array.isArray(value.propertyTypes)) {
    return undefined;
  }

  const services = value.services.flatMap(item => {
    if (!isRecord(item) || !nonEmpty(item.id) || !nonEmpty(item.label) || !nonEmpty(item.icon)) return [];
    return [{
      id: item.id,
      label: item.label,
      icon: item.icon,
      ...(nonEmpty(item.description) ? { description: item.description } : {}),
    }];
  });
  const capacities = value.capacities.flatMap(item => {
    if (!isRecord(item) || !nonEmpty(item.id) || !nonEmpty(item.label)) return [];
    return [{
      id: item.id,
      label: item.label,
      ...(nonEmpty(item.desc) ? { desc: item.desc } : {}),
    }];
  });
  const propertyTypes = value.propertyTypes.flatMap(item => {
    if (!isRecord(item) || !nonEmpty(item.id) || !nonEmpty(item.label)) return [];
    return [{ id: item.id, label: item.label }];
  });

  return services.length && capacities.length && propertyTypes.length
    ? { services, capacities, propertyTypes }
    : undefined;
}

async function readSetting<T>(key: string): Promise<T | undefined> {
  const { supabase } = await import('../lib/supabase');
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    throw new Error('Não foi possível carregar as configurações. Tente novamente.');
  }

  return data ? data.value as T : undefined;
}

export const settingsService = {
  async getPublicSimulatorConfig(): Promise<PublicSimulatorConfig> {
    await waitForCriticalRender();
    const { hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      return defaultPublicSimulatorConfig;
    }

    const value = await readSetting<unknown>('simulator_public_config');
    return sanitizePublicSimulatorConfig(value) ?? defaultPublicSimulatorConfig;
  },

  async getCompanySettings(): Promise<SettingsWithFallback> {
    await waitForCriticalRender();
    const { hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      return { settings: DEFAULT_COMPANY_SETTINGS, source: 'defaults' };
    }

    const company = await readSetting<Partial<CompanySettings>>('company_settings');
    const needsLegacyWhatsapp = !nonEmpty(company?.whatsapp_number) || !nonEmpty(company?.whatsapp_message);
    const legacy = needsLegacyWhatsapp
      ? await readSetting<Partial<WhatsappContact>>('whatsapp_contact')
      : undefined;

    const { getSupabasePublicUrl } = await import('../lib/supabase');
    const settings = sanitizeCompanySettings({
      ...company,
      whatsapp_number: nonEmpty(company?.whatsapp_number) ? company.whatsapp_number : legacy?.number,
      whatsapp_message: nonEmpty(company?.whatsapp_message) ? company.whatsapp_message : legacy?.message,
    } satisfies Partial<CompanySettings>, DEFAULT_COMPANY_SETTINGS, getSupabasePublicUrl());

    return {
      settings,
      source: company ? 'company_settings' : legacy ? 'whatsapp_contact' : 'defaults',
    };
  },
};
