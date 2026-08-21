import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ImageOff, Phone, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { BRAND } from '../../config';
import { useWhatsAppContact } from '../../context/WhatsAppContactContext';
import { beforeAfterService } from '../../services/beforeAfterService';
import { BeforeAfterItem } from '../../types';

function UnavailableImage({ label }: { label: string }) {
  return <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-navy-900 text-white/75"><ImageOff aria-hidden="true" className="h-7 w-7 text-brand-cyan-400" /><span className="text-xs font-semibold">{label} indisponível</span></div>;
}

export default function BeforeAfter() {
  const { openWhatsAppSelector } = useWhatsAppContact();
  const [items, setItems] = useState<BeforeAfterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const [beforeFailed, setBeforeFailed] = useState(false);
  const [afterFailed, setAfterFailed] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const loadItems = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems((await beforeAfterService.getAll()) || []); setSelectedIndex(0); }
    catch (loadError) { console.warn('Erro ao carregar comparativos antes/depois:', loadError); setError('Não foi possível carregar os comparativos agora.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadItems(); }, [loadItems]);
  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;
    const updateWidth = () => setContainerWidth(container.getBoundingClientRect().width);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, [items, selectedIndex]);

  const currentItem = items[selectedIndex];
  useEffect(() => { setBeforeFailed(false); setAfterFailed(false); }, [currentItem?.id]);
  const updatePosition = useCallback((clientX: number) => {
    const container = sliderContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setSliderPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <section id="antes-depois" className="relative overflow-hidden bg-brand-navy-950 py-section text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(0,178,255,0.14),transparent_38%)]" />
      <div className="relative mx-auto max-w-7xl px-gutter sm:px-gutter-lg">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-cyan-400">Resultados reais</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Antes &amp; Depois</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">Compare os registros publicados pela MG Climatização arrastando o controle sobre a imagem.</p>
        </header>

        {loading ? (
          <div role="status" className="mx-auto flex min-h-44 max-w-3xl flex-col items-center justify-center gap-3 rounded-feature border border-white/10 bg-white/[0.04] px-5 text-center"><span aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-2 border-brand-cyan-400 border-t-transparent" /><p className="text-sm font-semibold text-slate-200">Carregando comparativos…</p></div>
        ) : error ? (
          <div role="alert" className="mx-auto flex min-h-44 max-w-3xl flex-col items-center justify-center gap-3 rounded-feature border border-white/10 bg-white/[0.04] px-5 text-center"><AlertCircle aria-hidden="true" className="h-8 w-8 text-brand-cyan-400" /><p className="font-semibold text-white">{error}</p><button type="button" onClick={() => void loadItems()} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-cyan-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-cyan-700"><RefreshCw aria-hidden="true" className="h-4 w-4" /> Tentar novamente</button></div>
        ) : !currentItem ? (
          <div className="mx-auto flex min-h-44 max-w-3xl flex-col items-center justify-center rounded-feature border border-white/10 bg-white/[0.04] px-5 text-center"><ImageOff aria-hidden="true" className="mb-3 h-8 w-8 text-brand-cyan-400" /><p className="font-semibold text-white">Nenhum comparativo publicado no momento.</p><p className="mt-1 text-sm text-slate-300">Novos registros aparecerão aqui quando forem adicionados.</p></div>
        ) : (
          <div className="mx-auto max-w-5xl">
            {items.length > 1 && <div aria-label="Escolher comparativo" className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:justify-center">{items.map((item, index) => <button key={item.id} type="button" aria-pressed={selectedIndex === index} onClick={() => { setSelectedIndex(index); setSliderPosition(50); }} className={`min-h-11 shrink-0 rounded-pill border px-4 py-2 text-sm font-semibold transition-colors ${selectedIndex === index ? 'border-brand-cyan-400 bg-brand-cyan-600 text-white' : 'border-white/15 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'}`}>{item.title}</button>)}</div>}
            <article className="overflow-hidden rounded-feature border border-white/10 bg-brand-navy-900 shadow-floating">
              <div ref={sliderContainerRef} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); updatePosition(event.clientX); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updatePosition(event.clientX); }} className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden bg-brand-navy-900 touch-pan-y sm:aspect-[16/10]" aria-hidden="true">
                {afterFailed ? <UnavailableImage label="Imagem de depois" /> : <img data-comparison-image="after" src={currentItem.after_img} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" draggable="false" onError={() => setAfterFailed(true)} className="absolute inset-0 h-full w-full object-cover" />}
                <span className="absolute right-3 top-3 rounded-pill bg-brand-cyan-700/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Depois</span>
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                  {beforeFailed ? <UnavailableImage label="Imagem de antes" /> : <img data-comparison-image="before" src={currentItem.before_img} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" draggable="false" onError={() => setBeforeFailed(true)} className="absolute inset-0 max-w-none object-cover" style={{ width: containerWidth ? `${containerWidth}px` : '100%', height: '100%' }} />}
                  <span className="absolute left-3 top-3 rounded-pill bg-brand-navy-950/85 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Antes</span>
                </div>
                <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPosition}%` }}><span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-brand-cyan-600 text-white shadow-floating"><SlidersHorizontal className="h-5 w-5" /></span></div>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[1fr_minmax(15rem,22rem)] sm:items-center sm:p-7">
                <div><h3 className="text-xl font-bold text-white">{currentItem.title}</h3>{currentItem.description && <p className="mt-2 text-sm leading-relaxed text-slate-300">{currentItem.description}</p>}</div>
                <label className="block text-sm font-semibold text-slate-200"><span className="mb-2 flex justify-between gap-3"><span>Arraste para comparar</span><span aria-hidden="true">{Math.round(sliderPosition)}%</span></span><input type="range" min="0" max="100" value={sliderPosition} onChange={(event) => setSliderPosition(Number(event.target.value))} className="h-11 w-full cursor-ew-resize accent-brand-cyan-600" aria-label="Posição da comparação entre antes e depois" /></label>
              </div>
              <div className="border-t border-white/10 px-5 py-4 sm:px-7">
                <button type="button" onClick={() => openWhatsAppSelector(`Olá ${BRAND.name}! Vi o comparativo "${currentItem.title}" e gostaria de solicitar um orçamento.`)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-brand-orange-500 px-4 py-2.5 text-sm font-bold text-brand-navy-950 transition-colors hover:bg-brand-orange-600">
                  <Phone aria-hidden="true" className="h-4 w-4" /> Solicitar orçamento
                </button>
              </div>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
