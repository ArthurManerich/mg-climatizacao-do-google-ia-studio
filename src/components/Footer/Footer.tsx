import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const OFFICIAL_LOGO = '/brand/logo-principal.jpg';
const OFFICIAL_DOMAIN = 'https://mgclimabnu.com.br/';
const footerLinks = [
  ['Início', '#inicio'], ['Serviços', '#servicos'], ['Sobre', '#sobre'],
  ['Montar solicitação', '#orcamento-online'], ['Portfólio', '#portfolio'], ['Dúvidas', '#faq'],
] as const;

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-white/10 bg-brand-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-gutter py-9 sm:px-gutter-lg sm:py-11">
        <div className="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1.1fr_0.9fr_1fr]">
          <div className="max-w-sm">
            <a href="#inicio" className="inline-flex min-h-11 items-center gap-3" aria-label="MG Climatização — voltar ao início">
              <span className="h-14 w-14 overflow-hidden rounded-card border border-white/10 bg-brand-navy-900"><img src={settings.logo_url || OFFICIAL_LOGO} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = OFFICIAL_LOGO; }} alt="Logo oficial da MG Climatização" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-contain" /></span>
              <span className="text-lg font-bold text-white">{settings.company_name}</span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">Climatização e refrigeração para residências e empresas em Blumenau e região.</p>
            <a href={OFFICIAL_DOMAIN} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand-cyan-400 hover:text-white">mgclimabnu.com.br</a>
            <div className="mt-2 flex gap-2">
              {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-control border border-white/10 text-slate-300 transition-colors hover:border-brand-cyan-600 hover:text-white"><Instagram aria-hidden="true" className="h-5 w-5" /></a>}
              {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-control border border-white/10 text-slate-300 transition-colors hover:border-brand-cyan-600 hover:text-white"><Facebook aria-hidden="true" className="h-5 w-5" /></a>}
            </div>
          </div>

          <nav aria-label="Links do rodapé">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Navegação</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-4">
              {footerLinks.map(([label, href]) => <a key={href} href={href} className="inline-flex min-h-11 items-center text-sm text-slate-400 transition-colors hover:text-white">{label}</a>)}
            </div>
          </nav>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Contato</h2>
            <div className="mt-3 space-y-1 text-sm">
              {settings.phone && <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="flex min-h-11 items-center gap-3 text-slate-300 hover:text-white"><Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-cyan-400" />{settings.phone}</a>}
              {settings.email && <a href={`mailto:${settings.email}`} className="flex min-h-11 items-center gap-3 break-all text-slate-300 hover:text-white"><Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-cyan-400" />{settings.email}</a>}
              <p className="flex min-h-11 items-center gap-3 text-slate-300"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-cyan-400" />{settings.address || 'Blumenau e região'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.company_name}. Todos os direitos reservados.</p>
          <a href="/login" className="inline-flex min-h-11 items-center text-slate-500 transition-colors hover:text-brand-cyan-400">Área restrita</a>
        </div>
      </div>
    </footer>
  );
}
