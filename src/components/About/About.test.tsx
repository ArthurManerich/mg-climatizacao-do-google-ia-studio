import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TEAM_CONTACTS, WHATSAPP } from '../../config';
import About from './About';

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { whatsapp_number: WHATSAPP.number } }),
}));

describe('equipe da MG Climatização', () => {
  it('gera contatos individuais sem cruzar os números', () => {
    render(<About />);

    const marcosLink = screen.getByRole('link', { name: /Falar com Marcos/i });
    const gabrielLink = screen.getByRole('link', { name: /Falar com Gabriel/i });

    expect(marcosLink).toHaveAttribute('href', expect.stringContaining(`wa.me/${TEAM_CONTACTS.marcos.number}`));
    expect(marcosLink).not.toHaveAttribute('href', expect.stringContaining(`wa.me/${WHATSAPP.number}`));
    expect(gabrielLink).toHaveAttribute('href', expect.stringContaining(`wa.me/${WHATSAPP.number}`));
    expect(gabrielLink).not.toHaveAttribute('href', expect.stringContaining(`wa.me/${TEAM_CONTACTS.marcos.number}`));
    expect(decodeURIComponent(marcosLink.getAttribute('href') || '')).toContain(TEAM_CONTACTS.marcos.message);
    expect(decodeURIComponent(gabrielLink.getAttribute('href') || '')).toContain(TEAM_CONTACTS.gabriel.message);
  });

  it('apresenta funções e a qualificação confirmada para os dois profissionais', () => {
    render(<About />);

    expect(screen.getByRole('heading', { name: 'Quem está por trás da MG Climatização' })).toBeInTheDocument();
    expect(screen.getByText('Proprietário')).toBeInTheDocument();
    expect(screen.getByText('Atendimento técnico')).toBeInTheDocument();
    expect(screen.getAllByText(/Curso de Refrigeração e Climatização/)).toHaveLength(2);
    expect(screen.getAllByText('Formação')).toHaveLength(2);
    expect(screen.queryByText(/Carga horária|40 horas/i)).not.toBeInTheDocument();
  });
});
