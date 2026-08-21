import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';

vi.mock('../../context/SettingsContext', () => ({ useSettings: () => ({ settings: { company_name: 'MG Climatização', logo_url: '', whatsapp_number: '5547997464218', whatsapp_message: '' } }) }));
const whatsappMocks = vi.hoisted(() => ({ openWhatsAppSelector: vi.fn() }));
vi.mock('../../context/WhatsAppContactContext', () => ({ useWhatsAppContact: () => whatsappMocks }));

describe('Header mobile', () => {
  beforeEach(() => whatsappMocks.openWhatsAppSelector.mockClear());

  it('mantém a navegação completa no desktop e oferece CTA com menu nas larguras intermediárias', () => {
    render(<Header onOpenAccessModal={vi.fn()} />);

    const desktopNavigation = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(desktopNavigation).toHaveClass('xl:flex');
    expect(screen.getByRole('button', { name: 'Abrir menu de navegação' })).toHaveClass('xl:hidden');

    const budgetButtons = screen.getAllByRole('button', { name: /Solicitar orçamento/i });
    expect(budgetButtons.some((button) => button.className.includes('md:inline-flex') && button.className.includes('xl:hidden'))).toBe(true);
    expect(screen.getByRole('button', { name: 'Alterar modo de acesso ou fazer login' })).toHaveTextContent('Acesso');
  });

  it('exibe todos os links e ações no menu compacto e preserva o seletor de WhatsApp', () => {
    render(<Header onOpenAccessModal={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));

    const mobileNavigation = screen.getByRole('navigation', { name: 'Navegação mobile' });
    for (const label of ['Início', 'Serviços', 'Sobre', 'Antes & Depois', 'Portfólio', 'Dúvidas', 'Contato']) {
      expect(mobileNavigation).toHaveTextContent(label);
    }
    expect(screen.getAllByRole('button', { name: 'Alterar modo de acesso ou fazer login' })).toHaveLength(2);

    const mobileBudgetButton = mobileNavigation.getElementsByTagName('button')[0];
    expect(mobileBudgetButton).toHaveTextContent('Solicitar orçamento');
    fireEvent.click(mobileBudgetButton);
    expect(whatsappMocks.openWhatsAppSelector).toHaveBeenCalledWith('Olá! Gostaria de solicitar um orçamento para climatização.');
    expect(screen.getByRole('button', { name: 'Abrir menu de navegação' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('fecha ao selecionar um link', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: 'Abrir menu de navegação' });
    fireEvent.click(menuButton);
    fireEvent.click(screen.getAllByRole('link', { name: 'Serviços' }).at(-1)!);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

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
