import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { defaultSimulatorConfig } from '../config/simulator';
import {
  DEFAULT_COMPANY_SETTINGS,
  type CompanySettings,
  type SettingsWithFallback,
  type WhatsappContact,
} from '../types/settings.types';

const defaultWhatsappContact: WhatsappContact = {
  number: DEFAULT_COMPANY_SETTINGS.whatsapp_number,
  message: DEFAULT_COMPANY_SETTINGS.whatsapp_message,
};

const localFallbacks: Record<string, unknown> = {
  company_settings: DEFAULT_COMPANY_SETTINGS,
  whatsapp_contact: defaultWhatsappContact,
  simulator_config: defaultSimulatorConfig,
  budget_prices: {
    categories: {
      instalacao: 350,
      manutencao: 150,
      higienizacao: 120,
      'carga-gas': 180,
    },
  },
};

const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

async function readSetting<T>(key: string): Promise<T | undefined> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    throw new Error('Não foi possível carregar as configurações. Tente novamente.');
  }

  return data ? data.value as T : undefined;
}

export const settingsService = {
  async get<T = unknown>(key: string): Promise<T | undefined> {
    if (!hasSupabaseConfig()) {
      return localFallbacks[key] as T | undefined;
    }

    const value = await readSetting<T>(key);
    return value ?? localFallbacks[key] as T | undefined;
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

  async set<T>(key: string, value: T): Promise<void> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar as configurações: conexão com o Supabase não está configurada.');
    }

    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) {
      throw new Error('Não foi possível salvar as configurações no banco de dados.');
    }
  },
};
