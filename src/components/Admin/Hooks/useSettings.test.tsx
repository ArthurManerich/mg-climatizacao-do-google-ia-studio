import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, FormEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  settingsSet: vi.fn(),
}));

vi.mock('./useUploads', () => ({
  useUploads: () => ({ isUploading: false, progress: 0, uploadImage: mocks.uploadImage }),
}));
vi.mock('../../../services/uploadService', () => ({ uploadService: { deleteImage: mocks.deleteImage } }));
vi.mock('../../../services/adminSettingsService', () => ({ adminSettingsService: { set: mocks.settingsSet } }));
vi.mock('../../../lib/supabase', () => ({
  getSupabasePublicUrl: () => 'https://projeto.supabase.co',
}));

import { useSettings } from './useSettings';

const logoEvent = () => ({
  target: { files: [new File(['logo'], 'logo.png', { type: 'image/png' })], value: 'logo.png' },
}) as unknown as ChangeEvent<HTMLInputElement>;
const formEvent = { preventDefault: vi.fn() } as unknown as FormEvent;
const storageLogo = (name: string) => `https://projeto.supabase.co/storage/v1/object/public/images/company-logo/${name}.png`;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.deleteImage.mockResolvedValue(true);
  mocks.settingsSet.mockResolvedValue(undefined);
});

describe('integridade do logotipo', () => {
  it('salva somente company_settings e nunca grava whatsapp_contact', async () => {
    const { result } = renderHook(() => useSettings());
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.settingsSet).toHaveBeenCalledTimes(1);
    expect(mocks.settingsSet).toHaveBeenCalledWith('company_settings', expect.objectContaining({
      hero_title: 'MG Climatização, soluções em ar-condicionado para Blumenau e região.',
      whatsapp_number: expect.any(String),
      whatsapp_message: expect.any(String),
    }));
    expect(mocks.settingsSet).not.toHaveBeenCalledWith('whatsapp_contact', expect.anything());
  });

  it.each([
    ['e-mail', (result: ReturnType<typeof useSettings>) => result.setCompanyEmail('contato@mgclimabnu.com.br'), /e-mail/],
    ['Instagram', (result: ReturnType<typeof useSettings>) => result.setCompanyInstagram('https://instagram.com.evil.example/perfil'), /Instagram/],
    ['Facebook', (result: ReturnType<typeof useSettings>) => result.setCompanyFacebook('javascript:alert(1)'), /Facebook/],
    ['WhatsApp', (result: ReturnType<typeof useSettings>) => result.setCompanyWhatsapp('123'), /WhatsApp/],
    ['logotipo', (result: ReturnType<typeof useSettings>) => result.setCompanyLogo('/brand/../segredo.png'), /logotipo/],
  ])('bloqueia o salvamento quando %s é inválido', async (_field, change, message) => {
    const { result } = renderHook(() => useSettings());
    act(() => change(result.current));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.settingsSet).not.toHaveBeenCalled();
    expect(result.current.settingsMessage?.text).toMatch(message);
  });

  it('permite Facebook vazio e normaliza o WhatsApp antes de salvar', async () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setCompanyFacebook('');
      result.current.setCompanyWhatsapp('(47) 99746-4218');
    });
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.settingsSet).toHaveBeenCalledWith('company_settings', expect.objectContaining({
      facebook: '',
      whatsapp_number: '5547997464218',
    }));
  });

  it('dois cliques rápidos geram somente uma gravação', async () => {
    let resolveWrite!: () => void;
    mocks.settingsSet.mockReturnValue(new Promise<void>(resolve => { resolveWrite = resolve; }));
    const { result } = renderHook(() => useSettings());

    let first!: Promise<void>;
    act(() => {
      first = result.current.handleSaveSettings(formEvent);
      void result.current.handleSaveSettings(formEvent);
    });
    expect(mocks.settingsSet).toHaveBeenCalledTimes(1);
    await act(async () => { resolveWrite(); await first; });
  });

  it('cancelamento remove somente o upload novo e preserva o confirmado', async () => {
    mocks.uploadImage.mockResolvedValue(storageLogo('logo-novo'));
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleCancelLogoChange());

    expect(mocks.deleteImage).toHaveBeenCalledWith(storageLogo('logo-novo'));
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-antigo');
    expect(result.current.companyLogo).toBe('logo-antigo');
  });

  it('nova seleção limpa a pendência anterior', async () => {
    mocks.uploadImage.mockResolvedValueOnce(storageLogo('logo-1')).mockResolvedValueOnce(storageLogo('logo-2'));
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleLogoUpload(logoEvent()));

    expect(mocks.deleteImage).toHaveBeenCalledWith(storageLogo('logo-1'));
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-antigo');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith(storageLogo('logo-2'));
  });

  it('falha na limpeza mantém a URL pendente e mostra aviso', async () => {
    mocks.uploadImage.mockResolvedValueOnce(storageLogo('logo-1')).mockResolvedValueOnce(storageLogo('logo-2'));
    mocks.deleteImage.mockRejectedValue(new Error('storage indisponível'));
    const { result } = renderHook(() => useSettings());
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleLogoUpload(logoEvent()));

    expect(result.current.pendingLogoUrls).toContain(storageLogo('logo-1'));
    expect(result.current.settingsMessage?.text).toContain(storageLogo('logo-1'));
  });

  it('falha no banco preserva o antigo e limpa somente o novo', async () => {
    mocks.uploadImage.mockResolvedValue(storageLogo('logo-novo'));
    mocks.settingsSet.mockRejectedValueOnce(new Error('banco falhou'));
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(result.current.companyLogo).toBe('logo-antigo');
    expect(mocks.deleteImage).toHaveBeenCalledWith(storageLogo('logo-novo'));
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-antigo');
  });

  it('remove o antigo somente depois da confirmação do banco', async () => {
    mocks.uploadImage.mockResolvedValue(storageLogo('logo-novo'));
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.deleteImage).toHaveBeenCalledWith('logo-antigo');
    expect(mocks.settingsSet.mock.invocationCallOrder[0]).toBeLessThan(mocks.deleteImage.mock.invocationCallOrder[0]);
    expect(mocks.deleteImage).not.toHaveBeenCalledWith(storageLogo('logo-novo'));
  });

  it('falha ao remover o antigo mantém o novo salvo e produz aviso parcial', async () => {
    mocks.uploadImage.mockResolvedValue(storageLogo('logo-novo'));
    mocks.deleteImage.mockRejectedValue(new Error('cleanup falhou'));
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(result.current.companyLogo).toBe(storageLogo('logo-novo'));
    expect(result.current.settingsMessage?.text).toMatch(/salvas.*órfãs.*cleanup falhou/);
  });

  it('edição sem troca de logo não chama Storage', async () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });

  it('URL confirmada pelo banco nunca é apagada', async () => {
    mocks.uploadImage.mockResolvedValue(storageLogo('logo-novo'));
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.deleteImage).not.toHaveBeenCalledWith(storageLogo('logo-novo'));
  });
});
