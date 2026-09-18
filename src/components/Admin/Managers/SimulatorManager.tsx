import React, { useState } from 'react';
import { AlertCircle, Building2, Calculator, Check, Gauge, Plus, RefreshCw, Save, Trash2, Wind } from 'lucide-react';
import { useSimulator } from '../Hooks/useSimulator';

type SimulatorTab = 'services' | 'btus' | 'properties';

export function SimulatorManager() {
  const { config, loading, saving, error, success, reloadConfig, saveConfig, addService, removeService, addCapacity, removeCapacity, addPropertyType, removePropertyType } = useSimulator();
  const [activeSubTab, setActiveSubTab] = useState<SimulatorTab>('services');
  const [newBtuId, setNewBtuId] = useState('');
  const [newBtuLabel, setNewBtuLabel] = useState('');
  const [newBtuDesc, setNewBtuDesc] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newServiceLabel, setNewServiceLabel] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('Wind');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newPropertyId, setNewPropertyId] = useState('');
  const [newPropertyLabel, setNewPropertyLabel] = useState('');

  const confirmRemoval = (label: string, remove: () => void) => {
    if (window.confirm(`Remover ${label}? Esta alteração será aplicada após salvar.`)) remove();
  };
  const handleAddBtu = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newBtuId || !newBtuLabel) return;
    addCapacity({ id: newBtuId.replace(/\D/g, '') || newBtuId, label: newBtuLabel, desc: newBtuDesc });
    setNewBtuId(''); setNewBtuLabel(''); setNewBtuDesc('');
  };
  const handleAddService = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newServiceId || !newServiceLabel) return;
    addService({ id: newServiceId.toLowerCase().replace(/\s+/g, '-'), label: newServiceLabel, icon: newServiceIcon, description: newServiceDesc });
    setNewServiceId(''); setNewServiceLabel(''); setNewServiceDesc('');
  };
  const handleAddProperty = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newPropertyId || !newPropertyLabel) return;
    addPropertyType({ id: newPropertyId.toLowerCase().replace(/\s+/g, '-'), label: newPropertyLabel });
    setNewPropertyId(''); setNewPropertyLabel('');
  };

  if (loading) return <div className="admin-manager flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white p-12 text-center"><div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0096D6] border-t-transparent" /><p className="text-sm font-bold text-slate-700">Carregando configurações do simulador...</p></div>;

  const tabs: Array<{ id: SimulatorTab; label: string; icon: typeof Wind }> = [
    { id: 'services', label: 'Serviços do simulador', icon: Wind },
    { id: 'btus', label: 'Capacidades em BTUs', icon: Gauge },
    { id: 'properties', label: 'Tipos de imóvel', icon: Building2 },
  ];

  return <div className="admin-manager space-y-6" id="view-simulator">
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
      <div><div className="flex items-center gap-2"><Calculator className="h-6 w-6 text-[#0096D6]" /><h2 className="font-display text-xl font-black text-[#002E5C]">Opções do simulador</h2></div><p className="mt-1 text-xs text-slate-500">Gerencie serviços, capacidades em BTUs e tipos de imóvel disponíveis na solicitação.</p></div>
      <div className="flex w-full justify-end gap-2 sm:w-auto"><button type="button" onClick={reloadConfig} className="min-h-11 min-w-11 rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Recarregar opções"><RefreshCw className="h-4 w-4" /></button><button type="button" onClick={() => saveConfig(config)} disabled={saving} className="flex min-h-11 items-center gap-2 rounded-xl border border-[#0096D6] bg-[#0096D6] px-5 py-2.5 text-xs font-black text-white disabled:opacity-50">{saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}Salvar alterações</button></div>
    </div>
    {error && <div role="alert" className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800"><AlertCircle className="h-5 w-5" />{error}</div>}
    {success && <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800"><Check className="h-5 w-5" />{success}</div>}
    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2" role="tablist" aria-label="Opções do simulador">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={activeSubTab === id} onClick={() => setActiveSubTab(id)} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold ${activeSubTab === id ? 'bg-[#002E5C] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><Icon className="h-4 w-4" />{label}</button>)}</div>

    {activeSubTab === 'services' && <section className="space-y-6" aria-label="Serviços do simulador"><AdminCard title="Adicionar serviço"><form onSubmit={handleAddService} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Field label="Identificador"><input value={newServiceId} onChange={e => setNewServiceId(e.target.value)} required placeholder="Por exemplo, higienizacao" className="admin-input" /></Field><Field label="Nome do serviço"><input value={newServiceLabel} onChange={e => setNewServiceLabel(e.target.value)} required placeholder="Por exemplo, Higienização" className="admin-input" /></Field><Field label="Ícone"><select value={newServiceIcon} onChange={e => setNewServiceIcon(e.target.value)} className="admin-input"><option value="Wind">Instalação</option><option value="ShieldCheck">Manutenção preventiva</option><option value="Wrench">Manutenção corretiva</option><option value="Sparkles">Higienização</option><option value="Gauge">Carga de gás</option><option value="Unplug">Desinstalação</option></select></Field><Field label="Descrição"><input value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} className="admin-input" /></Field><AddButton label="Adicionar serviço" /></form></AdminCard><AdminCard title="Serviços cadastrados"><OptionGrid>{config.services.map(item => <OptionCard key={item.id} title={item.label} detail={item.description} id={item.id} onRemove={() => confirmRemoval(`o serviço “${item.label}”`, () => removeService(item.id))} removeLabel={`Remover serviço ${item.label}`} />)}</OptionGrid></AdminCard></section>}

    {activeSubTab === 'btus' && <section className="space-y-6" aria-label="Capacidades em BTUs"><AdminCard title="Adicionar capacidade em BTUs"><form onSubmit={handleAddBtu} className="grid gap-4 sm:grid-cols-3"><Field label="Código/valor BTU"><input value={newBtuId} onChange={e => setNewBtuId(e.target.value)} required className="admin-input" /></Field><Field label="Rótulo"><input value={newBtuLabel} onChange={e => setNewBtuLabel(e.target.value)} required className="admin-input" /></Field><Field label="Descrição"><input value={newBtuDesc} onChange={e => setNewBtuDesc(e.target.value)} className="admin-input" /></Field><AddButton label="Adicionar capacidade" /></form></AdminCard><AdminCard title="Capacidades cadastradas"><OptionGrid>{config.capacities.map(item => <OptionCard key={item.id} title={item.label} detail={item.desc} id={item.id} onRemove={() => confirmRemoval(`a capacidade “${item.label}”`, () => removeCapacity(item.id))} removeLabel={`Remover capacidade ${item.label}`} />)}</OptionGrid></AdminCard></section>}

    {activeSubTab === 'properties' && <section className="space-y-6" aria-label="Tipos de imóvel"><AdminCard title="Adicionar tipo de imóvel"><form onSubmit={handleAddProperty} className="grid gap-4 sm:grid-cols-2"><Field label="Identificador"><input value={newPropertyId} onChange={e => setNewPropertyId(e.target.value)} required className="admin-input" /></Field><Field label="Nome do imóvel"><input value={newPropertyLabel} onChange={e => setNewPropertyLabel(e.target.value)} required className="admin-input" /></Field><AddButton label="Adicionar tipo de imóvel" /></form></AdminCard><AdminCard title="Tipos de imóvel cadastrados"><OptionGrid>{config.propertyTypes.map(item => <OptionCard key={item.id} title={item.label} id={item.id} onRemove={() => confirmRemoval(`o tipo de imóvel “${item.label}”`, () => removePropertyType(item.id))} removeLabel={`Remover tipo de imóvel ${item.label}`} />)}</OptionGrid></AdminCard></section>}
  </div>;
}

function AdminCard({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-6"><h3 className="mb-4 text-base font-extrabold text-slate-900">{title}</h3>{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold text-slate-700"><span className="mb-1 block">{label}</span>{children}</label>; }
function AddButton({ label }: { label: string }) { return <button type="submit" className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#0096D6] bg-[#0096D6] px-4 py-2 text-xs font-black text-white"><Plus className="h-4 w-4" />{label}</button>; }
function OptionGrid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>; }
function OptionCard({ title, detail, id, onRemove, removeLabel }: { title: string; detail?: string; id: string; onRemove: () => void; removeLabel: string }) { return <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"><div><h4 className="text-sm font-extrabold text-slate-900">{title}</h4>{detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}<span className="mt-2 block font-mono text-[10px] text-slate-400">ID: {id}</span></div><button type="button" onClick={onRemove} className="min-h-11 min-w-11 rounded-lg p-3 text-slate-400 hover:text-rose-600" aria-label={removeLabel}><Trash2 className="h-4 w-4" /></button></div>; }
