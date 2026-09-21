import { BRAND } from '../config';
import { OFFICIAL_EMAIL, OFFICIAL_INSTAGRAM, OFFICIAL_LOGO, OFFICIAL_WHATSAPP } from '../utils/companySettings';

export interface CompanySettings {
  company_name: string;
  hero_title: string;
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
  hero_title: 'MG Climatização, soluções em ar-condicionado para Blumenau e região.',
  whatsapp_number: OFFICIAL_WHATSAPP,
  whatsapp_message: `Olá, ${BRAND.name}! Gostaria de solicitar um orçamento para climatização.`,
  address: 'Blumenau, SC',
  phone: '(47) 99746-4218',
  email: OFFICIAL_EMAIL,
  instagram: OFFICIAL_INSTAGRAM,
  facebook: '',
  logo_url: OFFICIAL_LOGO,
};
