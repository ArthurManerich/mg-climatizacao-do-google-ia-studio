import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, User, X } from 'lucide-react';
import { motion } from 'motion/react';

interface AccessModeModalProps { isOpen: boolean; onClose: () => void; }
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function AccessModeModal({ isOpen, onClose }: AccessModeModalProps) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const selectClient = () => { sessionStorage.setItem('mg_access_mode', 'client'); onClose(); };
  const selectAdmin = () => { sessionStorage.setItem('mg_access_mode', 'admin'); onClose(); navigate('/login'); };

  return isOpen ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy-950/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="access-modal-title" tabIndex={-1} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.16 }} className="relative max-h-full w-full max-w-2xl overflow-y-auto rounded-feature border border-line bg-surface shadow-floating">
            <header className="relative bg-brand-navy-800 p-5 pr-16 text-white sm:p-7 sm:pr-20">
              <button ref={closeButtonRef} type="button" onClick={onClose} className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-200 transition-colors hover:bg-white/10 hover:text-white" aria-label="Fechar janela de seleção de acesso"><X aria-hidden="true" className="h-5 w-5" /></button>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-cyan-400">MG Climatização</p>
              <h2 id="access-modal-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">Como deseja navegar?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">Continue no site público ou acesse a área administrativa protegida.</p>
            </header>

            <div className="grid gap-4 bg-surface-subtle p-4 sm:grid-cols-2 sm:p-6">
              <button type="button" onClick={selectClient} className="group flex min-h-52 flex-col items-start rounded-card border border-line bg-surface p-5 text-left transition-[border-color,box-shadow] hover:border-brand-cyan-600 hover:shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-brand-cyan-50 text-brand-cyan-700"><User aria-hidden="true" className="h-5 w-5" /></span>
                <span className="mt-4 text-lg font-bold text-ink">Site público</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">Consulte serviços, trabalhos publicados e monte sua solicitação de atendimento.</span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-cyan-700">Continuar no site <ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
              </button>

              <button type="button" onClick={selectAdmin} className="group flex min-h-52 flex-col items-start rounded-card border border-line bg-surface p-5 text-left transition-[border-color,box-shadow] hover:border-brand-navy-800 hover:shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-slate-100 text-brand-navy-800"><ShieldCheck aria-hidden="true" className="h-5 w-5" /></span>
                <span className="mt-4 text-lg font-bold text-ink">Área administrativa</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">Acesse o painel protegido para gerenciar os conteúdos do site.</span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-navy-800">Fazer login <ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
              </button>
            </div>
          </motion.div>
        </motion.div>
  ) : null;
}
