import React, { useState, useEffect, useCallback, useRef } from 'react';
import { pillarsData } from '../../data/services';
import { servicesService } from '../../services/servicesService';
import ServiceCard from './ServiceCard';
import { Service } from '../../types';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Services() {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadServices = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await servicesService.getAll();
      if (requestId === requestIdRef.current) {
        setServicesList(data);
      }
    } catch (loadError) {
      console.warn('Erro ao carregar serviços do Supabase:', loadError);
      if (requestId === requestIdRef.current) {
        setError('Não foi possível carregar os serviços. Tente novamente.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadServices();
    window.addEventListener('online', loadServices);
    return () => {
      requestIdRef.current += 1;
      window.removeEventListener('online', loadServices);
    };
  }, [loadServices]);

  const containerVariants: any = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <>
      {/* COMMITMENT / VALUES BAR */}
      <section className="bg-white border-y border-[#E2E8F0] py-8 sm:py-10 relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#0096D6]">Nossos Pilares de Atendimento</span>
            <h2 className="text-lg sm:text-xl font-bold text-[#002E5C] font-display mt-1">Por que escolher a MG Climatização?</h2>
          </div>
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {pillarsData.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="flex flex-col items-center text-center p-3 sm:p-4 hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E6F5FC] text-[#0096D6] border border-[#0096D6]/20 flex items-center justify-center mb-2.5 sm:mb-3 flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-bold text-[#002E5C] text-sm sm:text-base mb-1">{pillar.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed max-w-xs">{pillar.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SERVICES LISTING */}
      <section id="servicos" className="py-12 sm:py-16 md:py-20 bg-slate-50/70 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 px-3 py-1.5 rounded-full">
              O Que Oferecemos
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002E5C] font-display mt-3 sm:mt-4 mb-3 sm:mb-4">
              Serviços de climatização profissional
            </h2>
            <p className="text-[#475569] text-xs sm:text-base leading-relaxed">
              Instalação, manutenção, higienização e carga de gás para residências, apartamentos, empresas e comércios em Blumenau e região.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-sm font-bold text-amber-900">{error}</p>
              <button
                type="button"
                onClick={() => void loadServices()}
                disabled={loading}
                className="mt-2 text-xs font-extrabold text-[#002E5C] underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Tentando novamente...' : 'Tentar novamente'}
              </button>
            </div>
          )}

          {loading && servicesList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#0096D6] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#475569] font-bold text-sm">Carregando serviços...</p>
            </div>
          ) : error && servicesList.length === 0 ? null : servicesList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] px-4 max-w-2xl mx-auto shadow-sm">
              <Sparkles className="w-10 h-10 text-[#F5A524] mx-auto mb-3" />
              <p className="text-[#002E5C] font-bold text-base">Em breve adicionaremos novos serviços.</p>
              <p className="text-[#475569] text-xs mt-1">Os serviços prestados pela MG Climatização serão cadastrados em breve.</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {servicesList.map((service, index) => (
                <ServiceCard
                  key={service.id || index}
                  id={service.id}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  bulletPoints={service.bullet_points || []}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
