import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const DashboardActions: React.FC = () => {
  return (
    <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-start gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-1.5 font-semibold">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sincronização em tempo real ativa
      </span>
      <span className="font-bold text-slate-400 uppercase font-mono text-xs">mgclimatizacao admin v1.1</span>
    </div>
  );
};
