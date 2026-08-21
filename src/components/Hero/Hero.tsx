import React from 'react';
import { ArrowRight, MapPin, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { useWhatsAppContact } from '../../context/WhatsAppContactContext';
import { DEFAULT_QUICK_QUOTE_MESSAGE } from '../../utils/whatsapp';

const heroServiceImg = '/brand/fotos/atendimento-real-hero.jpeg';

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

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
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1, delayChildren: 0.05 }}
          >
            <motion.div
              variants={itemVariants}
              className="mb-5 flex items-center gap-3 text-sm font-semibold text-brand-cyan-400"
            >
              <span className="h-px w-8 bg-brand-cyan-400" aria-hidden="true" />
              <span>Climatização em Blumenau e região</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="max-w-3xl font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Conforto em cada detalhe.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg"
            >
              Instalação, manutenção e higienização de ar-condicionado para ambientes residenciais e empresariais.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
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
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-7 flex max-w-xl items-start gap-2.5 border-t border-white/10 pt-5 text-sm leading-relaxed text-slate-300"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan-400" aria-hidden="true" />
              <p>Atendemos Blumenau e região, com garantia de 90 dias nos serviços e emissão de Nota Fiscal.</p>
            </motion.div>
          </motion.div>

          <motion.figure
            className="mx-auto w-full max-w-xl lg:col-span-5"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="overflow-hidden rounded-feature border border-white/10 bg-brand-navy-900 shadow-floating">
              <img
                src={heroServiceImg}
                alt="Profissional da MG Climatização trabalhando em um aparelho de ar-condicionado"
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                className="aspect-[3/4] w-full object-cover object-center lg:aspect-[4/3] lg:object-[50%_35%]"
              />
              <figcaption className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 text-sm text-slate-300 sm:px-5">
                <span>Atendimento residencial e empresarial</span>
                <span className="hidden font-semibold text-brand-cyan-400 sm:inline">MG Climatização</span>
              </figcaption>
            </div>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
