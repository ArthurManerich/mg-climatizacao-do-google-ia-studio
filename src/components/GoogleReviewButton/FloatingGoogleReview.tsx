import { Star } from 'lucide-react';
import { GOOGLE_REVIEW_URL } from '../../config';

export default function FloatingGoogleReview() {
  return (
    <a
      href={GOOGLE_REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Avaliar a MG Climatização no Google"
      className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.75rem)] right-[max(1rem,env(safe-area-inset-right))] z-40 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-amber-500 shadow-floating transition-colors hover:bg-amber-50 active:bg-amber-100 sm:h-13 sm:w-auto sm:min-w-13 sm:gap-2 sm:px-4"
    >
      <Star aria-hidden="true" className="h-5 w-5 shrink-0 fill-current" />
      <span className="hidden text-sm font-bold text-brand-navy-800 sm:inline">Avalie no Google</span>
    </a>
  );
}
