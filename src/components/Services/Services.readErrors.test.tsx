import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getAll: vi.fn() }));
vi.mock('../../services/servicesService', () => ({
  servicesService: { getAll: mocks.getAll },
}));
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: { whatsapp_number: '5500000000000', whatsapp_message: 'Olá' },
  }),
}));

import Services from './Services';

const initialServices = [{
  id: 'installation',
  icon: 'Snowflake',
  title: 'Instalação preservada',
  description: 'Descrição inicial',
  bullet_points: [],
}];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAll.mockResolvedValue(initialServices);
});

describe('Services - falhas de recarga', () => {
  it('preserva serviços exibidos após falha e permite tentar novamente', async () => {
    render(<Services />);
    expect(await screen.findByText('Instalação preservada')).toBeInTheDocument();

    mocks.getAll.mockRejectedValueOnce(new Error('falha de rede privada'));
    fireEvent(window, new Event('online'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os serviços');
    expect(screen.getByText('Instalação preservada')).toBeInTheDocument();

    mocks.getAll.mockResolvedValueOnce([{ ...initialServices[0], id: 'maintenance', title: 'Manutenção atualizada' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Manutenção atualizada')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
