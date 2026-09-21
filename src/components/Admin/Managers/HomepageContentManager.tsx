import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { authService } from '../../../services/authService';
import { adminSettingsService } from '../../../services/adminSettingsService';
import { useSettings } from '../../../context/SettingsContext';
import { HERO_TITLE_MAX_LENGTH, validHeroTitle } from '../../../utils/companySettings';

interface HomepageContentManagerProps {
  title: string;
  onTitleSaved: (title: string) => void;
}

export function HomepageContentManager({ title, onTitleSaved }: HomepageContentManagerProps) {
  const [draft, setDraft] = useState(title);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const savingRef = useRef(false);
  const { refreshSettings, applyHeroTitle } = useSettings();

  useEffect(() => setDraft(title), [title]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return;
    const validTitle = validHeroTitle(draft);
    if (!validTitle) {
      setMessage({ type: 'error', text: `Informe um título com até ${HERO_TITLE_MAX_LENGTH} caracteres, sem HTML ou quebras de linha.` });
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await authService.getCurrentAdmin();
      if (!data.isAdmin) throw new Error('Somente administradores podem alterar o título.');
      await adminSettingsService.setHeroTitle(validTitle);
      onTitleSaved(validTitle);
      applyHeroTitle(validTitle);
      setDraft(validTitle);
      await refreshSettings();
      setMessage({ type: 'success', text: 'Título principal salvo.' });
    } catch {
      setMessage({ type: 'error', text: 'Não foi possível salvar o título principal. Tente novamente.' });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <section className="admin-manager space-y-6" aria-labelledby="homepage-content-title">
      <div>
        <h2 id="homepage-content-title" className="text-xl font-extrabold font-display text-slate-900">Conteúdo da página inicial</h2>
        <p className="text-xs text-slate-500">Edite o título exibido no topo do site.</p>
      </div>
      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div>
          <label htmlFor="hero-title-input" className="mb-2 block text-sm font-bold text-slate-800">Título principal</label>
          <input
            id="hero-title-input"
            type="text"
            required
            maxLength={HERO_TITLE_MAX_LENGTH}
            value={draft}
            onChange={event => { setDraft(event.target.value); setMessage(null); }}
            disabled={saving}
            aria-describedby="hero-title-limit"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6] disabled:opacity-60"
          />
          <p id="hero-title-limit" className="mt-1 text-xs text-slate-500">{draft.length}/{HERO_TITLE_MAX_LENGTH} caracteres</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-brand-navy-950 p-5 sm:p-7">
          <p className="mb-3 text-xs font-bold text-brand-cyan-400">Prévia do título</p>
          <p className="max-w-3xl break-words font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">{draft || 'Título principal'}</p>
        </div>
        {message && <p role="status" className={message.type === 'error' ? 'text-sm text-rose-700' : 'text-sm text-emerald-700'}>{message.text}</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-[#002E5C] px-5 text-sm font-bold text-white hover:bg-[#0096D6] disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar alterações'}</button>
          <button type="button" disabled={saving || draft === title} onClick={() => { setDraft(title); setMessage(null); }} className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Cancelar</button>
        </div>
      </form>
    </section>
  );
}
