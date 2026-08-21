import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Contact from '../Contact/Contact';
import FloatingWhatsApp from '../WhatsAppButton/FloatingWhatsApp';
import FloatingGoogleReview from '../GoogleReviewButton/FloatingGoogleReview';
import Footer from './Footer';
import { WhatsAppContactProvider } from '../../context/WhatsAppContactContext';

const GENERAL_WHATSAPP_NUMBER = '5547997464218';

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: {
      company_name: 'MG Climatização',
      logo_url: '',
      whatsapp_number: GENERAL_WHATSAPP_NUMBER,
      whatsapp_message: 'Olá',
      phone: '(47) 99746-4218',
      address: 'Blumenau - SC',
      email: 'contato@mg.test',
      instagram: 'https://instagram.com/mg',
      facebook: '',
    },
  }),
}));

describe('fechamento público da landing page', () => {
  it('remove horário não confirmado e mantém os dois caminhos de contato', () => {
    render(<WhatsAppContactProvider><Contact /></WhatsAppContactProvider>);
    expect(screen.queryByText(/Seg a Sáb|08h às 18h/i)).not.toBeInTheDocument();
    expect(screen.getByText('Marcos Manerich')).toBeInTheDocument();
    expect(screen.getByText('(47) 98835-3004')).toBeInTheDocument();
    expect(screen.getByText('Gabriel Klaumann')).toBeInTheDocument();
    expect(screen.getByText('(47) 99746-4218')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar orçamento' }));
    expect(screen.getByRole('dialog', { name: /Com quem você deseja falar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Montar solicitação/ })).toHaveAttribute('href', '#orcamento-online');
  });

  it('usa logo oficial, domínio correto e nomenclatura sem preço no Footer', () => {
    render(<Footer />);
    expect(screen.getByAltText('Logo oficial da MG Climatização')).toHaveAttribute('src', '/brand/logo-principal.jpg');
    expect(screen.getByRole('link', { name: 'mgclimabnu.com.br' })).toHaveAttribute('href', 'https://mgclimabnu.com.br/');
    expect(screen.getByRole('link', { name: 'Montar solicitação' })).toHaveAttribute('href', '#orcamento-online');
    expect(screen.queryByText(/Simular Preço/i)).not.toBeInTheDocument();
  });

  it('mantém o botão flutuante compacto, acessível e sem animação contínua', () => {
    render(<WhatsAppContactProvider><FloatingWhatsApp /></WhatsAppContactProvider>);
    const button = screen.getByRole('button', { name: 'Solicitar orçamento no WhatsApp' });
    expect(button).toHaveClass('h-12', 'w-12');
    expect(button.className).toContain('safe-area-inset-bottom');
    expect(button.className).not.toMatch(/animate-(bounce|pulse|ping)/);
    fireEvent.click(button);
    expect(screen.getByRole('dialog', { name: /Com quem você deseja falar/i })).toBeInTheDocument();
  });

  it('oferece avaliação pública no Google em um botão flutuante separado', () => {
    render(<FloatingGoogleReview />);
    const link = screen.getByRole('link', { name: 'Avaliar a MG Climatização no Google' });
    expect(link).toHaveAttribute('href', 'https://g.page/r/Cd42q0aM-ZcUEAE/review');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveClass('h-12', 'w-12');
  });
});
