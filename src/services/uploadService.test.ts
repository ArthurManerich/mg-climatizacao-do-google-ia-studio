import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  configured: true,
  publicUrl: 'https://project.supabase.co',
  remove: vi.fn(),
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: () => state.configured,
  getSupabasePublicUrl: () => state.configured ? state.publicUrl : null,
  supabase: {
    storage: {
      from: vi.fn(() => ({ remove: state.remove, upload: state.upload, getPublicUrl: state.getPublicUrl })),
    },
  },
}));

import { detectImageType, uploadService, validateImageFile } from './uploadService';

beforeEach(() => {
  vi.clearAllMocks();
  state.configured = true;
  state.publicUrl = 'https://project.supabase.co';
  state.remove.mockResolvedValue({ error: null });
  state.upload.mockResolvedValue({ error: null });
  state.getPublicUrl.mockReturnValue({ data: { publicUrl: '' } });
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
    'https://project.supabase.co/storage/v1/object/public/images/diretorio-arbitrario/foto.webp',
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
    await expect(uploadService.deleteImage('https://project.supabase.co/storage/v1/object/public/images/portfolio/foto.webp')).rejects.toThrow('Falha ao remover');
  });
});

const signatures = {
  jpeg: [0xff, 0xd8, 0xff, 0xe0],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
};

describe('validação do conteúdo da imagem', () => {
  it.each([
    ['image/jpeg', 'foto.jpg', signatures.jpeg],
    ['image/png', 'foto.png', signatures.png],
    ['image/webp', 'foto.webp', signatures.webp],
  ])('aceita assinatura válida de %s', async (type, name, bytes) => {
    await expect(validateImageFile(new File([new Uint8Array(bytes)], name, { type }))).resolves.toBe(type);
  });

  it.each([
    ['image/svg+xml', 'foto.svg'], ['image/gif', 'foto.gif'], ['image/bmp', 'foto.bmp'],
    ['image/tiff', 'foto.tiff'], ['image/avif', 'foto.avif'], ['text/html', 'foto.html'],
    ['application/xml', 'foto.xml'], ['', 'foto.jpg'],
  ])('rejeita MIME não permitido %s', async (type, name) => {
    await expect(validateImageFile(new File(['conteúdo'], name, { type }))).rejects.toThrow('Formato de imagem inválido');
  });

  it('rejeita MIME e assinatura divergentes', async () => {
    await expect(validateImageFile(new File([new Uint8Array(signatures.png)], 'foto.jpg', { type: 'image/jpeg' }))).rejects.toThrow('conteúdo');
  });

  it('rejeita extensão falsa', async () => {
    await expect(validateImageFile(new File([new Uint8Array(signatures.jpeg)], 'foto.png', { type: 'image/jpeg' }))).rejects.toThrow('extensão');
  });

  it('rejeita arquivo acima de 5 MB antes da leitura de conteúdo', async () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'foto.jpg', { type: 'image/jpeg' });
    await expect(validateImageFile(file)).rejects.toThrow('5 MB');
  });

  it('detecta somente as três assinaturas permitidas', () => {
    expect(detectImageType(new Uint8Array(signatures.jpeg))).toBe('image/jpeg');
    expect(detectImageType(new Uint8Array(signatures.png))).toBe('image/png');
    expect(detectImageType(new Uint8Array(signatures.webp))).toBe('image/webp');
    expect(detectImageType(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBeNull();
  });
});

describe('uploadService.uploadImage', () => {
  const OriginalImage = globalThis.Image;

  function mockProcessing(options?: { width?: number; height?: number; decodeError?: boolean; blob?: Blob | null }) {
    class MockImage {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      naturalWidth = options?.width ?? 1600;
      naturalHeight = options?.height ?? 900;
      width = this.naturalWidth;
      height = this.naturalHeight;
      set src(_value: string) {
        queueMicrotask(() => options?.decodeError ? this.onerror?.() : this.onload?.());
      }
    }
    Object.defineProperty(globalThis, 'Image', { configurable: true, value: MockImage });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:imagem');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage: vi.fn() })),
      toBlob: vi.fn((callback: BlobCallback) => callback(options && 'blob' in options ? options.blob ?? null : new Blob(['webp'], { type: 'image/webp' }))),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLCanvasElement);
    return canvas;
  }

  function validJpeg() {
    return new File([new Uint8Array(signatures.jpeg)], 'foto.jpg', { type: 'image/jpeg' });
  }

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'Image', { configurable: true, value: OriginalImage });
  });

  it('converte para WebP, usa UUID e não sobrescreve colisões', async () => {
    const canvas = mockProcessing();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('123e4567-e89b-42d3-a456-426614174000');
    state.getPublicUrl.mockImplementation(() => ({ data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/images/${state.upload.mock.calls.at(-1)?.[0]}` } }));

    await expect(uploadService.uploadImage(validJpeg(), 'portfolio')).resolves.toContain('/portfolio/123e4567-e89b-42d3-a456-426614174000.webp');
    expect(state.upload).toHaveBeenCalledWith(
      'portfolio/123e4567-e89b-42d3-a456-426614174000.webp',
      expect.objectContaining({ type: 'image/webp' }),
      expect.objectContaining({ upsert: false, contentType: 'image/webp' }),
    );
    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(900);
  });

  it.each([
    [8001, 100], [100, 8001], [8000, 5001],
  ])('rejeita dimensões inseguras %sx%s antes do canvas', async (width, height) => {
    const canvas = mockProcessing({ width, height });
    await expect(uploadService.uploadImage(validJpeg())).rejects.toThrow('dimensões');
    expect(canvas.getContext).not.toHaveBeenCalled();
    expect(state.upload).not.toHaveBeenCalled();
  });

  it('rejeita falha de decodificação sem enviar o original', async () => {
    mockProcessing({ decodeError: true });
    await expect(uploadService.uploadImage(validJpeg())).rejects.toThrow('decodificado');
    expect(state.upload).not.toHaveBeenCalled();
  });

  it.each([
    [null], [new Blob(['png'], { type: 'image/png' })],
  ])('rejeita saída inválida da compressão', async (blob) => {
    mockProcessing({ blob });
    await expect(uploadService.uploadImage(validJpeg())).rejects.toThrow('WebP');
    expect(state.upload).not.toHaveBeenCalled();
  });

  it('rejeita URL pública adulterada após o upload', async () => {
    mockProcessing();
    state.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://evil.example/storage/v1/object/public/images/portfolio/foto.webp' } });
    await expect(uploadService.uploadImage(validJpeg())).rejects.toThrow('URL pública válida');
  });

  it('rejeita diretório de upload não autorizado', async () => {
    await expect(uploadService.uploadImage(validJpeg(), '../privado' as 'portfolio')).rejects.toThrow('Diretório');
    expect(state.upload).not.toHaveBeenCalled();
  });
});
