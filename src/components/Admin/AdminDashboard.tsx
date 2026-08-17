import React from 'react';
import { 
  LogOut, 
  Tv, 
  User,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminData, TabType } from './Hooks/useAdminData';
import { DashboardHome } from './Dashboard/DashboardHome';
import { 
  PortfolioManager, 
  BeforeAfterManager, 
  ServicesManager, 
  FAQManager, 
  SettingsManager,
  SimulatorManager
} from './Managers';
import {
  ADMIN_DESTINATIONS,
  MobileAdminDrawer,
  MobileAdminHeader,
  MobileBottomNavigation,
} from './Navigation';

export default function AdminDashboard() {
  const admin = useAdminData();
  const handleSelectTab = (tab: TabType) => {
    admin.setActiveTab(tab);
    admin.setMobileMenuOpen(false);
  };

  return (
    <div className="admin-mobile-theme min-h-screen overflow-x-hidden bg-[#121212] text-[#F5F5F5] font-sans flex flex-col md:flex-row md:bg-slate-950 md:text-slate-100 antialiased selection:bg-[#0096D6] selection:text-white">
      <MobileAdminHeader
        activeTab={admin.activeTab}
        email={admin.email}
        onOpenDrawer={() => admin.setMobileMenuOpen(true)}
        onLogout={admin.handleLogout}
      />
      <MobileAdminDrawer
        open={admin.mobileMenuOpen}
        activeTab={admin.activeTab}
        onClose={() => admin.setMobileMenuOpen(false)}
        onSelectTab={handleSelectTab}
        onLogout={admin.handleLogout}
      />

      {/* SIDEBAR NAVIGATION */}
      <aside aria-label="Navegação administrativa desktop" className="hidden md:flex md:static md:w-64 md:shrink-0 bg-[#001D38]/95 backdrop-blur-xl border-r border-[#002E5C] flex-col justify-between">
        <div className="p-6 space-y-8">
          
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0096D6] to-[#00B2FF] text-white flex items-center justify-center font-black shadow-lg shadow-[#0096D6]/20">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black font-display text-base tracking-wide text-white uppercase">MG Climatização</h2>
              <span className="text-[10px] font-bold text-[#00B2FF] bg-[#0096D6]/20 px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#0096D6]/30">
                Painel do Cliente
              </span>
            </div>
          </div>

          {/* NAV MENU */}
          <nav className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 block mb-2">
              Navegação Principal
            </span>

            {ADMIN_DESTINATIONS.map((item) => {
              const Icon = item.icon;
              const isActive = admin.activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-[#0096D6] text-white shadow-lg shadow-[#0096D6]/20 font-black' 
                      : 'text-slate-300 hover:text-white hover:bg-[#002E5C]/60'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div className="p-4 border-t border-[#002E5C] bg-[#001428]/60 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#002E5C] border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{admin.email || 'Administrador'}</p>
              <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Autenticado
              </span>
            </div>
          </div>

          <button
            onClick={admin.handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 bg-[#121212] text-[#F5F5F5] flex flex-col md:bg-slate-50 md:text-slate-900">
        
        {/* TOP NAVBAR */}
        <div className="hidden md:flex bg-white border-b border-slate-200/80 px-6 py-4 items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Gerenciamento:
            </span>
            <span className="text-xs font-extrabold text-[#002E5C] uppercase tracking-wide bg-[#E6F5FC] px-3 py-1 rounded-lg border border-[#0096D6]/30">
              {admin.activeTab === 'dashboard' && 'Painel Geral'}
              {admin.activeTab === 'portfolio' && 'Portfólio / Galeria'}
              {admin.activeTab === 'before_after' && 'Antes & Depois'}
              {admin.activeTab === 'services' && 'Especialidades'}
              {admin.activeTab === 'faq' && 'Dúvidas / FAQ'}
              {admin.activeTab === 'simulator' && 'Simulador / Preços'}
              {admin.activeTab === 'settings' && 'Configurações do Sistema'}
              {admin.activeTab === 'whatsapp' && 'Atendimento / WhatsApp'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="/" 
              target="_blank" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002E5C] hover:text-[#0096D6] bg-slate-100 hover:bg-[#E6F5FC] px-3.5 py-2 rounded-xl transition-all border border-slate-200/60"
            >
              <span>Ver Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div data-testid="admin-main-content" className="flex-1 w-full max-w-6xl mx-auto overflow-x-hidden px-4 pt-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:overflow-y-auto md:px-6 md:py-8 lg:px-8">
          
          {admin.hasError && (
            <div role="alert" className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold">{admin.errorMessage || 'Não foi possível atualizar parte dos dados. As informações anteriores foram preservadas.'}</p>
              <button
                type="button"
                onClick={() => void admin.reloadAllData()}
                disabled={admin.loading}
                className="shrink-0 rounded-xl bg-[#002E5C] px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition-colors hover:bg-[#0096D6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {admin.loading ? 'Tentando...' : 'Tentar novamente'}
              </button>
            </div>
          )}

          {admin.loading && !admin.hasLoadedOnce ? (
            <div className="h-96 flex flex-col justify-center items-center bg-white rounded-2xl border border-slate-200/70 p-8 shadow-sm">
              <div className="w-10 h-10 border-4 border-[#0096D6] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-700 font-extrabold">Carregando...</p>
              <p className="text-xs text-slate-400 mt-1">Buscando dados do servidor e banco...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={admin.activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 1. DASHBOARD VIEW */}
                {admin.activeTab === 'dashboard' && (
                  <DashboardHome
                    portfolios={admin.portfolios}
                    beforeAfters={admin.beforeAfters}
                    services={admin.services}
                    faqs={admin.faqs}
                    companyName={admin.companyName}
                    companyPhone={admin.companyPhone}
                    companyAddress={admin.companyAddress}
                    companyLogo={admin.companyLogo}
                    onNavigateTab={(tab) => admin.setActiveTab(tab as TabType)}
                  />
                )}

                {/* 2. PORTFOLIO VIEW */}
                {admin.activeTab === 'portfolio' && (
                  <PortfolioManager
                    portfolios={admin.portfolios}
                    isPortfolioFormOpen={admin.isPortfolioFormOpen}
                    portfolioFormMode={admin.portfolioFormMode}
                    editingPortfolioId={admin.editingPortfolioId}
                    portfolioTitle={admin.portfolioTitle}
                    portfolioDescription={admin.portfolioDescription}
                    portfolioCategory={admin.portfolioCategory}
                    portfolioImg={admin.portfolioImg}
                    portfolioImages={admin.portfolioImages}
                    portfolioSaving={admin.portfolioSaving}
                    portfolioUploadLoading={admin.portfolioUploadLoading}
                    portfolioUploadProgress={admin.portfolioUploadProgress}
                    portfolioMessage={admin.portfolioMessage}
                    deleteConfirmationId={admin.deleteConfirmationId}
                    deletingPortfolioId={admin.deletingPortfolioId}
                    setIsPortfolioFormOpen={admin.setIsPortfolioFormOpen}
                    setEditingPortfolioId={admin.setEditingPortfolioId}
                    setPortfolioTitle={admin.setPortfolioTitle}
                    setPortfolioDescription={admin.setPortfolioDescription}
                    setPortfolioCategory={admin.setPortfolioCategory}
                    setPortfolioImg={admin.setPortfolioImg}
                    setPortfolioMessage={admin.setPortfolioMessage}
                    setDeleteConfirmationId={admin.setDeleteConfirmationId}
                    handleOpenCreateForm={admin.handleOpenCreateForm}
                    handleStartEdit={admin.handleStartEdit}
                    handleSavePortfolio={admin.handleSavePortfolio}
                    handleDeletePortfolio={admin.handleDeletePortfolio}
                    handleImageUpload={admin.handleImageUpload}
                    handleRemoveImage={admin.handleRemoveImage}
                    handleCancelPortfolioForm={admin.handleCancelPortfolioForm}
                  />
                )}

                {/* 3. ANTES E DEPOIS VIEW */}
                {admin.activeTab === 'before_after' && (
                  <BeforeAfterManager
                    beforeAfters={admin.beforeAfters}
                    isBeforeAfterFormOpen={admin.isBeforeAfterFormOpen}
                    beforeAfterFormMode={admin.beforeAfterFormMode}
                    editingBeforeAfterId={admin.editingBeforeAfterId}
                    beforeAfterTitle={admin.beforeAfterTitle}
                    beforeAfterCategory={admin.beforeAfterCategory}
                    beforeAfterDescription={admin.beforeAfterDescription}
                    beforeAfterBeforeImg={admin.beforeAfterBeforeImg}
                    beforeAfterAfterImg={admin.beforeAfterAfterImg}
                    beforeAfterSaving={admin.beforeAfterSaving}
                    beforeAfterBeforeUploadLoading={admin.beforeAfterBeforeUploadLoading}
                    beforeAfterBeforeProgress={admin.beforeAfterBeforeProgress}
                    beforeAfterAfterUploadLoading={admin.beforeAfterAfterUploadLoading}
                    beforeAfterAfterProgress={admin.beforeAfterAfterProgress}
                    beforeAfterMessage={admin.beforeAfterMessage}
                    deleteBeforeAfterConfirmationId={admin.deleteBeforeAfterConfirmationId}
                    deletingBeforeAfterId={admin.deletingBeforeAfterId}
                    setIsBeforeAfterFormOpen={admin.setIsBeforeAfterFormOpen}
                    setEditingBeforeAfterId={admin.setEditingBeforeAfterId}
                    setBeforeAfterTitle={admin.setBeforeAfterTitle}
                    setBeforeAfterCategory={admin.setBeforeAfterCategory}
                    setBeforeAfterDescription={admin.setBeforeAfterDescription}
                    setBeforeAfterMessage={admin.setBeforeAfterMessage}
                    setDeleteBeforeAfterConfirmationId={admin.setDeleteBeforeAfterConfirmationId}
                    handleOpenBeforeAfterCreateForm={admin.handleOpenBeforeAfterCreateForm}
                    handleStartBeforeAfterEdit={admin.handleStartBeforeAfterEdit}
                    handleSaveBeforeAfter={admin.handleSaveBeforeAfter}
                    handleDeleteBeforeAfter={admin.handleDeleteBeforeAfter}
                    handleBeforeImageUpload={admin.handleBeforeImageUpload}
                    handleAfterImageUpload={admin.handleAfterImageUpload}
                    handleCancelBeforeAfterForm={admin.handleCancelBeforeAfterForm}
                  />
                )}

                {/* 4. SERVIÇOS VIEW */}
                {admin.activeTab === 'services' && (
                  <ServicesManager services={admin.services} />
                )}

                {/* 5. FAQ VIEW */}
                {admin.activeTab === 'faq' && (
                  <FAQManager
                    faqs={admin.faqs}
                    isFaqFormOpen={admin.isFaqFormOpen}
                    faqFormMode={admin.faqFormMode}
                    editingFaqId={admin.editingFaqId}
                    faqQuestion={admin.faqQuestion}
                    faqAnswer={admin.faqAnswer}
                    faqOrderIndex={admin.faqOrderIndex}
                    faqSaving={admin.faqSaving}
                    faqMessage={admin.faqMessage}
                    deleteFaqConfirmationId={admin.deleteFaqConfirmationId}
                    deletingFaqId={admin.deletingFaqId}
                    setIsFaqFormOpen={admin.setIsFaqFormOpen}
                    setEditingFaqId={admin.setEditingFaqId}
                    setFaqQuestion={admin.setFaqQuestion}
                    setFaqAnswer={admin.setFaqAnswer}
                    setFaqOrderIndex={admin.setFaqOrderIndex}
                    setFaqMessage={admin.setFaqMessage}
                    setDeleteFaqConfirmationId={admin.setDeleteFaqConfirmationId}
                    handleOpenFaqCreateForm={admin.handleOpenFaqCreateForm}
                    handleStartFaqEdit={admin.handleStartFaqEdit}
                    handleSaveFaq={admin.handleSaveFaq}
                    handleDeleteFaq={admin.handleDeleteFaq}
                  />
                )}

                {/* 6. SIMULATOR VIEW */}
                {admin.activeTab === 'simulator' && (
                  <SimulatorManager />
                )}

                {/* 7. CONFIGURAÇÕES & WHATSAPP VIEW */}
                {(admin.activeTab === 'settings' || admin.activeTab === 'whatsapp') && (
                  <SettingsManager
                    companyName={admin.companyName}
                    companyEmail={admin.companyEmail}
                    companyLogo={admin.companyLogo}
                    companyPhone={admin.companyPhone}
                    companyWhatsapp={admin.companyWhatsapp}
                    companyWhatsappMessage={admin.companyWhatsappMessage}
                    companyAddress={admin.companyAddress}
                    companyInstagram={admin.companyInstagram}
                    companyFacebook={admin.companyFacebook}
                    settingsSaving={admin.settingsSaving}
                    logoUploadLoading={admin.logoUploadLoading}
                    logoUploadProgress={admin.logoUploadProgress}
                    settingsMessage={admin.settingsMessage}
                    pendingLogoUrls={admin.pendingLogoUrls}
                    setCompanyName={admin.setCompanyName}
                    setCompanyEmail={admin.setCompanyEmail}
                    setCompanyLogo={admin.setCompanyLogo}
                    setCompanyPhone={admin.setCompanyPhone}
                    setCompanyWhatsapp={admin.setCompanyWhatsapp}
                    setCompanyWhatsappMessage={admin.setCompanyWhatsappMessage}
                    setCompanyAddress={admin.setCompanyAddress}
                    setCompanyInstagram={admin.setCompanyInstagram}
                    setCompanyFacebook={admin.setCompanyFacebook}
                    handleSaveSettings={admin.handleSaveSettings}
                    handleLogoUpload={admin.handleLogoUpload}
                    handleCancelLogoChange={admin.handleCancelLogoChange}
                  />
                )}

              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>

      <MobileBottomNavigation
        activeTab={admin.activeTab}
        onSelectTab={handleSelectTab}
        onOpenDrawer={() => admin.setMobileMenuOpen(true)}
      />

    </div>
  );
}
