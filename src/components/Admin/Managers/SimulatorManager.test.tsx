import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addService: vi.fn(), removeService: vi.fn(), addCapacity: vi.fn(), removeCapacity: vi.fn(),
  addPropertyType: vi.fn(), removePropertyType: vi.fn(), saveConfig: vi.fn(), reloadConfig: vi.fn(),
}));

vi.mock('../Hooks/useSimulator', () => ({
  useSimulator: () => ({
    config: {
      services: [{ id: 'instalacao', label: 'Instalação', icon: 'Wind', description: 'Serviço' }],
      capacities: [{ id: '12000', label: '12.000 BTUs', desc: 'Capacidade' }],
      propertyTypes: [{ id: 'casa', label: 'Casa' }],
    },
    loading: false, saving: false, error: null, success: null,
    ...mocks,
  }),
}));

import { SimulatorManager } from './SimulatorManager';

beforeEach(() => vi.clearAllMocks());

describe('SimulatorManager', () => {
  it('exibe somente serviços, BTUs e tipos de imóvel, sem controles financeiros', () => {
    render(<SimulatorManager />);
    expect(screen.getByRole('heading', { name: 'Opções do simulador' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Serviços do simulador' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Capacidades em BTUs' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tipos de imóvel' })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/tabela de preços|matriz de preços|multiplicador|valor estimado|R\$/i);
  });

  it('mantém serviços, capacidades e tipos de imóvel administráveis', () => {
    render(<SimulatorManager />);
    fireEvent.change(screen.getByLabelText('Identificador'), { target: { value: 'higienizacao' } });
    fireEvent.change(screen.getByLabelText('Nome do serviço'), { target: { value: 'Higienização' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar serviço' }));
    expect(mocks.addService).toHaveBeenCalledWith(expect.objectContaining({ id: 'higienizacao', label: 'Higienização' }));

    fireEvent.click(screen.getByRole('tab', { name: 'Capacidades em BTUs' }));
    expect(screen.getByRole('button', { name: 'Adicionar capacidade' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Tipos de imóvel' }));
    expect(screen.getByRole('button', { name: 'Adicionar tipo de imóvel' })).toBeInTheDocument();
  });

  it('exige confirmação antes de excluir cada categoria', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<SimulatorManager />);
    fireEvent.click(screen.getByRole('button', { name: 'Remover serviço Instalação' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(mocks.removeService).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('tab', { name: 'Capacidades em BTUs' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover capacidade 12.000 BTUs' }));
    expect(mocks.removeCapacity).toHaveBeenCalledWith('12000');
    fireEvent.click(screen.getByRole('tab', { name: 'Tipos de imóvel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover tipo de imóvel Casa' }));
    expect(mocks.removePropertyType).toHaveBeenCalledWith('casa');
    confirm.mockRestore();
  });
});
