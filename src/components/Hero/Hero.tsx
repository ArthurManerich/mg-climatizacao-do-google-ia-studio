import React from 'react';
import { Check, Phone, ArrowRight, Sliders, Snowflake, ShieldCheck } from 'lucide-react';
import { getWhatsAppLink, DEFAULT_QUICK_QUOTE_MESSAGE } from '../../utils/whatsapp';
import { BRAND } from '../../config';
import { useSettings } from '../../context/SettingsContext';
import { motion } from 'motion/react';
import technicianHeroImg from '../../assets/images/hvac_technician_hero_1786544677995.jpg';

export default function Hero() {
  const { settings } = useSettings();

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const imageVariants: any = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section id="inicio" className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-20 bg-[#00152B] text-white">
      {/* Soft Prussian Blue Atmospheric Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#001021] via-[#002E5C] to-[#00152B] pointer-events-none"></div>
      
      {/* Subtle Background Grid Line Texture */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#00B2FF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      
      {/* Soft Ambient Glows (Subtle and non-intrusive) */}
      <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-[#0096D6]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#00B2FF]/10 blur-3xl pointer-events-none"></div>
      <Snowflake className="absolute top-10 right-12 w-8 h-8 text-[#00B2FF]/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Left Main Content */}
          <div className="md:col-span-7 flex flex-col justify-center">
            
            {/* Clean Brand Pill */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#002E5C] text-[#00B2FF] border border-[#0096D6]/30 shadow-xs">
                <Snowflake className="w-3.5 h-3.5 text-[#00B2FF]" />
                <span>MG CLIMATIZAÇÃO</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0096D6]/15 text-[#00B2FF] border border-[#0096D6]/20">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Empresa Especializada</span>
              </span>
            </motion.div>
            
            {/* Title - Commercial, Emotional & Direct */}
            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl font-black font-display leading-[1.12] tracking-tight mb-3 text-white"
            >
              Conforto e climatização <span className="text-[#00B2FF]">do jeito certo.</span>
            </motion.h1>

            {/* Clear Subtitle Explaining the Services & Region */}
            <motion.p 
              variants={itemVariants}
              className="text-slate-200 font-medium text-base sm:text-xl lg:text-2xl mb-6 leading-snug max-w-2xl"
            >
              Instalação, manutenção e higienização de ar-condicionado em <strong className="text-white font-bold">Blumenau e região.</strong>
            </motion.p>

            {/* Action Buttons with Clear Hierarchy */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-8"
            >
              {/* PRIMARY DOMINANT ACTION */}
              <a 
                href={getWhatsAppLink(settings.whatsapp_message || DEFAULT_QUICK_QUOTE_MESSAGE, settings.whatsapp_number)}
                target="whatsapp"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white text-base sm:text-lg font-black px-7 py-4 min-h-[54px] rounded-2xl shadow-lg hover:shadow-[#0096D6]/25 transition-all group duration-300 relative overflow-hidden"
                id="btn-whatsapp-hero"
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Phone className="w-5 h-5 fill-current shrink-0" />
                <span>Solicitar orçamento grátis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
              </a>
              
              {/* SECONDARY ACTION */}
              <a 
                href="#orcamento-online"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#0096D6]/40 bg-[#001D3D]/60 hover:bg-[#002E5C] text-slate-200 hover:text-white px-6 py-4 min-h-[54px] rounded-2xl text-sm sm:text-base font-bold transition-all duration-200"
              >
                <Sliders className="w-4 h-4 text-[#00B2FF] shrink-0" />
                <span>Simular preço online</span>
              </a>
            </motion.div>

            {/* Prova de Confiança Imediata - 4 Key Pillars */}
            <motion.div 
              variants={itemVariants}
              className="p-4 bg-[#001D3D]/80 border border-[#003E7A]/80 rounded-2xl grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold text-white shadow-md backdrop-blur-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0096D6]/20 border border-[#0096D6]/40 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[#00B2FF] stroke-[3]" />
                </div>
                <span className="text-slate-100 text-xs font-semibold">Atendimento rápido</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0096D6]/20 border border-[#0096D6]/40 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[#00B2FF] stroke-[3]" />
                </div>
                <span className="text-slate-100 text-xs font-semibold">Garantia de 90 dias</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0096D6]/20 border border-[#0096D6]/40 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[#00B2FF] stroke-[3]" />
                </div>
                <span className="text-slate-100 text-xs font-semibold">Profissionais especializados</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0096D6]/20 border border-[#0096D6]/40 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[#00B2FF] stroke-[3]" />
                </div>
                <span className="text-slate-100 text-xs font-semibold">Blumenau e região</span>
              </div>
            </motion.div>

          </div>

          {/* Right Simplified Support Card with Human Technician Photo */}
          <motion.div 
            variants={imageVariants}
            className="md:col-span-5 relative mt-2 md:mt-0"
          >
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-[#002E5C] via-[#0096D6] to-[#00B2FF] opacity-20 blur-lg"></div>
              
              <div className="relative rounded-3xl bg-[#001D3D] border border-[#003E7A] overflow-hidden shadow-xl">
                
                {/* Large Human Photo of Technician at Work */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#001021]">
                  <img 
                    src={technicianHeroImg} 
                    alt="Técnico especialista da MG Climatização realizando instalação e manutenção de ar-condicionado" 
                    decoding="async"
                    fetchPriority="high"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001D3D] via-transparent to-transparent"></div>
                  
                  {/* Subtle Badge */}
                  <div className="absolute top-3 left-3 bg-[#00152B]/90 border border-[#0096D6]/30 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#00B2FF]"></span>
                    <span className="text-[11px] font-black tracking-wide text-white">MG CLIMATIZAÇÃO</span>
                  </div>
                </div>

                {/* Simplified Card Content */}
                <div className="p-5 text-center space-y-3 bg-[#001D3D]">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-white">Climatização residencial e comercial</h3>
                    <p className="text-xs font-bold text-[#00B2FF] mt-1">Instalação • Manutenção • Higienização</p>
                  </div>

                  <a 
                    href={getWhatsAppLink(settings.whatsapp_message || "Olá! Gostaria de falar com a equipe técnica da MG Climatização.", settings.whatsapp_number)}
                    target="whatsapp"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Phone className="w-4 h-4 fill-current shrink-0" />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>

              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
