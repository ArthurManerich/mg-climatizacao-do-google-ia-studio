import React from 'react';
import { Wrench, FileImage, Layout, HelpCircle } from 'lucide-react';

interface DashboardStatsProps {
  totalPortfolioItems: number;
  totalImages: number;
  totalServices: number;
  totalFaqs: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalPortfolioItems,
  totalImages,
  totalServices,
  totalFaqs
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* Stat Card 1: Portfólio */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-all flex min-w-0 items-start justify-between gap-2 group">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-400 tracking-widest block">PORTFÓLIO</span>
          <span className="text-3xl md:text-4xl font-black text-[#002E5C] font-display block leading-none">{totalPortfolioItems}</span>
          <span className="text-[10px] font-bold text-[#002E5C] bg-[#E6F5FC] px-2 py-0.5 rounded border border-[#0096D6]/30 inline-block">Serviços Cadastrados</span>
        </div>
        <div className="hidden md:flex w-10 h-10 rounded-xl bg-[#E6F5FC] border border-[#0096D6]/30 items-center justify-center text-[#0096D6] group-hover:bg-[#0096D6] group-hover:text-white transition-all">
          <Wrench className="w-5 h-5" />
        </div>
      </div>

      {/* Stat Card 2: Imagens */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-all flex min-w-0 items-start justify-between gap-2 group">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Imagens</span>
          <span className="text-3xl md:text-4xl font-black text-[#002E5C] font-display block leading-none">{totalImages}</span>
          <span className="text-[10px] font-bold text-[#002E5C] bg-[#E6F5FC] px-2 py-0.5 rounded border border-[#0096D6]/30 inline-block">Galeria & Antes/Depois</span>
        </div>
        <div className="hidden md:flex w-10 h-10 rounded-xl bg-[#E6F5FC] border border-[#0096D6]/30 items-center justify-center text-[#0096D6] group-hover:bg-[#0096D6] group-hover:text-white transition-all">
          <FileImage className="w-5 h-5" />
        </div>
      </div>

      {/* Stat Card 3: Serviços */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-all flex min-w-0 items-start justify-between gap-2 group">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Serviços</span>
          <span className="text-3xl md:text-4xl font-black text-[#002E5C] font-display block leading-none">{totalServices}</span>
          <span className="text-[10px] font-bold text-[#002E5C] bg-[#E6F5FC] px-2 py-0.5 rounded border border-[#0096D6]/30 inline-block">Especialidades</span>
        </div>
        <div className="hidden md:flex w-10 h-10 rounded-xl bg-[#E6F5FC] border border-[#0096D6]/30 items-center justify-center text-[#0096D6] group-hover:bg-[#0096D6] group-hover:text-white transition-all">
          <Layout className="w-5 h-5" />
        </div>
      </div>

      {/* Stat Card 4: FAQs */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-all flex min-w-0 items-start justify-between gap-2 group">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">FAQs</span>
          <span className="text-3xl md:text-4xl font-black text-[#002E5C] font-display block leading-none">{totalFaqs}</span>
          <span className="text-[10px] font-bold text-[#002E5C] bg-[#E6F5FC] px-2 py-0.5 rounded border border-[#0096D6]/30 inline-block">Dúvidas Frequentes</span>
        </div>
        <div className="hidden md:flex w-10 h-10 rounded-xl bg-[#E6F5FC] border border-[#0096D6]/30 items-center justify-center text-[#0096D6] group-hover:bg-[#0096D6] group-hover:text-white transition-all">
          <HelpCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
