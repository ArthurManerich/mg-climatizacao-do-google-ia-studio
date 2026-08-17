import React, { type ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PortfolioManager } from './PortfolioManager';
import { ServicesManager } from './ServicesManager';
import { SettingsManager } from './SettingsManager';

const portfolioProps: ComponentProps<typeof PortfolioManager> = {
  portfolios: [],
  isPortfolioFormOpen: false,
  portfolioFormMode: 'create',
  editingPortfolioId: null,
  portfolioTitle: '',
  portfolioDescription: '',
  portfolioCategory: 'instalacao',
  portfolioImg: '',
  portfolioImages: [],
  portfolioSaving: false,
  portfolioUploadLoading: false,
  portfolioUploadProgress: 0,
  portfolioMessage: null,
  deleteConfirmationId: null,
  deletingPortfolioId: null,
  setIsPortfolioFormOpen: vi.fn(),
  setEditingPortfolioId: vi.fn(),
  setPortfolioTitle: vi.fn(),
  setPortfolioDescription: vi.fn(),
  setPortfolioCategory: vi.fn(),
  setPortfolioImg: vi.fn(),
  setPortfolioMessage: vi.fn(),
  setDeleteConfirmationId: vi.fn(),
  handleOpenCreateForm: vi.fn(),
  handleStartEdit: vi.fn(),
  handleSavePortfolio: vi.fn(),
  handleDeletePortfolio: vi.fn(),
  handleImageUpload: vi.fn(),
  handleRemoveImage: vi.fn(),
  handleCancelPortfolioForm: vi.fn(),
};

const settingsProps: ComponentProps<typeof SettingsManager> = {
  companyName: 'MG Climatização',
  companyEmail: 'contato@example.test',
  companyLogo: '',
  companyPhone: '(47) 99999-9999',
  companyWhatsapp: '5547999999999',
  companyWhatsappMessage: 'Olá',
  companyAddress: 'Blumenau - SC',
  companyInstagram: '',
  companyFacebook: '',
  settingsSaving: false,
  logoUploadLoading: false,
  logoUploadProgress: 0,
  settingsMessage: null,
  pendingLogoUrls: [],
  setCompanyName: vi.fn(),
  setCompanyEmail: vi.fn(),
  setCompanyLogo: vi.fn(),
  setCompanyPhone: vi.fn(),
  setCompanyWhatsapp: vi.fn(),
  setCompanyWhatsappMessage: vi.fn(),
  setCompanyAddress: vi.fn(),
  setCompanyInstagram: vi.fn(),
  setCompanyFacebook: vi.fn(),
  handleSaveSettings: vi.fn(),
  handleLogoUpload: vi.fn(),
  handleCancelLogoChange: vi.fn(),
};

describe('conteúdo essencial dos Managers', () => {
  it('mantém título, CTA e estado vazio do Portfólio sem registros', () => {
    render(<PortfolioManager {...portfolioProps} />);

    expect(screen.getByRole('heading', { name: 'Gerenciador de Portfólio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cadastrar Serviço/i })).toBeInTheDocument();
    expect(screen.getByText('Nenhum item cadastrado')).toBeInTheDocument();
    expect(screen.getByText(/criar o primeiro registro/i)).toBeInTheDocument();
  });

  it('mantém título, labels principais e ação de salvar em Configurações', () => {
    render(<SettingsManager {...settingsProps} />);

    expect(screen.getByRole('heading', { name: 'Configurações do Sistema' })).toBeInTheDocument();
    expect(screen.getByText('Nome da Empresa')).toBeInTheDocument();
    expect(screen.getByText('Email de Contato')).toBeInTheDocument();
    expect(screen.getByText(/Número do WhatsApp/i)).toBeInTheDocument();
    expect(screen.getByText('Endereço Comercial')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar Configurações/i })).toBeInTheDocument();
  });

  it('diferencia lista vazia de Serviços com uma mensagem explícita', () => {
    render(<ServicesManager services={[]} />);

    expect(screen.getByRole('heading', { name: 'Especialidades de Serviço' })).toBeInTheDocument();
    expect(screen.getByText('Nenhum serviço cadastrado')).toBeInTheDocument();
  });
});
