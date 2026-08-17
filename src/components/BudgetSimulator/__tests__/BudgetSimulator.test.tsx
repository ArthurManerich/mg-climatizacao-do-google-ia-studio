import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import BudgetSimulator from '../BudgetSimulator';
import { BudgetProvider } from '../../../context/BudgetContext';
import { SettingsProvider } from '../../../context/SettingsContext';

// Helper function to render BudgetSimulator with providers
const renderWithProvider = () => {
  return render(
    <SettingsProvider>
      <BudgetProvider>
        <BudgetSimulator />
      </BudgetProvider>
    </SettingsProvider>
  );
};

describe('BudgetSimulator Component', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders budget simulator stages', () => {
    renderWithProvider();
    
    expect(screen.getByText('1. Qual serviço você precisa?')).toBeInTheDocument();
  });

  it('updates the selected service on click', async () => {
    renderWithProvider();
    
    const instalacaoBtn = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Instalação'));
    expect(instalacaoBtn).toBeDefined();
    if (instalacaoBtn) {
      expect(instalacaoBtn).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(instalacaoBtn);
      await waitFor(() => {
        expect(instalacaoBtn).toHaveAttribute('aria-pressed', 'true');
      });
    }
  });

  it('opens WhatsApp with pre-filled message on send action after completing steps', async () => {
    const openMock = vi.fn();
    vi.stubGlobal('open', openMock);

    renderWithProvider();

    // Step 1: Select service and click Avançar
    const serviceBtn = screen.getByRole('button', { name: /^Instalação\b/i });
    fireEvent.click(serviceBtn);

    const nextBtn1 = screen.getByRole('button', { name: /Avançar/i });
    fireEvent.click(nextBtn1);

    // Step 2: Select BTU and click Avançar
    await waitFor(() => expect(screen.getByText(/Qual a capacidade do aparelho em BTUs/i)).toBeInTheDocument());
    const btuBtn = screen.getByRole('button', { name: /12\.000 BTUs/i });
    fireEvent.click(btuBtn);

    const nextBtn2 = screen.getByRole('button', { name: /Avançar/i });
    fireEvent.click(nextBtn2);

    // Step 3: Quantity and click Avançar
    await waitFor(() => expect(screen.getByText(/Selecione a quantidade/i)).toBeInTheDocument());
    const nextBtn3 = screen.getByRole('button', { name: /Avançar/i });
    fireEvent.click(nextBtn3);

    // Step 4: Property type and click Avançar
    await waitFor(() => expect(screen.getByText(/Qual o tipo de imóvel/i)).toBeInTheDocument());
    const propertyBtn = screen.getByRole('button', { name: /Residencial|Casa/i });
    fireEvent.click(propertyBtn);

    const nextBtn4 = screen.getByRole('button', { name: /Avançar/i });
    fireEvent.click(nextBtn4);

    // Step 5: Summary & Send WhatsApp
    await waitFor(() => expect(screen.getByText(/Resumo do Pedido/i)).toBeInTheDocument());
    const sendBtn = screen.getByRole('button', { name: /CHAMAR NO WHATSAPP|AGENDAR PELO WHATSAPP/i });
    fireEvent.click(sendBtn);

    expect(openMock).toHaveBeenCalled();
    expect(openMock.mock.calls[0][0]).toContain('wa.me');
    expect(openMock.mock.calls[0][1]).toBe('whatsapp');
  });
});
