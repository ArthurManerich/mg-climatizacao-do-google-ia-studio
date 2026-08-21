import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { defaultPublicSimulatorConfig } from '../config/simulator';
import type { PublicSimulatorConfig } from '../types';
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
    if (!hasSupabaseConfig()) {
      return defaultPublicSimulatorConfig;
    }

    const value = await readSetting<unknown>('simulator_public_config');
    return sanitizePublicSimulatorConfig(value) ?? defaultPublicSimulatorConfig;
  },

  async getCompanySettings(): Promise<SettingsWithFallback> {
    if (!hasSupabaseConfig()) {
      return { settings: DEFAULT_COMPANY_SETTINGS, source: 'defaults' };
    }

    const company = await readSetting<Partial<CompanySettings>>('company_settings');
    const needsLegacyWhatsapp = !nonEmpty(company?.whatsapp_number) || !nonEmpty(company?.whatsapp_message);
    const legacy = needsLegacyWhatsapp
      ? await readSetting<Partial<WhatsappContact>>('whatsapp_contact')
      : undefined;

    const settings: CompanySettings = {
      company_name: nonEmpty(company?.company_name) ? company.company_name : DEFAULT_COMPANY_SETTINGS.company_name,
      whatsapp_number: nonEmpty(company?.whatsapp_number)
        ? company.whatsapp_number
        : nonEmpty(legacy?.number) ? legacy.number : DEFAULT_COMPANY_SETTINGS.whatsapp_number,
      whatsapp_message: nonEmpty(company?.whatsapp_message)
        ? company.whatsapp_message
        : nonEmpty(legacy?.message) ? legacy.message : DEFAULT_COMPANY_SETTINGS.whatsapp_message,
      address: nonEmpty(company?.address) ? company.address : DEFAULT_COMPANY_SETTINGS.address,
      phone: nonEmpty(company?.phone) ? company.phone : DEFAULT_COMPANY_SETTINGS.phone,
      email: nonEmpty(company?.email) ? company.email : DEFAULT_COMPANY_SETTINGS.email,
      instagram: nonEmpty(company?.instagram) ? company.instagram : DEFAULT_COMPANY_SETTINGS.instagram,
      facebook: nonEmpty(company?.facebook) ? company.facebook : DEFAULT_COMPANY_SETTINGS.facebook,
      logo_url: nonEmpty(company?.logo_url) ? company.logo_url : DEFAULT_COMPANY_SETTINGS.logo_url,
    };

    return {
      settings,
      source: company ? 'company_settings' : legacy ? 'whatsapp_contact' : 'defaults',
    };
  },
};
