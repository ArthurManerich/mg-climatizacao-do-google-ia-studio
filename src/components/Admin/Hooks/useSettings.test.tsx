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
vi.mock('../../../services/settingsService', () => ({ settingsService: { set: mocks.settingsSet } }));

import { useSettings } from './useSettings';

const logoEvent = () => ({
  target: { files: [new File(['logo'], 'logo.png', { type: 'image/png' })], value: 'logo.png' },
}) as unknown as ChangeEvent<HTMLInputElement>;
const formEvent = { preventDefault: vi.fn() } as unknown as FormEvent;

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
      whatsapp_number: expect.any(String),
      whatsapp_message: expect.any(String),
    }));
    expect(mocks.settingsSet).not.toHaveBeenCalledWith('whatsapp_contact', expect.anything());
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
    mocks.uploadImage.mockResolvedValue('logo-novo');
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleCancelLogoChange());

    expect(mocks.deleteImage).toHaveBeenCalledWith('logo-novo');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-antigo');
    expect(result.current.companyLogo).toBe('logo-antigo');
  });

  it('nova seleção limpa a pendência anterior', async () => {
    mocks.uploadImage.mockResolvedValueOnce('logo-1').mockResolvedValueOnce('logo-2');
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleLogoUpload(logoEvent()));

    expect(mocks.deleteImage).toHaveBeenCalledWith('logo-1');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-antigo');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-2');
  });

  it('falha na limpeza mantém a URL pendente e mostra aviso', async () => {
    mocks.uploadImage.mockResolvedValueOnce('logo-1').mockResolvedValueOnce('logo-2');
    mocks.deleteImage.mockRejectedValue(new Error('storage indisponível'));
    const { result } = renderHook(() => useSettings());
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleLogoUpload(logoEvent()));

    expect(result.current.pendingLogoUrls).toContain('logo-1');
    expect(result.current.settingsMessage?.text).toContain('logo-1');
  });

  it('falha no banco preserva o antigo e limpa somente o novo', async () => {
    mocks.uploadImage.mockResolvedValue('logo-novo');
    mocks.settingsSet.mockRejectedValueOnce(new Error('banco falhou'));
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(result.current.companyLogo).toBe('logo-antigo');
    expect(mocks.deleteImage).toHaveBeenCalledWith('logo-novo');
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-antigo');
  });

  it('remove o antigo somente depois da confirmação do banco', async () => {
    mocks.uploadImage.mockResolvedValue('logo-novo');
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.deleteImage).toHaveBeenCalledWith('logo-antigo');
    expect(mocks.settingsSet.mock.invocationCallOrder[0]).toBeLessThan(mocks.deleteImage.mock.invocationCallOrder[0]);
    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-novo');
  });

  it('falha ao remover o antigo mantém o novo salvo e produz aviso parcial', async () => {
    mocks.uploadImage.mockResolvedValue('logo-novo');
    mocks.deleteImage.mockRejectedValue(new Error('cleanup falhou'));
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(result.current.companyLogo).toBe('logo-novo');
    expect(result.current.settingsMessage?.text).toMatch(/salvas.*órfãs.*cleanup falhou/);
  });

  it('edição sem troca de logo não chama Storage', async () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });

  it('URL confirmada pelo banco nunca é apagada', async () => {
    mocks.uploadImage.mockResolvedValue('logo-novo');
    const { result } = renderHook(() => useSettings());
    act(() => result.current.initializeCompanyLogo('logo-antigo'));
    await act(() => result.current.handleLogoUpload(logoEvent()));
    await act(() => result.current.handleSaveSettings(formEvent));

    expect(mocks.deleteImage).not.toHaveBeenCalledWith('logo-novo');
  });
});
