import React from 'react';
import { FileImage, ChevronRight } from 'lucide-react';
import { PortfolioItem } from '../../../types';

interface DashboardCardsProps {
  latestPortfolioItem?: PortfolioItem;
  lastUpdateStr: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  onNavigateTab: (tab: string) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  latestPortfolioItem,
  lastUpdateStr,
  companyName,
  companyPhone,
  companyAddress,
  onNavigateTab
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Bento Item 1: Último Serviço Adicionado (col-span-2) */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-start gap-2 pb-4 border-b border-slate-100 mb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0096D6]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#002E5C]">Último Serviço Adicionado</h3>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Portfólio Recente</span>
          </div>

          {latestPortfolioItem ? (
            <div className="grid sm:grid-cols-5 gap-5 items-center">
              {/* Image frame */}
              <div className="sm:col-span-2 aspect-video sm:aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group/img self-stretch flex items-center justify-center">
                <img 
                  src={latestPortfolioItem.img} 
                  alt={latestPortfolioItem.title} 
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Information */}
              <div className="sm:col-span-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 rounded px-2 py-0.5 uppercase tracking-wider">
                    {latestPortfolioItem.category.replace('-', ' ')}
                  </span>
                  {latestPortfolioItem.created_at && (
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {new Date(latestPortfolioItem.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-[#002E5C] leading-tight">
                  {latestPortfolioItem.title}
                </h4>
                <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                  {latestPortfolioItem.description || 'Nenhuma descrição detalhada inserida para este serviço no portfólio.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <FileImage className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">Nenhum serviço cadastrado ainda</p>
              <p className="text-[10px] text-slate-400 mt-1">Insira fotos dos seus projetos no gerenciador de portfólio.</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
          <button
            onClick={() => onNavigateTab('portfolio')}
            className="min-h-11 w-full sm:w-auto text-xs font-black text-[#002E5C] hover:text-[#0096D6] uppercase tracking-wider inline-flex items-center justify-center gap-1 bg-[#E6F5FC] hover:bg-[#D0EEFB] px-4 py-2 rounded-xl transition-all border border-[#0096D6]/30 cursor-pointer"
          >
            Ver Portfólio Completo <ChevronRight className="w-3.5 h-3.5 text-[#0096D6]" />
          </button>
        </div>
      </div>

      {/* Bento Item 2: Status Operacional (col-span-1) */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 md:p-6 shadow-sm flex flex-col justify-between space-y-6">
        
        {/* Live Update Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status Operacional</span>
          </div>
          
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Última Atualização do Site</span>
            <span className="text-xs font-mono font-black text-slate-800 block">
              {lastUpdateStr}
            </span>
          </div>
        </div>

        {/* Identity Card */}
        <div className="space-y-3 border-t border-slate-100 pt-5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identidade de Exibição</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center gap-3 bg-slate-50/50 p-3 md:p-2 rounded border border-slate-100">
              <span className="font-semibold text-slate-500 text-[11px]">Empresa:</span>
              <span className="font-bold text-slate-800">{companyName}</span>
            </div>
            <div className="flex justify-between items-center gap-3 bg-slate-50/50 p-3 md:p-2 rounded border border-slate-100">
              <span className="font-semibold text-slate-500 text-[11px]">Contato:</span>
              <span className="font-bold text-slate-800 font-mono">{companyPhone || '(47) 99746-4218'}</span>
            </div>
            <div className="flex justify-between items-center gap-3 bg-slate-50/50 p-3 md:p-2 rounded border border-slate-100">
              <span className="font-semibold text-slate-500 text-[11px]">Cidade:</span>
              <span className="font-bold text-slate-800">{companyAddress || 'Blumenau - SC'}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
