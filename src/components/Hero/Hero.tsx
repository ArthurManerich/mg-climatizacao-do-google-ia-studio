import React from 'react';
import { ArrowRight, MapPin, SlidersHorizontal } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useWhatsAppContact } from '../../context/WhatsAppContactContext';
import { DEFAULT_QUICK_QUOTE_MESSAGE } from '../../utils/whatsapp';

const heroServiceImg = '/brand/fotos/atendimento-real-hero.jpeg';
const heroServiceMobileWebPSrcSet = [
  '/brand/fotos/atendimento-real-hero-480.webp 480w',
  '/brand/fotos/atendimento-real-hero-768.webp 768w',
].join(', ');
const heroServiceDesktopWebPSrcSet = [
  '/brand/fotos/atendimento-real-hero-768.webp 768w',
  '/brand/fotos/atendimento-real-hero-1200.webp 1200w',
].join(', ');
const heroServiceSizes = '(min-width: 1024px) 40vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)';

export default function Hero() {
  const { settings } = useSettings();
  const { openWhatsAppSelector } = useWhatsAppContact();

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-brand-navy-950 py-14 text-white sm:py-16 lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(0,178,255,0.16),transparent_34%),linear-gradient(120deg,#00152b_0%,#001d3d_58%,#002e5c_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-[-12%] h-52 w-[74%] rounded-[50%] border-t border-brand-cyan-400/25 sm:-bottom-24"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-gutter sm:px-gutter-lg lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="hero-reveal mb-5 flex items-center gap-3 text-sm font-semibold text-brand-cyan-400">
              <span className="h-px w-8 bg-brand-cyan-400" aria-hidden="true" />
              <span>Climatização em Blumenau e região</span>
            </div>

            <h1 className="hero-reveal hero-reveal-delay-1 max-w-3xl font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Conforto em cada detalhe.
            </h1>

            <p className="hero-reveal hero-reveal-delay-2 mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg">
              Instalação, manutenção e higienização de ar-condicionado para ambientes residenciais e empresariais.
            </p>

            <div className="hero-reveal hero-reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => openWhatsAppSelector(
                  settings.whatsapp_message || DEFAULT_QUICK_QUOTE_MESSAGE,
                )}
                id="btn-whatsapp-hero"
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-control bg-brand-orange-500 px-6 text-base font-bold text-brand-navy-950 shadow-card transition-colors hover:bg-brand-orange-600 sm:w-auto"
              >
                Solicitar orçamento
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <a
                href="#orcamento-online"
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-control border border-brand-cyan-600/60 bg-brand-navy-900/60 px-6 text-base font-bold text-white transition-colors hover:bg-brand-cyan-600/15 sm:w-auto"
              >
                <SlidersHorizontal className="h-5 w-5 text-brand-cyan-400" aria-hidden="true" />
                Montar solicitação
              </a>
            </div>

            <div className="hero-reveal hero-reveal-delay-4 mt-7 flex max-w-xl items-start gap-2.5 border-t border-white/10 pt-5 text-sm leading-relaxed text-slate-300">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan-400" aria-hidden="true" />
              <p>Atendemos Blumenau e região, com garantia de 90 dias nos serviços e emissão de Nota Fiscal.</p>
            </div>
          </div>

          <figure className="hero-image-reveal mx-auto w-full max-w-xl lg:col-span-5">
            <div className="overflow-hidden rounded-feature border border-white/10 bg-brand-navy-900 shadow-floating">
              <picture>
                <source
                  media="(max-width: 1023px)"
                  type="image/webp"
                  srcSet={heroServiceMobileWebPSrcSet}
                  sizes={heroServiceSizes}
                />
                <source
                  type="image/webp"
                  srcSet={heroServiceDesktopWebPSrcSet}
                  sizes={heroServiceSizes}
                />
                <img
                  src={heroServiceImg}
                  alt="Profissional da MG Climatização trabalhando em um aparelho de ar-condicionado"
                  width="1200"
                  height="1600"
                  sizes={heroServiceSizes}
                  decoding="async"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                  className="aspect-[3/4] w-full object-cover object-center lg:aspect-[4/3] lg:object-[50%_35%]"
                />
              </picture>
              <figcaption className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 text-sm text-slate-300 sm:px-5">
                <span>Atendimento residencial e empresarial</span>
                <span className="hidden font-semibold text-brand-cyan-400 sm:inline">MG Climatização</span>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
