import React from 'react';
import { Database, Sparkles, Smartphone } from 'lucide-react';
import { PortfolioItem, BeforeAfterItem, ServiceItem, FaqItem } from '../../../types';
import { DashboardStats } from './DashboardStats';
import { DashboardCards } from './DashboardCards';
import { DashboardActions } from './DashboardActions';

interface DashboardHomeProps {
  portfolios: PortfolioItem[];
  beforeAfters: BeforeAfterItem[];
  services: ServiceItem[];
  faqs: FaqItem[];
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyLogo: string;
  onNavigateTab: (tab: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  portfolios,
  beforeAfters,
  services,
  faqs,
  companyName,
  companyPhone,
  companyAddress,
  companyLogo,
  onNavigateTab
}) => {
  const totalPortfolioItems = portfolios.length;
  const totalImages = portfolios.filter(p => p.img).length + 
                      beforeAfters.filter(b => b.before_img).length + 
                      beforeAfters.filter(b => b.after_img).length + 
                      (companyLogo ? 1 : 0);
  const totalServices = services.length;
  const totalFaqs = faqs.length;

  // Sort to get the latest added portfolio item
  const latestPortfolioItem = [...portfolios].sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return b.id - a.id;
  })[0];

  // Get the latest update across all dynamic database collections
  const allDates = [
    ...portfolios.map(p => p.created_at),
    ...beforeAfters.map(ba => ba.created_at),
    ...services.map(s => s.created_at),
    ...faqs.map(f => f.created_at),
  ].filter(Boolean).map(d => new Date(d!).getTime());

  const lastUpdateStr = allDates.length > 0 
    ? new Date(Math.max(...allDates)).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Sem alterações recentes';

  return (
    <div className="space-y-6 animate-fade-in" id="view-dashboard">
      
      {/* Welcome Banner */}
      <div className="bg-[#1A1A1A] md:bg-[#002E5C] text-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/8 md:border-slate-700/80 shadow-lg relative overflow-hidden">
        <div className="hidden md:block absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="w-48 h-48 text-[#0096D6]" />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-1.5 text-[#A8A8A8] md:text-[#00B2FF] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> Painel de Controle MG Climatização
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight mb-2">
            Olá, Administrador
          </h1>
          <p className="text-[#E0E0E0] text-sm md:text-xs leading-relaxed mb-4">
            Gerencie as fotos do portfólio, casos de antes/depois, especialidades de serviços, dúvidas frequentes e informações globais de contato a partir deste centro de controle.
          </p>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-[#242424] px-3.5 py-2 text-xs font-bold text-[#E0E0E0] shadow-sm md:min-h-0 md:border-[#0096D6] md:bg-[#0096D6] md:py-1.5 md:text-white">
            <Smartphone className="w-3.5 h-3.5" /> Totalmente Otimizado para Celular
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Responsive Cards */}
      <DashboardStats 
        totalPortfolioItems={totalPortfolioItems}
        totalImages={totalImages}
        totalServices={totalServices}
        totalFaqs={totalFaqs}
      />

      {/* Detail Section: Bento Grid (Latest project + Operational Status) */}
      <DashboardCards 
        latestPortfolioItem={latestPortfolioItem}
        lastUpdateStr={lastUpdateStr}
        companyName={companyName}
        companyPhone={companyPhone}
        companyAddress={companyAddress}
        onNavigateTab={onNavigateTab}
      />

      {/* Connection Warning Footer */}
      <DashboardActions />

    </div>
  );
};
