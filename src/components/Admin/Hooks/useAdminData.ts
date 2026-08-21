import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { portfolioService } from '../../../services/portfolioService';
import { beforeAfterService } from '../../../services/beforeAfterService';
import { servicesService } from '../../../services/servicesService';
import { faqService } from '../../../services/faqService';
import { testimonialsService } from '../../../services/testimonialsService';
import { settingsService } from '../../../services/settingsService';
import { adminSettingsService } from '../../../services/adminSettingsService';
import { usePortfolio } from './usePortfolio';
import { useBeforeAfter } from './useBeforeAfter';
import { useServices } from './useServices';
import { useFAQ } from './useFAQ';
import { useSettings } from './useSettings';

export type TabType = 'dashboard' | 'portfolio' | 'before_after' | 'services' | 'faq' | 'simulator' | 'settings' | 'whatsapp';

export function useAdminData() {
  const [email, setEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);
  const navigate = useNavigate();

  // Modular domain hooks
  const portfolioHook = usePortfolio();
  const beforeAfterHook = useBeforeAfter();
  const servicesHook = useServices();
  const faqHook = useFAQ();
  const settingsHook = useSettings();

  // Additional data
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [whatsappConfig, setWhatsappConfig] = useState<any>(null);
  const [budgetPrices, setBudgetPrices] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await authService.getCurrentUser();
      if (data.user) {
        setEmail(data.user.email || 'administrador@mgclimatizacao.com.br');
      }
    };
    fetchUser();
  }, []);

  const loadAllData = async () => {
    const requestId = ++loadRequestIdRef.current;
    setLoading(true);

    const results = await Promise.allSettled([
      portfolioService.getAll(),
      beforeAfterService.getAll(),
      servicesService.getAll(),
      faqService.getAll(),
      testimonialsService.getAll(),
      adminSettingsService.getBudgetPrices(),
      settingsService.getCompanySettings()
    ] as const);

    if (requestId !== loadRequestIdRef.current) return;

    const [portfolioResult, beforeAfterResult, servicesResult, faqResult, testimonialsResult, budgetResult, companyResult] = results;
    const failedSections: string[] = [];

    if (portfolioResult.status === 'fulfilled') {
      portfolioHook.setPortfolios(portfolioResult.value);
    } else {
      failedSections.push('Portfólio');
    }

    if (beforeAfterResult.status === 'fulfilled') {
      beforeAfterHook.setBeforeAfters(beforeAfterResult.value);
    } else {
      failedSections.push('Antes & Depois');
    }

    if (servicesResult.status === 'fulfilled') {
      servicesHook.setServices(servicesResult.value);
    } else {
      failedSections.push('Serviços');
    }

    if (faqResult.status === 'fulfilled') {
      faqHook.setFaqs(faqResult.value);
    } else {
      failedSections.push('FAQ');
    }

    if (testimonialsResult.status === 'fulfilled') {
      setTestimonials(testimonialsResult.value);
    } else {
      failedSections.push('Depoimentos');
    }

    if (budgetResult.status === 'fulfilled') {
      setBudgetPrices(budgetResult.value);
    } else {
      failedSections.push('Simulador');
    }

    if (companyResult.status === 'fulfilled') {
      const compSettings = companyResult.value.settings;
      const waData = {
        number: compSettings.whatsapp_number,
        message: compSettings.whatsapp_message,
      };

      setWhatsappConfig(waData);
      settingsHook.setCompanyName(compSettings.company_name || 'mgclimatizacao');
      settingsHook.setCompanyWhatsapp(compSettings.whatsapp_number || waData.number || '5547997464218');
      settingsHook.setCompanyWhatsappMessage(compSettings.whatsapp_message || waData.message || 'Olá, MG Climatização! Gostaria de solicitar um orçamento para climatização.');
      settingsHook.setCompanyAddress(compSettings.address || 'Blumenau - SC');
      settingsHook.setCompanyPhone(compSettings.phone || '(47) 99746-4218');
      settingsHook.setCompanyEmail(compSettings.email || 'contato@mgclimatizacao.com.br');
      settingsHook.setCompanyInstagram(compSettings.instagram || 'https://instagram.com/mgclimatizacao');
      settingsHook.setCompanyFacebook(compSettings.facebook || '');
      settingsHook.initializeCompanyLogo(compSettings.logo_url || '');
    } else {
      failedSections.push('Configurações');
    }

    if (failedSections.length > 0) {
      setHasError(true);
      setErrorMessage(`Não foi possível atualizar: ${failedSections.join(', ')}. Os demais dados foram preservados.`);
    } else {
      setHasError(false);
      setErrorMessage(null);
    }

    setHasLoadedOnce(true);
    setLoading(false);
  };

  useEffect(() => {
    void loadAllData();
    return () => {
      loadRequestIdRef.current += 1;
    };
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/login');
  };

  return {
    email,
    activeTab,
    setActiveTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    loading,
    hasLoadedOnce,
    hasError,
    errorMessage,
    reloadAllData: loadAllData,
    testimonials,
    whatsappConfig,
    budgetPrices,
    handleLogout,

    // Portfolio
    portfolios: portfolioHook.portfolios,
    isPortfolioFormOpen: portfolioHook.isPortfolioFormOpen,
    setIsPortfolioFormOpen: portfolioHook.setIsPortfolioFormOpen,
    portfolioFormMode: portfolioHook.portfolioFormMode,
    editingPortfolioId: portfolioHook.editingPortfolioId,
    setEditingPortfolioId: portfolioHook.setEditingPortfolioId,
    portfolioTitle: portfolioHook.portfolioTitle,
    setPortfolioTitle: portfolioHook.setPortfolioTitle,
    portfolioDescription: portfolioHook.portfolioDescription,
    setPortfolioDescription: portfolioHook.setPortfolioDescription,
    portfolioCategory: portfolioHook.portfolioCategory,
    setPortfolioCategory: portfolioHook.setPortfolioCategory,
    portfolioImg: portfolioHook.portfolioImg,
    setPortfolioImg: portfolioHook.setPortfolioImg,
    portfolioImages: portfolioHook.portfolioImages,
    setPortfolioImages: portfolioHook.setPortfolioImages,
    handleRemoveImage: portfolioHook.handleRemoveImage,
    handleCancelPortfolioForm: portfolioHook.handleCancelPortfolioForm,
    portfolioSaving: portfolioHook.portfolioSaving,
    portfolioUploadLoading: portfolioHook.portfolioUploadLoading,
    portfolioUploadProgress: portfolioHook.portfolioUploadProgress,
    portfolioMessage: portfolioHook.portfolioMessage,
    setPortfolioMessage: portfolioHook.setPortfolioMessage,
    deleteConfirmationId: portfolioHook.deleteConfirmationId,
    deletingPortfolioId: portfolioHook.deletingPortfolioId,
    setDeleteConfirmationId: portfolioHook.setDeleteConfirmationId,
    handleOpenCreateForm: portfolioHook.handleOpenCreateForm,
    handleStartEdit: portfolioHook.handleStartEdit,
    handleImageUpload: portfolioHook.handleImageUpload,
    handleSavePortfolio: portfolioHook.handleSavePortfolio,
    handleDeletePortfolio: portfolioHook.handleDeletePortfolio,

    // Before / After
    beforeAfters: beforeAfterHook.beforeAfters,
    isBeforeAfterFormOpen: beforeAfterHook.isBeforeAfterFormOpen,
    setIsBeforeAfterFormOpen: beforeAfterHook.setIsBeforeAfterFormOpen,
    beforeAfterFormMode: beforeAfterHook.beforeAfterFormMode,
    editingBeforeAfterId: beforeAfterHook.editingBeforeAfterId,
    setEditingBeforeAfterId: beforeAfterHook.setEditingBeforeAfterId,
    beforeAfterTitle: beforeAfterHook.beforeAfterTitle,
    setBeforeAfterTitle: beforeAfterHook.setBeforeAfterTitle,
    beforeAfterDescription: beforeAfterHook.beforeAfterDescription,
    setBeforeAfterDescription: beforeAfterHook.setBeforeAfterDescription,
    beforeAfterCategory: beforeAfterHook.beforeAfterCategory,
    setBeforeAfterCategory: beforeAfterHook.setBeforeAfterCategory,
    beforeAfterBeforeImg: beforeAfterHook.beforeAfterBeforeImg,
    setBeforeAfterBeforeImg: beforeAfterHook.setBeforeAfterBeforeImg,
    beforeAfterAfterImg: beforeAfterHook.beforeAfterAfterImg,
    setBeforeAfterAfterImg: beforeAfterHook.setBeforeAfterAfterImg,
    beforeAfterSaving: beforeAfterHook.beforeAfterSaving,
    beforeAfterBeforeUploadLoading: beforeAfterHook.beforeAfterBeforeUploadLoading,
    beforeAfterBeforeProgress: beforeAfterHook.beforeAfterBeforeProgress,
    beforeAfterAfterUploadLoading: beforeAfterHook.beforeAfterAfterUploadLoading,
    beforeAfterAfterProgress: beforeAfterHook.beforeAfterAfterProgress,
    beforeAfterMessage: beforeAfterHook.beforeAfterMessage,
    setBeforeAfterMessage: beforeAfterHook.setBeforeAfterMessage,
    deleteBeforeAfterConfirmationId: beforeAfterHook.deleteBeforeAfterConfirmationId,
    deletingBeforeAfterId: beforeAfterHook.deletingBeforeAfterId,
    setDeleteBeforeAfterConfirmationId: beforeAfterHook.setDeleteBeforeAfterConfirmationId,
    handleOpenBeforeAfterCreateForm: beforeAfterHook.handleOpenBeforeAfterCreateForm,
    handleStartBeforeAfterEdit: beforeAfterHook.handleStartBeforeAfterEdit,
    handleBeforeImageUpload: beforeAfterHook.handleBeforeImageUpload,
    handleAfterImageUpload: beforeAfterHook.handleAfterImageUpload,
    handleSaveBeforeAfter: beforeAfterHook.handleSaveBeforeAfter,
    handleDeleteBeforeAfter: beforeAfterHook.handleDeleteBeforeAfter,
    handleCancelBeforeAfterForm: beforeAfterHook.handleCancelBeforeAfterForm,

    // Services
    services: servicesHook.services,

    // FAQ
    faqs: faqHook.faqs,
    isFaqFormOpen: faqHook.isFaqFormOpen,
    setIsFaqFormOpen: faqHook.setIsFaqFormOpen,
    faqFormMode: faqHook.faqFormMode,
    editingFaqId: faqHook.editingFaqId,
    setEditingFaqId: faqHook.setEditingFaqId,
    faqQuestion: faqHook.faqQuestion,
    setFaqQuestion: faqHook.setFaqQuestion,
    faqAnswer: faqHook.faqAnswer,
    setFaqAnswer: faqHook.setFaqAnswer,
    faqOrderIndex: faqHook.faqOrderIndex,
    setFaqOrderIndex: faqHook.setFaqOrderIndex,
    faqSaving: faqHook.faqSaving,
    faqMessage: faqHook.faqMessage,
    setFaqMessage: faqHook.setFaqMessage,
    deleteFaqConfirmationId: faqHook.deleteFaqConfirmationId,
    deletingFaqId: faqHook.deletingFaqId,
    setDeleteFaqConfirmationId: faqHook.setDeleteFaqConfirmationId,
    handleOpenFaqCreateForm: faqHook.handleOpenFaqCreateForm,
    handleStartFaqEdit: faqHook.handleStartFaqEdit,
    handleSaveFaq: faqHook.handleSaveFaq,
    handleDeleteFaq: faqHook.handleDeleteFaq,

    // Settings
    companyName: settingsHook.companyName,
    setCompanyName: settingsHook.setCompanyName,
    companyWhatsapp: settingsHook.companyWhatsapp,
    setCompanyWhatsapp: settingsHook.setCompanyWhatsapp,
    companyWhatsappMessage: settingsHook.companyWhatsappMessage,
    setCompanyWhatsappMessage: settingsHook.setCompanyWhatsappMessage,
    companyAddress: settingsHook.companyAddress,
    setCompanyAddress: settingsHook.setCompanyAddress,
    companyPhone: settingsHook.companyPhone,
    setCompanyPhone: settingsHook.setCompanyPhone,
    companyEmail: settingsHook.companyEmail,
    setCompanyEmail: settingsHook.setCompanyEmail,
    companyInstagram: settingsHook.companyInstagram,
    setCompanyInstagram: settingsHook.setCompanyInstagram,
    companyFacebook: settingsHook.companyFacebook,
    setCompanyFacebook: settingsHook.setCompanyFacebook,
    companyLogo: settingsHook.companyLogo,
    pendingLogoUrls: settingsHook.pendingLogoUrls,
    setCompanyLogo: settingsHook.setCompanyLogo,
    settingsSaving: settingsHook.settingsSaving,
    settingsMessage: settingsHook.settingsMessage,
    setSettingsMessage: settingsHook.setSettingsMessage,
    logoUploadLoading: settingsHook.logoUploadLoading,
    logoUploadProgress: settingsHook.logoUploadProgress,
    handleSaveSettings: settingsHook.handleSaveSettings,
    handleLogoUpload: settingsHook.handleLogoUpload,
    handleCancelLogoChange: settingsHook.handleCancelLogoChange
  };
}
