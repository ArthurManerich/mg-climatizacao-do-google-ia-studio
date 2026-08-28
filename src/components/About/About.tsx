import React from 'react';
import { MessageCircle } from 'lucide-react';
import { TEAM_CONTACTS } from '../../config';
import { getWhatsAppLink } from '../../utils/whatsapp';

export default function About() {
  const team = [
    TEAM_CONTACTS.marcos,
    TEAM_CONTACTS.gabriel,
  ];

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
            Quem está por trás da MG Climatização
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-200 sm:text-lg">
            Marcos Manerich e Gabriel Klaumann Marcos formam a equipe da MG Climatização, atendendo residências e empresas de Blumenau e região.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            O atendimento abrange instalação, manutenção, higienização, carga de fluido refrigerante e trabalho em altura quando necessário, sempre de acordo com as condições de cada serviço.
          </p>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10" aria-label="Equipe da MG Climatização">
          {team.map((person) => (
            <article key={person.name} className="py-5">
              <h3 className="font-display text-lg font-bold text-brand-cyan-400">{person.name}</h3>
              <p className="mt-1 text-sm font-semibold text-white">{person.role}</p>
              <div className="mt-2 text-sm leading-relaxed text-slate-300">
                <p className="font-semibold text-slate-200">Formação</p>
                <p>Curso de Refrigeração e Climatização</p>
              </div>
              <a
                href={getWhatsAppLink(person.message, person.number)}
                target="whatsapp"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-brand-cyan-600/60 bg-brand-navy-950/40 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-cyan-600/15 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 text-brand-cyan-400" aria-hidden="true" />
                Falar com {person.name.split(' ')[0]}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
