import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Portfolio from './Portfolio';

const reloadPhotos = vi.fn();
const hookState = { userPhotos: [] as Array<{ id: number; title: string; description?: string; category: string; img: string }>, loading: false, error: null as string | null, reloadPhotos };
vi.mock('../../hooks/usePortfolio', () => ({ usePortfolio: () => hookState }));
vi.mock('../../context/SettingsContext', () => ({ useSettings: () => ({ settings: { whatsapp_number: '5547997464218' } }) }));

describe('Portfolio', () => {
  beforeEach(() => { hookState.userPhotos = []; hookState.loading = false; hookState.error = null; reloadPhotos.mockReset(); document.body.style.overflow = ''; });

  it('exibe estados vazio e erro com ações distintas', () => {
    const view = render(<Portfolio />);
    expect(screen.getByText('Nenhum trabalho publicado no momento.')).toBeInTheDocument();
    view.unmount();
    hookState.error = 'falha';
    render(<Portfolio />);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reloadPhotos).toHaveBeenCalledOnce();
  });

  it('prende o foco, bloqueia a rolagem, fecha com Escape e devolve o foco', async () => {
    hookState.userPhotos = [{ id: 1, title: 'Instalação residencial', description: 'Acabamento concluído', category: 'instalacao', img: '/foto.webp' }];
    render(<Portfolio />);
    const opener = screen.getByRole('button', { name: 'Ampliar foto do serviço: Instalação residencial' });
    fireEvent.click(opener);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: 'Fechar visualização da foto' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Fechar visualização da foto' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe('');
    expect(opener).toHaveFocus();
  });

  it('usa placeholder neutro quando a imagem falha', () => {
    hookState.userPhotos = [{ id: 1, title: 'Serviço real', category: 'manutencao', img: '/quebrada.webp' }];
    render(<Portfolio />);
    fireEvent.error(screen.getByAltText('Serviço real'));
    expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();
  });
});
