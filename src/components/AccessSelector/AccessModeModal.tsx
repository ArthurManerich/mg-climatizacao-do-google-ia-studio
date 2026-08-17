import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccessModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessModeModal({ isOpen, onClose }: AccessModeModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectClient = () => {
    sessionStorage.setItem('mg_access_mode', 'client');
    onClose();
  };

  const handleSelectAdmin = () => {
    sessionStorage.setItem('mg_access_mode', 'admin');
    onClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-[#002E5C] text-white p-6 sm:p-8 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6]"
              aria-label="Fechar janela de seleção de modo"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#0096D6] text-white px-2.5 py-1 rounded-full">
                MG Climatização
              </span>
              <span className="text-xs text-[#00B2FF] flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Seleção de Interface
              </span>
            </div>

            <h2 id="access-modal-title" className="text-2xl sm:text-3xl font-extrabold font-display">
              Como deseja navegar?
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-1">
              Escolha entre o modo de navegação como cliente ou acesse a área de gerenciamento administrativo.
            </p>
          </div>

          {/* Options grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50">
            {/* Client Card */}
            <div 
              onClick={handleSelectClient}
              className="bg-white border-2 border-slate-200 hover:border-[#0096D6] rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E6F5FC] text-[#0096D6] flex items-center justify-center mb-4 group-hover:bg-[#0096D6] group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display mb-1 flex items-center justify-between">
                  Modo Cliente
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">Sem Admin</span>
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Navegue pelo site público, simule orçamentos, consulte serviços, veja fotos de instalações reais e solicite atendimento no WhatsApp.
                </p>
              </div>

              <button 
                type="button"
                className="w-full mt-2 py-3 px-4 bg-[#002E5C] hover:bg-[#001D38] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 group-hover:bg-[#0096D6]"
              >
                <span>Navegar no Site Público</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Admin Card */}
            <div 
              onClick={handleSelectAdmin}
              className="bg-white border-2 border-slate-200 hover:border-[#002E5C] rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4 group-hover:bg-[#002E5C] group-hover:text-[#00B2FF] transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display mb-1 flex items-center justify-between">
                  Modo Administrador
                  <span className="text-[10px] bg-[#E6F5FC] text-[#002E5C] font-semibold px-2 py-0.5 rounded">Com Login</span>
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Acesse o painel de gestão exclusivo para editar serviços, fotos do portfólio, comparativos antes/depois, simulador e WhatsApp.
                </p>
              </div>

              <button 
                type="button"
                className="w-full mt-2 py-3 px-4 bg-[#0096D6] hover:bg-[#0082BA] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>Fazer Login Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-100 px-6 py-3.5 text-center text-[11px] text-slate-500 border-t border-slate-200">
            Você pode alternar de modo a qualquer momento pelo botão no topo do site.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
