import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BeforeAfter from './BeforeAfter';

const mocks = vi.hoisted(() => ({ getAll: vi.fn() }));
vi.mock('../../services/beforeAfterService', () => ({ beforeAfterService: { getAll: mocks.getAll } }));
vi.mock('../../context/SettingsContext', () => ({ useSettings: () => ({ settings: { whatsapp_number: '5547997464218' } }) }));

class ResizeObserverMock { observe() {} disconnect() {} }
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe('BeforeAfter', () => {
  beforeEach(() => mocks.getAll.mockReset());

  it('distingue estado vazio de erro de leitura', async () => {
    mocks.getAll.mockResolvedValueOnce([]);
    const view = render(<BeforeAfter />);
    expect(await screen.findByText('Nenhum comparativo publicado no momento.')).toBeInTheDocument();
    view.unmount();

    mocks.getAll.mockRejectedValueOnce(new Error('falha de leitura'));
    render(<BeforeAfter />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os comparativos agora.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });

  it('oferece controle acessível e preserva pan vertical na imagem', async () => {
    mocks.getAll.mockResolvedValue([{ id: 1, title: 'Higienização', description: 'Registro real', before_img: '/antes.webp', after_img: '/depois.webp' }]);
    const { container } = render(<BeforeAfter />);
    await screen.findByText('Higienização');
    const range = screen.getByRole('slider', { name: 'Posição da comparação entre antes e depois' });
    const beforeImage = container.querySelector<HTMLImageElement>('[data-comparison-image="before"]');
    const afterImage = container.querySelector<HTMLImageElement>('[data-comparison-image="after"]');

    expect(range).toHaveValue('50');
    expect(beforeImage).toHaveAttribute('src', '/antes.webp');
    expect(afterImage).toHaveAttribute('src', '/depois.webp');
    expect(beforeImage).toHaveAttribute('alt', 'Situação antes do serviço: Higienização');
    expect(afterImage).toHaveAttribute('alt', 'Resultado depois do serviço: Higienização');
    expect(screen.getByText('Antes')).toBeInTheDocument();
    expect(screen.getByText('Depois')).toBeInTheDocument();

    fireEvent.change(range, { target: { value: '70' } });
    expect(range).toHaveValue('70');
    expect(beforeImage).toHaveAttribute('src', '/antes.webp');
    expect(afterImage).toHaveAttribute('src', '/depois.webp');

    const comparisonSurface = container.querySelector<HTMLDivElement>('.touch-pan-y');
    expect(comparisonSurface).toBeInTheDocument();
    Object.defineProperty(comparisonSurface, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 200 }),
    });
    comparisonSurface!.setPointerCapture = vi.fn();
    comparisonSurface!.hasPointerCapture = vi.fn(() => true);
    fireEvent.pointerDown(comparisonSurface!, { pointerId: 1, clientX: 40 });
    expect(range).toHaveValue('20');
    fireEvent.pointerMove(comparisonSurface!, { pointerId: 1, clientX: 160 });
    expect(range).toHaveValue('80');
    expect(beforeImage).toHaveAttribute('src', '/antes.webp');
    expect(afterImage).toHaveAttribute('src', '/depois.webp');
  });

  it('permite tentar novamente após falha', async () => {
    mocks.getAll.mockRejectedValueOnce(new Error('falha')).mockResolvedValueOnce([]);
    render(<BeforeAfter />);
    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(mocks.getAll).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Nenhum comparativo publicado no momento.')).toBeInTheDocument();
  });
});
