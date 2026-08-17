import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  configured: true,
  publicUrl: 'https://project.supabase.co',
  remove: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: () => state.configured,
  getSupabasePublicUrl: () => state.configured ? state.publicUrl : null,
  supabase: {
    storage: {
      from: vi.fn(() => ({ remove: state.remove })),
    },
  },
}));

import { uploadService } from './uploadService';

beforeEach(() => {
  vi.clearAllMocks();
  state.configured = true;
  state.publicUrl = 'https://project.supabase.co';
  state.remove.mockResolvedValue({ error: null });
});

describe('uploadService.deleteImage', () => {
  it.each([
    ['query string', 'https://project.supabase.co/storage/v1/object/public/images/portfolio/foto.webp?t=123', 'portfolio/foto.webp'],
    ['hash', 'https://project.supabase.co/storage/v1/object/public/images/before-after/foto.webp#preview', 'before-after/foto.webp'],
    ['subpasta', 'https://project.supabase.co/storage/v1/object/public/images/company-logo/logo.webp', 'company-logo/logo.webp'],
  ])('remove %s antes de enviar o caminho', async (_case, url, expectedPath) => {
    await expect(uploadService.deleteImage(url)).resolves.toBe(true);
    expect(state.remove).toHaveBeenCalledWith([expectedPath]);
  });

  it('respeita um caminho-base configurado', async () => {
    state.publicUrl = 'https://project.supabase.co/base';
    const url = 'https://project.supabase.co/base/storage/v1/object/public/images/portfolio/foto.webp';

    await expect(uploadService.deleteImage(url)).resolves.toBe(true);
    expect(state.remove).toHaveBeenCalledWith(['portfolio/foto.webp']);
  });

  it.each([
    'não é uma url',
    'https://project.supabase.co/storage/v1/object/public/outro/portfolio/foto.webp',
    'https://external.example/storage/v1/object/public/images/portfolio/foto.webp',
    'https://project.supabase.co.evil.example/storage/v1/object/public/images/portfolio/foto.webp',
    'http://project.supabase.co/storage/v1/object/public/images/portfolio/foto.webp',
    'https://project.supabase.co/storage/v1/object/public/images/',
    'https://project.supabase.co/storage/v1/object/public/images/portfolio/../foto.webp',
    'https://project.supabase.co/storage/v1/object/public/images/portfolio/%2e%2e/foto.webp',
  ])('rejeita URL inválida ou de outro bucket', async (url) => {
    await expect(uploadService.deleteImage(url)).rejects.toThrow();
    expect(state.remove).not.toHaveBeenCalled();
  });

  it('não retorna sucesso sem configuração do Supabase', async () => {
    state.configured = false;
    await expect(uploadService.deleteImage('https://project.supabase.co/storage/v1/object/public/images/portfolio/foto.webp')).rejects.toThrow('não está configurada');
  });

  it('propaga erro retornado pelo Storage', async () => {
    state.remove.mockResolvedValue({ error: { message: 'remoção negada' } });
    await expect(uploadService.deleteImage('https://project.supabase.co/storage/v1/object/public/images/portfolio/foto.webp')).rejects.toThrow('remoção negada');
  });
});
