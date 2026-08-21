import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WhatsAppContactProvider, useWhatsAppContact } from './WhatsAppContactContext';

function Opener() {
  const { openWhatsAppSelector } = useWhatsAppContact();
  return <button type="button" onClick={() => openWhatsAppSelector('Mensagem original com detalhes')}>Abrir contatos</button>;
}

describe('seletor central de WhatsApp', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['Marcos Manerich', '5547988353004'],
    ['Gabriel Klaumann', '5547997464218'],
  ])('abre %s com o destino correto e preserva a mensagem', (name, number) => {
    const openMock = vi.fn();
    vi.stubGlobal('open', openMock);
    render(<WhatsAppContactProvider><Opener /></WhatsAppContactProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir contatos' }));
    expect(openMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));

    const url = decodeURIComponent(String(openMock.mock.calls[0][0]));
    expect(url).toContain(`wa.me/${number}`);
    expect(url).toContain('Mensagem original com detalhes');
  });

  it('fecha com Escape, restaura rolagem e devolve o foco ao acionador', () => {
    render(<WhatsAppContactProvider><Opener /></WhatsAppContactProvider>);
    const opener = screen.getByRole('button', { name: 'Abrir contatos' });
    opener.focus();
    fireEvent.click(opener);

    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(opener).toHaveFocus();
  });

  it('mantém o foco dentro do diálogo ao navegar com Tab', () => {
    render(<WhatsAppContactProvider><Opener /></WhatsAppContactProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir contatos' }));
    const closeButton = screen.getByRole('button', { name: 'Fechar seleção de contato' });
    const gabrielButton = screen.getByRole('button', { name: /Gabriel Klaumann/ });

    gabrielButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(gabrielButton).toHaveFocus();
  });
});
