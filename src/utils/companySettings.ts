import type { CompanySettings } from '../types/settings.types';

export const OFFICIAL_EMAIL = 'mgclimatizacao401@gmail.com';
export const OFFICIAL_INSTAGRAM = 'https://instagram.com/mgclimabnu';
export const OFFICIAL_WHATSAPP = '5547997464218';
export const OFFICIAL_LOGO = '/brand/logo-principal.jpg';

export const LEGACY_EMAILS = new Set(['contato@mgclimabnu.com.br', 'contato@mgclimatizacao.com.br']);
export const LEGACY_INSTAGRAM = new Set(['https://instagram.com/mgclimatizacao']);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const text = (value: unknown): string => typeof value === 'string' ? value.trim() : '';

export const HERO_TITLE_MAX_LENGTH = 100;

export function validHeroTitle(value: unknown): string | null {
  if (typeof value !== 'string' || /[<>]/.test(value) || [...value].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null;
  const title = value.trim().replace(/\s+/g, ' ');
  return title.length > 0 && title.length <= HERO_TITLE_MAX_LENGTH ? title : null;
}

export function validEmail(value: unknown): string | null {
  const normalized = text(value).toLowerCase();
  return emailPattern.test(normalized) && !LEGACY_EMAILS.has(normalized) ? normalized : null;
}

export function validSocialUrl(value: unknown, network: 'instagram' | 'facebook'): string | null {
  const candidate = text(value);
  if (!candidate) return network === 'facebook' ? '' : null;
  try {
    const url = new URL(candidate);
    const allowedHosts = network === 'instagram' ? ['instagram.com', 'www.instagram.com'] : ['facebook.com', 'www.facebook.com'];
    if (url.protocol !== 'https:' || !allowedHosts.includes(url.hostname.toLowerCase()) || url.username || url.password || url.port) return null;
    const normalized = url.toString().replace(/\/$/, '');
    if (network === 'instagram' && LEGACY_INSTAGRAM.has(normalized)) return null;
    return normalized;
  } catch {
    return null;
  }
}

export function validWhatsApp(value: unknown): string | null {
  let digits = text(value).replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return /^[1-9]\d{11,14}$/.test(digits) ? digits : null;
}

export function validLogoUrl(value: unknown, supabaseUrl?: string): string | null {
  const candidate = text(value);
  if (!candidate) return OFFICIAL_LOGO;
  if (candidate.startsWith('/')) {
    let decoded = candidate;
    try {
      for (let attempt = 0; attempt < 2; attempt += 1) decoded = decodeURIComponent(decoded);
    } catch { return null; }
    if (candidate.startsWith('//') || decoded.includes('\\') || decoded.split('/').some(segment => segment === '..')) return null;
    return candidate;
  }
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || !supabaseUrl || url.username || url.password) return null;
    const storageOrigin = new URL(supabaseUrl).origin;
    if (url.origin !== storageOrigin || !url.pathname.startsWith('/storage/v1/object/public/images/company-logo/')) return null;
    let decodedPath = url.pathname;
    for (let attempt = 0; attempt < 2; attempt += 1) decodedPath = decodeURIComponent(decodedPath);
    if (decodedPath.split('/').some(segment => segment === '..')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeCompanySettings(value: unknown, defaults: CompanySettings, supabaseUrl?: string): CompanySettings {
  const source = isRecord(value) ? value : {};
  return {
    company_name: text(source.company_name) || defaults.company_name,
    hero_title: validHeroTitle(source.hero_title) ?? defaults.hero_title,
    whatsapp_number: validWhatsApp(source.whatsapp_number) ?? defaults.whatsapp_number,
    whatsapp_message: text(source.whatsapp_message) || defaults.whatsapp_message,
    address: text(source.address) || defaults.address,
    phone: text(source.phone) || defaults.phone,
    email: validEmail(source.email) ?? defaults.email,
    instagram: validSocialUrl(source.instagram, 'instagram') ?? defaults.instagram,
    facebook: validSocialUrl(source.facebook, 'facebook') ?? '',
    logo_url: validLogoUrl(source.logo_url, supabaseUrl) ?? defaults.logo_url,
  };
}

export function validateCompanySettings(value: CompanySettings, supabaseUrl?: string): { settings?: CompanySettings; error?: string } {
  if (!validHeroTitle(value.hero_title)) return { error: `O título principal deve ter entre 1 e ${HERO_TITLE_MAX_LENGTH} caracteres, sem HTML ou quebras de linha.` };
  if (!validEmail(value.email)) return { error: 'Informe um e-mail de contato válido.' };
  if (!validSocialUrl(value.instagram, 'instagram')) return { error: 'Informe uma URL HTTPS válida do Instagram.' };
  if (value.facebook.trim() && !validSocialUrl(value.facebook, 'facebook')) return { error: 'Informe uma URL HTTPS válida do Facebook ou deixe o campo vazio.' };
  if (!validWhatsApp(value.whatsapp_number)) return { error: 'Informe o WhatsApp no formato internacional, incluindo país e DDD.' };
  if (!validLogoUrl(value.logo_url, supabaseUrl)) return { error: 'O endereço do logotipo não é permitido.' };
  return { settings: sanitizeCompanySettings(value, value, supabaseUrl) };
}
