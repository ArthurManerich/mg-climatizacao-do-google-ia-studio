import React from 'react';
import { Plus } from 'lucide-react';
import { ServiceItem } from '../../../types';

interface ServicesManagerProps {
  services: ServiceItem[];
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({ services }) => {
  return (
    <div className="admin-manager space-y-6" id="view-services">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold font-display text-slate-900">Especialidades de Serviço</h2>
          <p className="text-xs text-slate-500">Serviços mostrados no site e simulador.</p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-1.5 bg-[#0096D6]/20 text-[#002E5C]/60 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#0096D6]/30 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Serviços Cadastrados</span>
          <span className="text-[10px] font-bold text-[#002E5C] uppercase bg-[#E6F5FC] px-2 py-0.5 rounded border border-[#0096D6]/30">Apenas Leitura</span>
        </div>
        <div className="divide-y divide-slate-100">
          {services.length === 0 ? (
            <div className="admin-empty-state p-8 text-center">
              <p className="admin-empty-title text-sm font-extrabold">Nenhum serviço cadastrado</p>
              <p className="mt-1 text-xs">Os serviços aparecerão aqui após uma leitura confirmada.</p>
            </div>
          ) : services.map((item) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-950 uppercase">{item.title}</span>
                  <span className="text-[9px] font-mono text-slate-400">({item.icon})</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{item.description}</p>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.bullet_points.map((bp, i) => (
                    <span key={i} className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      • {bp}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200 shrink-0">
                {item.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
