import React from 'react';

const facts = [
  { value: 'Marcos Manerich', label: 'Responsável pela MG Climatização' },
  { value: 'Blumenau', label: 'Atendimento na cidade e região' },
  { value: 'NR-35', label: 'Capacitação válida' },
];

export default function About() {
  return (
    <section
      id="sobre"
      style={{ scrollMarginTop: 0 }}
      className="relative overflow-hidden bg-brand-navy-900 py-section text-white sm:py-section-lg"
    >
      <div
        className="pointer-events-none absolute -right-28 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-brand-cyan-400/10"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-gutter sm:px-gutter-lg lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:gap-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-brand-cyan-400">Sobre a MG Climatização</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            Conhecimento técnico com atendimento próximo.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-200 sm:text-lg">
            Conduzida por Marcos Manerich, a MG Climatização atua em climatização e refrigeração para residências e empresas de Blumenau e região.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            O atendimento abrange instalação, manutenção, higienização, carga de fluido refrigerante e trabalho em altura quando necessário, sempre de acordo com as condições de cada serviço.
          </p>
        </div>

        <dl className="divide-y divide-white/10 border-y border-white/10">
          {facts.map((fact) => (
            <div key={fact.value} className="grid grid-cols-[7rem_1fr] gap-4 py-4 sm:grid-cols-[8rem_1fr]">
              <dt className="font-display text-base font-bold text-brand-cyan-400 sm:text-lg">{fact.value}</dt>
              <dd className="text-sm leading-relaxed text-slate-300">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
