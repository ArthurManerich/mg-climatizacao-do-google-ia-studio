import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAdminData: vi.fn(),
  reloadAllData: vi.fn(),
}));

vi.mock('./Hooks/useAdminData', () => ({ useAdminData: mocks.useAdminData }));
vi.mock('./Dashboard/DashboardHome', () => ({ DashboardHome: () => <div>conteúdo preservado</div> }));
vi.mock('./Managers', () => ({
  PortfolioManager: () => null,
  BeforeAfterManager: () => null,
  ServicesManager: () => null,
  FAQManager: () => null,
  SettingsManager: () => null,
  SimulatorManager: () => null,
}));

import AdminDashboard from './AdminDashboard';

function adminState(overrides: Record<string, unknown> = {}) {
  return {
    email: 'admin@example.test',
    activeTab: 'dashboard',
    setActiveTab: vi.fn(),
    mobileMenuOpen: false,
    setMobileMenuOpen: vi.fn(),
    handleLogout: vi.fn(),
    loading: false,
    hasLoadedOnce: true,
    hasError: true,
    errorMessage: 'Não foi possível atualizar: Portfólio. Os demais dados foram preservados.',
    reloadAllData: mocks.reloadAllData,
    portfolios: [],
    beforeAfters: [],
    services: [],
    faqs: [],
    companyName: 'MG',
    companyPhone: '',
    companyAddress: '',
    companyLogo: '',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.reloadAllData.mockResolvedValue(undefined);
});

describe('AdminDashboard - falhas parciais de leitura', () => {
  it('diferencia a primeira carga antes de exibir estados vazios', () => {
    mocks.useAdminData.mockReturnValue(adminState({ loading: true, hasLoadedOnce: false, hasError: false }));
    render(<AdminDashboard />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.getByText('Buscando dados do servidor e banco...')).toBeInTheDocument();
    expect(screen.queryByText('conteúdo preservado')).not.toBeInTheDocument();
  });

  it('mantém o painel visível e permite tentar novamente', () => {
    mocks.useAdminData.mockReturnValue(adminState());
    render(<AdminDashboard />);

    expect(screen.getByRole('alert')).toHaveTextContent('Portfólio');
    expect(screen.getByText('conteúdo preservado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(mocks.reloadAllData).toHaveBeenCalledTimes(1);
  });

  it('mostra o estado da tentativa sem esconder dados anteriores', () => {
    mocks.useAdminData.mockReturnValue(adminState({ loading: true }));
    render(<AdminDashboard />);

    expect(screen.getByRole('button', { name: 'Tentando...' })).toBeDisabled();
    expect(screen.getByText('conteúdo preservado')).toBeInTheDocument();
    expect(screen.queryByText('Buscando dados do servidor e banco...')).not.toBeInTheDocument();
  });
});
