import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomepageContentManager } from './HomepageContentManager';

const mocks = vi.hoisted(() => ({
  getCurrentAdmin: vi.fn(),
  setHeroTitle: vi.fn(),
  refreshSettings: vi.fn(),
  applyHeroTitle: vi.fn(),
}));

vi.mock('../../../services/authService', () => ({ authService: { getCurrentAdmin: mocks.getCurrentAdmin } }));
vi.mock('../../../services/adminSettingsService', () => ({ adminSettingsService: { setHeroTitle: mocks.setHeroTitle } }));
vi.mock('../../../context/SettingsContext', () => ({ useSettings: () => ({ refreshSettings: mocks.refreshSettings, applyHeroTitle: mocks.applyHeroTitle }) }));

const currentTitle = 'MG Climatização, soluções em ar-condicionado para Blumenau e região.';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCurrentAdmin.mockResolvedValue({ data: { isAdmin: true } });
  mocks.setHeroTitle.mockResolvedValue(undefined);
  mocks.refreshSettings.mockResolvedValue(undefined);
});

describe('Conteúdo da página inicial', () => {
  it('mostra o título atual, a prévia e cancela a edição sem gravar', () => {
    render(<HomepageContentManager title={currentTitle} onTitleSaved={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: 'Título principal' });
    expect(input).toHaveValue(currentTitle);
    fireEvent.change(input, { target: { value: 'Novo título' } });
    expect(screen.getByText('Novo título')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(input).toHaveValue(currentTitle);
    expect(mocks.setHeroTitle).not.toHaveBeenCalled();
  });

  it('salva o título para administrador e atualiza a leitura pública', async () => {
    const onTitleSaved = vi.fn();
    render(<HomepageContentManager title={currentTitle} onTitleSaved={onTitleSaved} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Título principal' }), { target: { value: 'Novo título' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() => expect(mocks.setHeroTitle).toHaveBeenCalledWith('Novo título'));
    expect(onTitleSaved).toHaveBeenCalledWith('Novo título');
    expect(mocks.applyHeroTitle).toHaveBeenCalledWith('Novo título');
    expect(mocks.refreshSettings).toHaveBeenCalledOnce();
  });

  it('não salva quando o usuário autenticado não é administrador', async () => {
    mocks.getCurrentAdmin.mockResolvedValue({ data: { isAdmin: false } });
    render(<HomepageContentManager title={currentTitle} onTitleSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText(/Não foi possível salvar/);
    expect(mocks.setHeroTitle).not.toHaveBeenCalled();
  });

  it('rejeita HTML e preserva o texto publicado quando o salvamento falha', async () => {
    const onTitleSaved = vi.fn();
    render(<HomepageContentManager title={currentTitle} onTitleSaved={onTitleSaved} />);
    const input = screen.getByRole('textbox', { name: 'Título principal' });
    fireEvent.change(input, { target: { value: '<script>alert(1)</script>' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(mocks.setHeroTitle).not.toHaveBeenCalled();
    expect(screen.getByText(/sem HTML/)).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Título válido' } });
    mocks.setHeroTitle.mockRejectedValueOnce(new Error('RLS'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText(/Não foi possível salvar/);
    expect(onTitleSaved).not.toHaveBeenCalled();
  });
});
