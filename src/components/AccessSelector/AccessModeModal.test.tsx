import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AccessModeModal from './AccessModeModal';

function ModalHarness() {
  const [open, setOpen] = React.useState(false);
  return <><button type="button" onClick={() => setOpen(true)}>Abrir seletor</button><AccessModeModal isOpen={open} onClose={() => setOpen(false)} /></>;
}

describe('AccessModeModal', () => {
  it('prende o foco, bloqueia a rolagem e restaura ambos ao fechar', async () => {
    render(<MemoryRouter><ModalHarness /></MemoryRouter>);
    const opener = screen.getByRole('button', { name: 'Abrir seletor' });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: 'Fechar janela de seleção de acesso' })).toHaveFocus();
    expect(document.querySelector('button button')).not.toBeInTheDocument();

    const admin = screen.getByRole('button', { name: /Área administrativa/ });
    admin.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Fechar janela de seleção de acesso' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe('');
    expect(opener).toHaveFocus();
  });
});
