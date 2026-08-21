import { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, ImageOff, Phone, RefreshCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { usePortfolio } from '../../hooks/usePortfolio';
import { Photo } from '../../types';
import { getWhatsAppLink } from '../../utils/whatsapp';
import PortfolioCard from './PortfolioCard';

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Portfolio() {
  const { settings } = useSettings();
  const { userPhotos, loading, error, reloadPhotos } = usePortfolio();
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [previewImageFailed, setPreviewImageFailed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  const openPreview = (photo: Photo, opener: HTMLButtonElement) => { openerRef.current = opener; setPreviewImageFailed(false); setPreviewPhoto(photo); };
  const closePreview = () => setPreviewPhoto(null);

  useEffect(() => {
    if (!previewPhoto) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closePreview(); return; }
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
  }, [previewPhoto]);

  return (
    <section id="portfolio" className="bg-surface-subtle py-section">
      <div className="mx-auto max-w-7xl px-gutter sm:px-gutter-lg">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-cyan-700">Trabalhos publicados</p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Portfólio</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">Uma seleção de serviços reais registrados pela MG Climatização.</p>
        </header>

        {loading ? (
          <div role="status" className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-feature border border-line bg-surface px-5 text-center"><span aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-2 border-brand-cyan-600 border-t-transparent" /><p className="text-sm font-semibold text-ink-muted">Carregando portfólio…</p></div>
        ) : error ? (
          <div role="alert" className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-feature border border-line bg-surface px-5 text-center"><AlertCircle aria-hidden="true" className="h-8 w-8 text-brand-cyan-700" /><p className="font-semibold text-ink">Não foi possível carregar o portfólio agora.</p><button type="button" onClick={reloadPhotos} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-cyan-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-cyan-700"><RefreshCw aria-hidden="true" className="h-4 w-4" /> Tentar novamente</button></div>
        ) : userPhotos.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-feature border border-line bg-surface px-5 text-center"><ImageOff aria-hidden="true" className="mb-3 h-8 w-8 text-brand-cyan-700" /><p className="font-semibold text-ink">Nenhum trabalho publicado no momento.</p><p className="mt-1 text-sm text-ink-muted">As fotos aparecerão aqui quando forem adicionadas ao portfólio.</p></div>
        ) : (
          <div className={`grid gap-5 sm:gap-6 ${userPhotos.length === 1 ? 'mx-auto max-w-3xl' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {userPhotos.map((item) => <PortfolioCard key={item.id} item={item} onPreview={openPreview} />)}
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy-950/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closePreview(); }}>
            <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.16 }} className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-feature border border-white/10 bg-brand-navy-900 shadow-floating">
              <button ref={closeButtonRef} type="button" onClick={closePreview} aria-label="Fechar visualização da foto" className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 bg-brand-navy-950/90 text-white transition-colors hover:bg-brand-navy-800"><X aria-hidden="true" className="h-5 w-5" /></button>
              <div className="flex min-h-0 flex-1 items-center justify-center bg-brand-navy-950 sm:min-h-80">
                {previewImageFailed ? <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-slate-300"><ImageOff aria-hidden="true" className="h-9 w-9 text-brand-cyan-400" /><p className="text-sm font-semibold">Imagem indisponível</p></div> : <img src={previewPhoto.img} alt={previewPhoto.title} decoding="async" referrerPolicy="no-referrer" onError={() => setPreviewImageFailed(true)} className="max-h-[72vh] w-full object-contain" />}
              </div>
              <div className="flex flex-col gap-4 border-t border-white/10 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
                <div className="pr-12 sm:pr-0"><p className="text-xs font-bold uppercase tracking-wider text-brand-cyan-400">{previewPhoto.category || 'Serviço'}</p><h3 id={titleId} className="mt-1 text-lg font-bold text-white sm:text-xl">{previewPhoto.title}</h3>{previewPhoto.description && <p className="mt-1 text-sm text-slate-300">{previewPhoto.description}</p>}</div>
                <a href={getWhatsAppLink(`Olá! Vi o serviço "${previewPhoto.title}" no portfólio e gostaria de solicitar um orçamento.`, settings.whatsapp_number)} target="whatsapp" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-brand-orange-500 px-4 py-2.5 text-sm font-bold text-brand-navy-950 transition-colors hover:bg-brand-orange-600"><Phone aria-hidden="true" className="h-4 w-4" /> Solicitar orçamento</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
