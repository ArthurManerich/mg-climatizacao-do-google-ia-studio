import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../services/uploadService', () => ({
  uploadService: { uploadImage: vi.fn() },
}));

import { useUploads } from './useUploads';

describe('useUploads.validateFile', () => {
  it('rejeita arquivo acima de 5 MB antes do upload', () => {
    const { result } = renderHook(() => useUploads());
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.jpg', { type: 'image/jpeg' });

    expect(result.current.validateFile(file)).toContain('excede o limite de 5 MB');
  });

  it.each([
    ['foto.jpg', 'image/jpeg'],
    ['foto.jpeg', 'image/jpeg'],
    ['foto.png', 'image/png'],
    ['foto.webp', 'image/webp'],
  ])('aceita formato permitido %s', (name, type) => {
    const { result } = renderHook(() => useUploads());
    const file = new File(['image'], name, { type });

    expect(result.current.validateFile(file)).toBeNull();
  });

  it.each([
    ['animacao.gif', 'image/gif'],
    ['vetor.svg', 'image/svg+xml'],
    ['sem-mime.jpg', ''],
    ['renomeado.jpg', 'image/gif'],
  ])('rejeita formato ou MIME não permitido %s (%s)', (name, type) => {
    const { result } = renderHook(() => useUploads());
    const file = new File(['image'], name, { type });

    expect(result.current.validateFile(file)).toContain('Formato de imagem');
  });
});
