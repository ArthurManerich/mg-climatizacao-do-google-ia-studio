import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';

vi.mock('../../context/SettingsContext', () => ({ useSettings: () => ({ settings: { company_name: 'MG Climatização', logo_url: '', whatsapp_number: '5547997464218', whatsapp_message: '' } }) }));

describe('Header mobile', () => {
  it('fecha o menu com Escape e devolve o foco ao acionador', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: 'Abrir menu de navegação' });
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    screen.getAllByRole('link', { name: 'Serviços' }).at(-1)?.focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveFocus();
  });
});
