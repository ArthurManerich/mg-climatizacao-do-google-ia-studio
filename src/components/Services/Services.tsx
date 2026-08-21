import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Snowflake } from 'lucide-react';
import { motion } from 'motion/react';
import { pillarsData } from '../../data/services';
import { servicesService } from '../../services/servicesService';
import { Service } from '../../types';
import ServiceCard from './ServiceCard';

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

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <>
      <section className="border-b border-line bg-surface py-10 sm:py-12" aria-labelledby="pilares-title">
        <div className="mx-auto max-w-7xl px-gutter sm:px-gutter-lg lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[0.75fr_2.25fr] lg:items-center lg:gap-12">
            <div>
              <p className="text-sm font-semibold text-brand-cyan-700">Compromissos no atendimento</p>
              <h2 id="pilares-title" className="mt-2 font-display text-2xl font-bold text-brand-navy-800 sm:text-3xl">
                Soluções para cada necessidade.
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-3 sm:gap-0">
              {pillarsData.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="flex gap-3 border-line sm:border-l sm:px-5 first:sm:border-l-0">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-cyan-700" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-base font-bold text-brand-navy-800">{pillar.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{pillar.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="servicos" className="overflow-hidden bg-surface-subtle py-section sm:py-section-lg">
        <div className="mx-auto max-w-7xl px-gutter sm:px-gutter-lg lg:px-8">
          <div className="mb-9 max-w-3xl sm:mb-12">
            <p className="text-sm font-semibold text-brand-cyan-700">Serviços</p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-brand-navy-800 sm:text-4xl">
              Soluções para climatização e refrigeração.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
              Atendimento residencial e empresarial em Blumenau e região, conforme a necessidade de cada ambiente.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-card border border-amber-200 bg-amber-50 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <p className="text-sm font-semibold text-amber-900">{error}</p>
              <button
                type="button"
                onClick={() => void loadServices()}
                disabled={loading}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-sm font-bold text-brand-navy-800 disabled:opacity-60 sm:mt-0"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {loading ? 'Tentando novamente...' : 'Tentar novamente'}
              </button>
            </div>
          )}

          {loading && servicesList.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-card border border-line bg-surface">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-cyan-600 border-t-transparent" />
              <p className="text-sm font-semibold text-ink-muted">Carregando serviços...</p>
            </div>
          ) : error && servicesList.length === 0 ? null : servicesList.length === 0 ? (
            <div className="mx-auto flex min-h-40 max-w-2xl flex-col items-center justify-center rounded-card border border-line bg-surface px-5 text-center">
              <Snowflake className="mb-3 h-7 w-7 text-brand-cyan-600" aria-hidden="true" />
              <p className="font-display text-lg font-bold text-brand-navy-800">Serviços ainda não cadastrados.</p>
              <p className="mt-1 text-sm text-ink-muted">Novos serviços serão apresentados aqui quando estiverem disponíveis.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              variants={listVariants}
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
