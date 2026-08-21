import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BudgetSimulator from '../BudgetSimulator';
import { BudgetProvider } from '../../../context/BudgetContext';
import { SettingsProvider } from '../../../context/SettingsContext';
import { WhatsAppContactProvider } from '../../../context/WhatsAppContactContext';

const renderWithProvider = () => render(
  <SettingsProvider>
    <WhatsAppContactProvider>
      <BudgetProvider>
        <BudgetSimulator />
      </BudgetProvider>
    </WhatsAppContactProvider>
  </SettingsProvider>,
);

const selectServiceAndContinue = () => {
  fireEvent.click(screen.getByRole('button', { name: /^Instalação$/i }));
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
};

const completeRequest = async () => {
  selectServiceAndContinue();

  await screen.findByRole('heading', { name: /Equipamento e necessidade/i });
  fireEvent.change(screen.getByLabelText(/Tipo ou capacidade do equipamento/i), { target: { value: 'nao-sei' } });
  fireEvent.change(screen.getByLabelText(/Problema ou necessidade/i), { target: { value: 'O aparelho não está resfriando.' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

  await screen.findByRole('heading', { name: /Onde será o atendimento/i });
  fireEvent.change(screen.getByLabelText(/Tipo de imóvel/i), { target: { value: 'casa' } });
  fireEvent.change(screen.getByLabelText(/^Cidade$/i), { target: { value: 'Blumenau' } });
  fireEvent.change(screen.getByLabelText(/Endereço do serviço/i), { target: { value: 'Rua das Flores, 100' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

  await screen.findByRole('heading', { name: /Como podemos identificar você/i });
  fireEvent.change(screen.getByLabelText(/Nome completo/i), { target: { value: 'Maria da Silva' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

  await screen.findByRole('heading', { name: /Revise sua solicitação/i });
};

describe('BudgetSimulator Component', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('apresenta o fluxo como montagem de solicitação, sem preço público', () => {
    renderWithProvider();

    expect(screen.getByRole('heading', { name: /Conte o que você precisa/i })).toBeInTheDocument();
    expect(screen.getByText(/Passo 1 de 5/i)).toBeInTheDocument();
    expect(screen.queryByText(/R\$|Valor Estimado|simular preço|orçamento na hora/i)).not.toBeInTheDocument();
  });

  it('mostra validação objetiva quando o serviço não foi informado', () => {
    renderWithProvider();

    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Selecione o serviço desejado.');
  });

  it('permite voltar para revisar uma etapa anterior', async () => {
    renderWithProvider();
    selectServiceAndContinue();

    await screen.findByRole('heading', { name: /Equipamento e necessidade/i });
    fireEvent.click(screen.getByRole('button', { name: /Voltar/i }));

    expect(await screen.findByText(/Qual serviço você precisa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Instalação$/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('monta a mensagem do WhatsApp sem preço e limpa os dados ao iniciar nova solicitação', async () => {
    const openMock = vi.fn();
    vi.stubGlobal('open', openMock);
    renderWithProvider();

    await completeRequest();

    expect(screen.getByText('Maria da Silva')).toBeInTheDocument();
    expect(screen.getByText('Rua das Flores, 100')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Editar/i })).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: /Enviar pelo WhatsApp/i }));

    expect(screen.getByRole('dialog', { name: /Com quem você deseja falar/i })).toBeInTheDocument();
    expect(openMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Marcos Manerich/i }));

    expect(openMock).toHaveBeenCalledOnce();
    const whatsappUrl = String(openMock.mock.calls[0][0]);
    const decodedUrl = decodeURIComponent(whatsappUrl);
    expect(decodedUrl).toContain('Nome: Maria da Silva');
    expect(decodedUrl).toContain('Cidade: Blumenau');
    expect(decodedUrl).toContain('Endereço do serviço: Rua das Flores, 100');
    expect(decodedUrl).toContain('Equipamento: Não sei informar');
    expect(decodedUrl).toContain('Necessidade: O aparelho não está resfriando.');
    expect(decodedUrl).not.toMatch(/R\$|preço|estimad|desconto/i);
    expect(openMock.mock.calls[0][1]).toBe('whatsapp');

    fireEvent.click(screen.getByRole('button', { name: /Nova solicitação/i }));
    expect(await screen.findByText(/Qual serviço você precisa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Instalação$/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('permite editar o resumo sem perder os dados em memória', async () => {
    renderWithProvider();
    await completeRequest();

    fireEvent.click(screen.getAllByRole('button', { name: /Editar/i })[2]);

    expect(await screen.findByDisplayValue('Blumenau')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rua das Flores, 100')).toBeInTheDocument();
  });
});
