import { describe, expect, it } from 'vitest';
import { DEFAULT_COMPANY_SETTINGS } from '../types/settings.types';
import {
  OFFICIAL_EMAIL,
  OFFICIAL_INSTAGRAM,
  OFFICIAL_LOGO,
  OFFICIAL_WHATSAPP,
  sanitizeCompanySettings,
  validEmail,
  validLogoUrl,
  validSocialUrl,
  validWhatsApp,
} from './companySettings';
import { getWhatsAppLink } from './whatsapp';

const supabaseUrl = 'https://projeto.supabase.co';

describe('configurações públicas seguras', () => {
  it('aceita os contatos oficiais e mantém Facebook vazio', () => {
    expect(validEmail(OFFICIAL_EMAIL)).toBe(OFFICIAL_EMAIL);
    expect(validSocialUrl(OFFICIAL_INSTAGRAM, 'instagram')).toBe(OFFICIAL_INSTAGRAM);
    expect(validSocialUrl('', 'facebook')).toBe('');
    expect(validWhatsApp(OFFICIAL_WHATSAPP)).toBe(OFFICIAL_WHATSAPP);
  });

  it.each(['contato@mgclimabnu.com.br', 'contato@mgclimatizacao.com.br', 'sem-arroba'])('rejeita e-mail legado ou inválido: %s', value => {
    expect(validEmail(value)).toBeNull();
  });

  it.each([
    'http://instagram.com/mgclimabnu',
    'https://instagram.com.evil.example/mgclimabnu',
    'javascript:alert(1)',
    'data:text/html,teste',
    'https://instagram.com/mgclimatizacao',
  ])('rejeita Instagram inseguro ou legado: %s', value => {
    expect(validSocialUrl(value, 'instagram')).toBeNull();
  });

  it('aceita somente Facebook HTTPS no domínio legítimo', () => {
    expect(validSocialUrl('https://www.facebook.com/mgclima', 'facebook')).toBe('https://www.facebook.com/mgclima');
    expect(validSocialUrl('https://facebook.com.evil.example/mgclima', 'facebook')).toBeNull();
    expect(validSocialUrl('http://facebook.com/mgclima', 'facebook')).toBeNull();
  });

  it('normaliza WhatsApp brasileiro e rejeita formato internacional inválido', () => {
    expect(validWhatsApp('(47) 99746-4218')).toBe(OFFICIAL_WHATSAPP);
    expect(validWhatsApp('123')).toBeNull();
    expect(getWhatsAppLink('Mensagem segura', '123')).toBe(`https://wa.me/${OFFICIAL_WHATSAPP}?text=Mensagem%20segura`);
  });

  it('aceita logo local e URL do diretório permitido no Supabase Storage', () => {
    expect(validLogoUrl('/brand/logo-principal.jpg', supabaseUrl)).toBe(OFFICIAL_LOGO);
    const storageLogo = `${supabaseUrl}/storage/v1/object/public/images/company-logo/logo.png`;
    expect(validLogoUrl(storageLogo, supabaseUrl)).toBe(storageLogo);
  });

  it.each([
    '/brand/../segredo.png',
    '/brand/%2e%2e/segredo.png',
    '//evil.example/logo.png',
    'http://projeto.supabase.co/storage/v1/object/public/images/company-logo/logo.png',
    'https://evil.example/logo.png',
    'javascript:alert(1)',
    'data:image/png;base64,AA==',
  ])('rejeita logo externa, perigosa ou com travessia: %s', value => {
    expect(validLogoUrl(value, supabaseUrl)).toBeNull();
  });

  it('sanitiza registros antigos sem alterar a fonte remota', () => {
    const result = sanitizeCompanySettings({
      ...DEFAULT_COMPANY_SETTINGS,
      email: 'contato@mgclimabnu.com.br',
      instagram: 'https://instagram.com/mgclimatizacao',
      facebook: 'javascript:alert(1)',
      whatsapp_number: '123',
      logo_url: 'https://evil.example/logo.png',
    }, DEFAULT_COMPANY_SETTINGS, supabaseUrl);

    expect(result).toMatchObject({
      email: OFFICIAL_EMAIL,
      instagram: OFFICIAL_INSTAGRAM,
      facebook: '',
      whatsapp_number: OFFICIAL_WHATSAPP,
      logo_url: OFFICIAL_LOGO,
    });
  });
});
