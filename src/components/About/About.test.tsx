import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TEAM_CONTACTS, WHATSAPP } from '../../config';
import About from './About';

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { whatsapp_number: WHATSAPP.number } }),
}));

describe('equipe da MG Climatização', () => {
  it('usa o contato individual do Marcos, o contato central do Gabriel e preserva as mensagens', () => {
    render(<About />);

    const marcosLink = screen.getByRole('link', { name: /Falar com Marcos/i });
    const gabrielLink = screen.getByRole('link', { name: /Falar com Gabriel/i });

    expect(marcosLink).toHaveAttribute('href', expect.stringContaining(`wa.me/${TEAM_CONTACTS.marcos.number}`));
    expect(marcosLink).toHaveAttribute('href', expect.stringContaining('wa.me/554788353004'));
    expect(gabrielLink).toHaveAttribute('href', expect.stringContaining(`wa.me/${WHATSAPP.number}`));
    expect(decodeURIComponent(marcosLink.getAttribute('href') || '')).toContain(TEAM_CONTACTS.marcos.message);
    expect(decodeURIComponent(gabrielLink.getAttribute('href') || '')).toContain(TEAM_CONTACTS.gabriel.message);
  });

  it('apresenta funções e a qualificação confirmada para os dois profissionais', () => {
    render(<About />);

    expect(screen.getByRole('heading', { name: 'Quem está por trás da MG Climatização' })).toBeInTheDocument();
    expect(screen.getByText('Proprietário')).toBeInTheDocument();
    expect(screen.getByText('Atendimento técnico')).toBeInTheDocument();
    expect(screen.getAllByText(/Formação profissionalizante de 40 horas em instalação de ar-condicionado residencial/)).toHaveLength(2);
    expect(screen.getAllByText(/NR-10, NR-12, NR-18, NR-35 e uso de EPI/)).toHaveLength(2);
    expect(screen.getAllByText('Formação')).toHaveLength(2);
    expect(screen.queryByText(/CREA|ART|TRT|CFT|CRT|RRT|ASO|assistência autorizada|representante oficial/i)).not.toBeInTheDocument();
  });
});
