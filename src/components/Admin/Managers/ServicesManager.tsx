import React, { useRef, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { servicesService } from '../../../services/servicesService';
import type { ServiceItem } from '../../../types';
import { findRestrictedServiceContent } from '../../../utils/serviceContent';

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 500;
const ICON_MAX = 50;
const TOPIC_MAX = 120;
const TOPICS_MAX = 8;
const SERVICE_ICONS = ['Wind', 'ShieldCheck', 'Sparkles', 'Gauge', 'Wrench', 'Building2', 'Settings', 'Flame', 'Zap', 'Fan'] as const;

interface ServicesManagerProps {
  services: ServiceItem[];
  onServicesChange: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
}

type Message = { type: 'success' | 'error'; text: string } | null;

export function sanitizeServiceTopics(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split('\n')
    .map(topic => topic.trim().replace(/\s+/g, ' '))
    .filter(topic => {
      if (!topic) return false;
      const key = topic.toLocaleLowerCase('pt-BR');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, TOPICS_MAX);
}

function sortServices(items: ServiceItem[]): ServiceItem[] {
  return [...items].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({ services, onServicesChange }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Wind');
  const [topics, setTopics] = useState('');
  const [orderIndex, setOrderIndex] = useState(services.length + 1);
  const [message, setMessage] = useState<Message>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const operationRef = useRef(false);

  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setIcon('Wind');
    setTopics('');
    setOrderIndex(services.length + 1);
  };

  const openCreate = () => {
    resetForm();
    setMessage(null);
    setFormOpen(true);
  };

  const openEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setTitle(service.title);
    setDescription(service.description);
    setIcon(service.icon);
    setTopics(service.bullet_points.join('\n'));
    setOrderIndex(service.order_index ?? 0);
    setMessage(null);
    setFormOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (operationRef.current) return;

    const cleanTitle = title.trim().replace(/\s+/g, ' ');
    const cleanDescription = description.trim().replace(/\s+/g, ' ');
    const cleanIcon = icon.trim().replace(/\s+/g, ' ') || 'Wind';
    const cleanTopics = sanitizeServiceTopics(topics);
    const cleanOrder = Math.max(0, Math.min(9999, Math.trunc(orderIndex || 0)));

    if (!cleanTitle || !cleanDescription) {
      setMessage({ type: 'error', text: 'Preencha o título e a descrição do serviço.' });
      return;
    }
    if (cleanTitle.length > TITLE_MAX || cleanDescription.length > DESCRIPTION_MAX || cleanIcon.length > ICON_MAX) {
      setMessage({ type: 'error', text: 'Revise os limites de tamanho dos campos.' });
      return;
    }
    if (cleanTopics.some(topic => topic.length > TOPIC_MAX)) {
      setMessage({ type: 'error', text: `Cada tópico deve ter no máximo ${TOPIC_MAX} caracteres.` });
      return;
    }
    const restricted = findRestrictedServiceContent({ title: cleanTitle, description: cleanDescription, bullet_points: cleanTopics });
    if (restricted) {
      setMessage({ type: 'error', text: `Revise o serviço. ${restricted} não está autorizado no conteúdo público.` });
      return;
    }
    if (!SERVICE_ICONS.includes(cleanIcon as (typeof SERVICE_ICONS)[number])) {
      setMessage({ type: 'error', text: 'Selecione um ícone válido para o serviço.' });
      return;
    }

    operationRef.current = true;
    setSaving(true);
    setMessage(null);
    try {
      if (editingId) {
        const updated = await servicesService.update(editingId, {
          title: cleanTitle,
          description: cleanDescription,
          icon: cleanIcon,
          bullet_points: cleanTopics,
          order_index: cleanOrder,
        });
        onServicesChange(current => sortServices(current.map(item => item.id === editingId ? updated : item)));
        setMessage({ type: 'success', text: 'Serviço atualizado com sucesso.' });
      } else {
        const created = await servicesService.create({
          id: crypto.randomUUID(),
          title: cleanTitle,
          description: cleanDescription,
          icon: cleanIcon,
          bullet_points: cleanTopics,
          order_index: cleanOrder,
        });
        onServicesChange(current => sortServices([...current, created]));
        setMessage({ type: 'success', text: 'Serviço cadastrado com sucesso.' });
      }
      resetForm();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível salvar o serviço.' });
    } finally {
      operationRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (operationRef.current) return;
    operationRef.current = true;
    setDeletingId(id);
    setMessage(null);
    try {
      await servicesService.delete(id);
      onServicesChange(current => current.filter(item => item.id !== id));
      setConfirmingDeleteId(null);
      setMessage({ type: 'success', text: 'Serviço excluído com sucesso.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível excluir o serviço.' });
    } finally {
      operationRef.current = false;
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-manager space-y-6" id="view-services">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-lg font-extrabold text-slate-900">Especialidades de Serviço</h2>
          <p className="text-xs text-slate-500">Gerencie os serviços exibidos no site.</p>
        </div>
        {!formOpen && (
          <button type="button" onClick={openCreate} disabled={saving || deletingId !== null} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#0096D6] bg-[#0096D6] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-[#0082BA] disabled:cursor-not-allowed disabled:opacity-60">
            <Plus className="h-4 w-4" aria-hidden="true" /> Novo Serviço
          </button>
        )}
      </div>

      {message && (
        <div role={message.type === 'error' ? 'alert' : 'status'} className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-bold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="Fechar mensagem" className="min-h-11 min-w-11 rounded-lg p-2 hover:bg-black/5"><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      )}

      {formOpen && (
        <div className="space-y-4 rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-[#002E5C]">{editingId ? 'Editar serviço' : 'Novo serviço'}</h3>
            <button type="button" onClick={resetForm} disabled={saving} className="min-h-11 rounded-lg bg-slate-100 px-3 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-60">Cancelar</button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-6">
              <label className="space-y-1.5 md:col-span-3">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Título</span>
                <input aria-label="Título" value={title} onChange={event => setTitle(event.target.value)} maxLength={TITLE_MAX} required disabled={saving} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 focus:border-[#0096D6] focus:outline-none disabled:opacity-60" />
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Ícone</span>
                <select aria-label="Ícone" value={icon} onChange={event => setIcon(event.target.value)} disabled={saving} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-[#0096D6] focus:outline-none disabled:opacity-60">
                  {SERVICE_ICONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 md:col-span-1">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Ordem</span>
                <input aria-label="Ordem" type="number" min={0} max={9999} value={orderIndex} onChange={event => setOrderIndex(Number(event.target.value))} disabled={saving} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-[#0096D6] focus:outline-none disabled:opacity-60" />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Descrição</span>
              <textarea aria-label="Descrição" value={description} onChange={event => setDescription(event.target.value)} maxLength={DESCRIPTION_MAX} required rows={3} disabled={saving} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#0096D6] focus:outline-none disabled:opacity-60" />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Adicione um tópico por linha, até {TOPICS_MAX}</span>
              <textarea aria-label="Tópicos" value={topics} onChange={event => setTopics(event.target.value)} maxLength={TOPICS_MAX * (TOPIC_MAX + 1)} rows={5} disabled={saving} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#0096D6] focus:outline-none disabled:opacity-60" />
            </label>
            <div className="flex justify-end">
              <button type="submit" disabled={saving || deletingId !== null} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#0096D6] bg-[#0096D6] px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-[#0082BA] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar serviço'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm" aria-busy={saving || deletingId !== null}>
        <div className="flex items-center justify-between border-b border-slate-200/70 bg-slate-50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Serviços cadastrados ({services.length})</span>
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">Ações permitidas</span>
        </div>
        <div className="divide-y divide-slate-100">
          {services.length === 0 ? (
            <div className="admin-empty-state p-8 text-center"><p className="admin-empty-title text-sm font-extrabold">Nenhum serviço cadastrado</p><p className="mt-1 text-xs">Use “Novo Serviço” para cadastrar o primeiro serviço.</p></div>
          ) : sortServices(services).map(item => (
            <article key={item.id} className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-start">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-[#0096D6]/30 bg-[#E6F5FC] px-2 py-0.5 text-[9px] font-bold uppercase text-[#002E5C]">Ordem #{item.order_index ?? 0}</span>
                  <h4 className="break-words text-xs font-black uppercase tracking-wide text-slate-950">{item.title}</h4>
                  <span className="text-[9px] font-mono text-slate-400">{item.icon}</span>
                </div>
                <p className="max-w-3xl break-words text-xs leading-relaxed text-slate-600">{item.description}</p>
                {item.bullet_points.length > 0 && <ul className="flex flex-wrap gap-1.5" aria-label={`Tópicos de ${item.title}`}>{item.bullet_points.map(topic => <li key={topic} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{topic}</li>)}</ul>}
              </div>

              {confirmingDeleteId === item.id ? (
                <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs md:w-auto">
                  <span className="font-extrabold text-rose-800">Excluir este serviço?</span>
                  <button type="button" onClick={() => void handleDelete(item.id)} disabled={deletingId !== null || saving} className="min-h-11 rounded-lg bg-rose-600 px-3 text-[10px] font-bold uppercase text-white hover:bg-rose-700 disabled:opacity-60">{deletingId === item.id ? 'Excluindo...' : 'Sim, excluir'}</button>
                  <button type="button" onClick={() => setConfirmingDeleteId(null)} disabled={deletingId !== null || saving} className="min-h-11 rounded-lg bg-slate-200 px-3 text-[10px] font-bold uppercase text-slate-700 hover:bg-slate-300 disabled:opacity-60">Cancelar</button>
                </div>
              ) : (
                <div className="flex w-full gap-2 md:w-auto">
                  <button type="button" onClick={() => openEdit(item)} disabled={saving || deletingId !== null} aria-label={`Editar ${item.title}`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-60 md:flex-none"><Edit className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" onClick={() => setConfirmingDeleteId(item.id)} disabled={saving || deletingId !== null} aria-label={`Excluir ${item.title}`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-rose-100 p-2.5 text-rose-600 hover:bg-rose-50 disabled:opacity-60 md:flex-none"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
