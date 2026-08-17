import { BRAND } from '../config';

export interface CompanySettings {
  company_name: string;
  whatsapp_number: string;
  whatsapp_message: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  logo_url: string;
}

export interface WhatsappContact {
  number: string;
  message: string;
}

export interface SettingsWithFallback {
  settings: CompanySettings;
  source: 'company_settings' | 'whatsapp_contact' | 'defaults';
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  company_name: BRAND.name,
  whatsapp_number: '5547997464218',
  whatsapp_message: `Olá, ${BRAND.name}! Gostaria de solicitar um orçamento para climatização.`,
  address: 'Blumenau - SC',
  phone: '(47) 99746-4218',
  email: `contato@${BRAND.domain}`,
  instagram: `https://instagram.com/${BRAND.slug}`,
  facebook: '',
  logo_url: '',
};
