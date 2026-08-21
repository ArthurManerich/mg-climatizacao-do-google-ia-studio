import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Contact from '../Contact/Contact';
import FloatingWhatsApp from '../WhatsAppButton/FloatingWhatsApp';
import Footer from './Footer';

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: {
      company_name: 'MG Climatização',
      logo_url: '',
      whatsapp_number: '5547997464218',
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
    render(<Contact />);
    expect(screen.queryByText(/Seg a Sáb|08h às 18h/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solicitar orçamento' })).toHaveAttribute('href', expect.stringContaining('wa.me'));
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
    render(<FloatingWhatsApp />);
    const button = screen.getByRole('link', { name: 'Solicitar orçamento no WhatsApp' });
    expect(button).toHaveClass('h-12', 'w-12');
    expect(button.className).toContain('safe-area-inset-bottom');
    expect(button.className).not.toMatch(/animate-(bounce|pulse|ping)/);
  });
});
