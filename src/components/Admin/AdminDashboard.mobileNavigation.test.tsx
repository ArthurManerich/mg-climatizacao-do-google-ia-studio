import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAdminData: vi.fn(),
  setActiveTab: vi.fn(),
  setMobileMenuOpen: vi.fn(),
  handleLogout: vi.fn(),
}));

vi.mock('./Hooks/useAdminData', () => ({ useAdminData: mocks.useAdminData }));
vi.mock('./Dashboard/DashboardHome', () => ({ DashboardHome: () => <div>dashboard mobile</div> }));
vi.mock('./Managers', () => ({
  PortfolioManager: () => <div>portfólio mobile</div>,
  BeforeAfterManager: () => <div>antes e depois mobile</div>,
  ServicesManager: () => <div>serviços mobile</div>,
  FAQManager: () => <div>faq mobile</div>,
  SettingsManager: () => <div>configurações mobile</div>,
  SimulatorManager: () => <div>simulador mobile</div>,
}));

import AdminDashboard from './AdminDashboard';

function adminState(overrides: Record<string, unknown> = {}) {
  return {
    email: 'admin@example.test',
    activeTab: 'dashboard',
    setActiveTab: mocks.setActiveTab,
    mobileMenuOpen: false,
    setMobileMenuOpen: mocks.setMobileMenuOpen,
    handleLogout: mocks.handleLogout,
    loading: false,
    hasLoadedOnce: true,
    hasError: false,
    errorMessage: null,
    reloadAllData: vi.fn(),
    portfolios: [],
    beforeAfters: [],
    services: [],
    faqs: [],
    companyName: 'MG Climatização',
    companyPhone: '',
    companyAddress: '',
    companyLogo: '',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.handleLogout.mockResolvedValue(undefined);
  mocks.useAdminData.mockReturnValue(adminState());
});

describe('AdminDashboard - navegação mobile', () => {
  it('exibe um único header mobile com hambúrguer à esquerda e perfil à direita', () => {
    render(<AdminDashboard />);

    const headers = screen.getAllByRole('banner');
    expect(headers).toHaveLength(1);
    const headerButtons = within(headers[0]).getAllByRole('button');
    expect(headerButtons[0]).toHaveAccessibleName('Abrir menu administrativo');
    expect(headerButtons[1]).toHaveAccessibleName('Abrir menu da conta');
    expect(within(headers[0]).getByText('Início')).toBeInTheDocument();
  });

  it('oferece cinco destinos na Bottom Navigation e mantém a sidebar apenas no desktop', () => {
    render(<AdminDashboard />);

    const bottomNavigation = screen.getByRole('navigation', { name: 'Navegação principal administrativa' });
    expect(within(bottomNavigation).getAllByRole('button')).toHaveLength(5);
    expect(within(bottomNavigation).getByRole('button', { name: 'Início' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('complementary', { name: 'Navegação administrativa desktop' })).toHaveClass('hidden', 'md:flex');
  });

  it('abre o menu Mais, fecha ao selecionar e reutiliza a mudança de aba existente', () => {
    const state = adminState();
    mocks.useAdminData.mockReturnValue(state);
    const view = render(<AdminDashboard />);

    const bottomNavigation = screen.getByRole('navigation', { name: 'Navegação principal administrativa' });
    fireEvent.click(within(bottomNavigation).getByRole('button', { name: 'Mais opções' }));
    expect(mocks.setMobileMenuOpen).toHaveBeenCalledWith(true);

    mocks.useAdminData.mockReturnValue(adminState({ mobileMenuOpen: true }));
    view.rerender(<AdminDashboard />);
    const drawer = screen.getByRole('dialog', { name: 'Mais opções administrativas' });
    fireEvent.click(within(drawer).getByRole('button', { name: 'Serviços' }));

    expect(mocks.setActiveTab).toHaveBeenCalledWith('services');
    expect(mocks.setMobileMenuOpen).toHaveBeenCalledWith(false);
  });

  it('fecha o drawer pelo backdrop', () => {
    mocks.useAdminData.mockReturnValue(adminState({ mobileMenuOpen: true }));
    render(<AdminDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar menu administrativo' }));
    expect(mocks.setMobileMenuOpen).toHaveBeenCalledWith(false);
  });

  it('abre e fecha o perfil e mantém o logout no handler existente', () => {
    render(<AdminDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu da conta' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('admin@example.test')).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Sair' }));
    expect(mocks.handleLogout).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu da conta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar menu da conta' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('destaca Mais para seções secundárias e compensa a navegação fixa', () => {
    mocks.useAdminData.mockReturnValue(adminState({ activeTab: 'settings' }));
    render(<AdminDashboard />);

    const bottomNavigation = screen.getByRole('navigation', { name: 'Navegação principal administrativa' });
    expect(within(bottomNavigation).getByRole('button', { name: 'Mais opções' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('admin-main-content')).toHaveClass('pb-[calc(6.5rem+env(safe-area-inset-bottom))]');
  });

  it('altera diretamente uma seção principal pela barra inferior', () => {
    render(<AdminDashboard />);
    const bottomNavigation = screen.getByRole('navigation', { name: 'Navegação principal administrativa' });

    fireEvent.click(within(bottomNavigation).getByRole('button', { name: 'Portfólio' }));
    expect(mocks.setActiveTab).toHaveBeenCalledWith('portfolio');
    expect(mocks.setMobileMenuOpen).toHaveBeenCalledWith(false);
  });
});
