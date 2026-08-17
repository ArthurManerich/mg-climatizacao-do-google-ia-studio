import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FAQ from '../FAQ';
import { faqService } from '../../../services/faqService';
import { SettingsProvider } from '../../../context/SettingsContext';

vi.mock('../../../services/faqService', () => ({
  faqService: {
    getAll: vi.fn(),
  },
}));

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <SettingsProvider>
      {ui}
    </SettingsProvider>
  );
};

const mockFaqs = [
  { id: 1, q: 'Quanto custa instalar um ar-condicionado?', a: 'Resposta 1' },
  { id: 2, q: 'Vocês fazem manutenção preventiva?', a: 'Resposta 2' },
  { id: 3, q: 'Trabalham aos sábados?', a: 'Resposta 3' },
];

describe('FAQ Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (faqService.getAll as any).mockResolvedValue(mockFaqs);
  });

  it('renders all FAQ questions', async () => {
    renderWithProvider(<FAQ />);
    expect(screen.getByText('Dúvidas Frequentes')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Quanto custa instalar um ar-condicionado?')).toBeInTheDocument();
      expect(screen.getByText('Vocês fazem manutenção preventiva?')).toBeInTheDocument();
      expect(screen.getByText('Trabalham aos sábados?')).toBeInTheDocument();
    });
  });

  it('has the first FAQ question expanded by default', async () => {
    renderWithProvider(<FAQ />);
    await waitFor(() => {
      expect(screen.getByText('Quanto custa instalar um ar-condicionado?')).toBeInTheDocument();
    });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles expansion state when questions are clicked', async () => {
    renderWithProvider(<FAQ />);
    await waitFor(() => {
      expect(screen.getByText('Quanto custa instalar um ar-condicionado?')).toBeInTheDocument();
    });
    const buttons = screen.getAllByRole('button');

    // Click the second FAQ to open it
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    // First FAQ should collapse as we select another
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');

    // Click the second FAQ again to close it
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });

  it('preserva perguntas exibidas após falha e permite tentar novamente', async () => {
    const getAll = vi.mocked(faqService.getAll);
    renderWithProvider(<FAQ />);
    expect(await screen.findByText('Quanto custa instalar um ar-condicionado?')).toBeInTheDocument();

    getAll.mockRejectedValueOnce(new Error('falha de rede privada'));
    fireEvent(window, new Event('online'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as perguntas frequentes');
    expect(screen.getByText('Quanto custa instalar um ar-condicionado?')).toBeInTheDocument();

    getAll.mockResolvedValueOnce([{ id: 4, q: 'Pergunta atualizada?', a: 'Resposta atualizada.' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Pergunta atualizada?')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
