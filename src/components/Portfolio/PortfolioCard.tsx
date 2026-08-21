import { memo, useState } from 'react';
import { ImageOff, Maximize2, Trash2 } from 'lucide-react';
import { Photo } from '../../types';

interface PortfolioCardProps {
  item: Photo;
  onRemove?: (id: number) => void;
  onPreview?: (item: Photo, opener: HTMLButtonElement) => void;
}

const categoryNames: Record<string, string> = { instalacao: 'Instalação', manutencao: 'Manutenção', higienizacao: 'Higienização', comercial: 'Comercial' };

const PortfolioCard = memo(function PortfolioCard({ item, onRemove, onPreview }: PortfolioCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const categoryLabel = categoryNames[item.category?.toLowerCase()] || item.category || 'Serviço';

  return (
    <article id={`portfolio-item-${item.id}`} className="group overflow-hidden rounded-card border border-line bg-surface shadow-card transition-[border-color,box-shadow] hover:border-brand-cyan-600/40 hover:shadow-card-hover">
      <button type="button" onClick={(event) => onPreview?.(item, event.currentTarget)} className="relative block aspect-[4/3] min-h-44 w-full overflow-hidden bg-brand-navy-900 text-left" aria-label={`Ampliar foto do serviço: ${item.title}`}>
        {imageFailed ? <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300"><ImageOff aria-hidden="true" className="h-7 w-7 text-brand-cyan-400" /><span className="text-xs font-semibold">Imagem indisponível</span></span> : <img src={item.img} alt={item.title} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} className="h-full w-full object-cover transition-transform duration-base group-hover:scale-[1.02]" />}
        <span className="absolute left-3 top-3 rounded-pill bg-brand-navy-950/85 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-white backdrop-blur-sm">{categoryLabel}</span>
        {!imageFailed && <span className="absolute bottom-3 right-3 flex min-h-9 items-center gap-1.5 rounded-pill bg-brand-navy-950/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm"><Maximize2 aria-hidden="true" className="h-3.5 w-3.5 text-brand-cyan-400" /> Ampliar</span>}
      </button>
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-bold text-ink">{item.title}</h3>
        {item.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>}
        {onRemove && <button type="button" onClick={() => onRemove(item.id)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-control border border-line px-3 py-2 text-sm font-semibold text-ink-muted hover:border-red-200 hover:text-red-600"><Trash2 aria-hidden="true" className="h-4 w-4" /> Remover</button>}
      </div>
    </article>
  );
});

export default PortfolioCard;
