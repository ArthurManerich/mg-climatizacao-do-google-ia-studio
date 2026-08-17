import React, { useState } from 'react';
import { 
  Calculator, 
  Save, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Wind, 
  Gauge, 
  Building2, 
  Home, 
  Layers, 
  Clock, 
  DollarSign 
} from 'lucide-react';
import { useSimulator } from '../Hooks/useSimulator';
import { motion } from 'motion/react';

export function SimulatorManager() {
  const {
    config,
    loading,
    saving,
    error,
    success,
    reloadConfig,
    saveConfig,
    updateBasePrice,
    addService,
    removeService,
    addCapacity,
    removeCapacity,
    addPropertyType,
    removePropertyType,
    resetToDefault
  } = useSimulator();

  const [activeSubTab, setActiveSubTab] = useState<'prices' | 'btus' | 'services' | 'properties'>('prices');

  // Modal / Form state for adding new items
  const [newBtuId, setNewBtuId] = useState('');
  const [newBtuLabel, setNewBtuLabel] = useState('');
  const [newBtuDesc, setNewBtuDesc] = useState('');

  const [newServiceId, setNewServiceId] = useState('');
  const [newServiceLabel, setNewServiceLabel] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('Wind');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const [newPropertyId, setNewPropertyId] = useState('');
  const [newPropertyLabel, setNewPropertyLabel] = useState('');
  const [newPropertyMultiplier, setNewPropertyMultiplier] = useState(1.0);

  const handleAddBtu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBtuId || !newBtuLabel) return;
    addCapacity({
      id: newBtuId.replace(/\D/g, '') || newBtuId,
      label: newBtuLabel,
      desc: newBtuDesc || `Até ${newBtuLabel}`
    });
    setNewBtuId('');
    setNewBtuLabel('');
    setNewBtuDesc('');
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceId || !newServiceLabel) return;
    addService({
      id: newServiceId.toLowerCase().replace(/\s+/g, '-'),
      label: newServiceLabel,
      icon: newServiceIcon,
      description: newServiceDesc
    });
    setNewServiceId('');
    setNewServiceLabel('');
    setNewServiceDesc('');
  };

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropertyId || !newPropertyLabel) return;
    addPropertyType({
      id: newPropertyId.toLowerCase().replace(/\s+/g, '-'),
      label: newPropertyLabel,
      multiplier: Number(newPropertyMultiplier) || 1.0
    });
    setNewPropertyId('');
    setNewPropertyLabel('');
    setNewPropertyMultiplier(1.0);
  };

  if (loading) {
    return (
      <div className="admin-manager bg-white rounded-2xl border border-slate-200/70 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0096D6] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-700">Carregando configurações do simulador...</p>
      </div>
    );
  }

  return (
    <div className="admin-manager space-y-6" id="view-simulator">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#0096D6]" />
            <h2 className="text-xl font-black text-[#002E5C] font-display">Simulador e Tabela de Preços</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie preços base, potências em BTUs, tipos de imóveis e serviços calculados pelo simulador do site.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={reloadConfig}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Recarregar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => saveConfig(config)}
            disabled={saving}
            className="bg-[#0096D6] hover:bg-[#0082BA] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 border border-[#0096D6]"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 stroke-[2.5]" />
            )}
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Error / Success Feedback */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
          <Check className="w-5 h-5 text-emerald-500 shrink-0 stroke-[3]" />
          <span>{success}</span>
        </div>
      )}

      {/* Sub tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('prices')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'prices'
              ? 'bg-[#002E5C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Matriz de Preços & Prazos
        </button>
        <button
          onClick={() => setActiveSubTab('btus')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'btus'
              ? 'bg-[#002E5C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gauge className="w-4 h-4" /> Capacidades (BTUs)
        </button>
        <button
          onClick={() => setActiveSubTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'services'
              ? 'bg-[#002E5C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wind className="w-4 h-4" /> Serviços do Simulador
        </button>
        <button
          onClick={() => setActiveSubTab('properties')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'properties'
              ? 'bg-[#002E5C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" /> Tipos de Imóvel
        </button>
      </div>

      {/* SUBTAB 1: Matriz de Preços */}
      {activeSubTab === 'prices' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Valores Base por Serviço e BTUs</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina a faixa de valor estimado (mínimo e máximo em R$) e o tempo estimado para cada serviço e capacidade.
              </p>
            </div>
            <button
              onClick={resetToDefault}
              className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold cursor-pointer"
            >
              Restaurar Valores Padrão
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">Serviço</th>
                  <th className="p-3">BTUs</th>
                  <th className="p-3 w-32">Mínimo (R$)</th>
                  <th className="p-3 w-32">Máximo (R$)</th>
                  <th className="p-3 w-40">Tempo Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {config.services.map((service) => (
                  <React.Fragment key={service.id}>
                    {config.capacities.map((btu, idx) => {
                      const priceObj = config.basePrices?.[service.id]?.[btu.id] || { min: 150, max: 250, time: "2 horas" };
                      return (
                        <tr key={`${service.id}-${btu.id}`} className="hover:bg-[#E6F5FC]/40 transition-colors">
                          {idx === 0 && (
                            <td 
                              rowSpan={config.capacities.length} 
                              className="p-3 font-extrabold text-slate-900 border-r border-slate-100 bg-slate-50/30 align-top"
                            >
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-[#E6F5FC] text-[#0096D6] rounded-lg">
                                  <Wind className="w-3.5 h-3.5" />
                                </span>
                                <div>
                                  <div>{service.label}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{service.id}</div>
                                </div>
                              </div>
                            </td>
                          )}
                          <td className="p-3 font-bold text-slate-700">
                            {btu.label}
                          </td>
                          <td className="p-2">
                            <input 
                              type="number"
                              value={priceObj.min}
                              onChange={(e) => updateBasePrice(service.id, btu.id, 'min', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0096D6] focus:border-[#0096D6] outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number"
                              value={priceObj.max}
                              onChange={(e) => updateBasePrice(service.id, btu.id, 'max', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0096D6] focus:border-[#0096D6] outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text"
                              value={priceObj.time}
                              onChange={(e) => updateBasePrice(service.id, btu.id, 'time', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#0096D6] focus:border-[#0096D6] outline-none"
                              placeholder="Ex: 2 a 3 horas"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Capacidades (BTUs) */}
      {activeSubTab === 'btus' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Adicionar Nova Potência em BTUs</h3>
            <form onSubmit={handleAddBtu} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código/Valor BTU</label>
                <input
                  type="text"
                  placeholder="Ex: 12000"
                  value={newBtuId}
                  onChange={(e) => setNewBtuId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0096D6] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rótulo de Exibição</label>
                <input
                  type="text"
                  placeholder="Ex: 12.000 BTUs"
                  value={newBtuLabel}
                  onChange={(e) => setNewBtuLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0096D6] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição / Metragem</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Até 20m² (suítes)"
                    value={newBtuDesc}
                    onChange={(e) => setNewBtuDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0096D6] outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#0096D6] hover:bg-[#0082BA] text-white font-black px-4 py-2 rounded-xl text-xs shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer border border-[#0096D6]"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Capacidades Cadastradas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.capacities.map((btu) => (
                <div key={btu.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-start gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-[#002E5C] bg-[#E6F5FC] px-2 py-0.5 rounded-md border border-[#0096D6]/30">
                      {btu.id}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">{btu.label}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{btu.desc}</p>
                  </div>
                  <button
                    onClick={() => removeCapacity(btu.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    title="Remover capacidade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Serviços */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Adicionar Novo Serviço ao Simulador</h3>
            <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ID (Identificador)</label>
                <input
                  type="text"
                  placeholder="Ex: higienizacao"
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0096D6] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: Higienização"
                  value={newServiceLabel}
                  onChange={(e) => setNewServiceLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0096D6] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ícone</label>
                <select
                  value={newServiceIcon}
                  onChange={(e) => setNewServiceIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0096D6] outline-none"
                >
                  <option value="Wind">Wind (Instalação)</option>
                  <option value="ShieldCheck">ShieldCheck (Manutenção Prev.)</option>
                  <option value="Wrench">Wrench (Manutenção Corr.)</option>
                  <option value="Sparkles">Sparkles (Higienização)</option>
                  <option value="Gauge">Gauge (Carga de Gás)</option>
                  <option value="Unplug">Unplug (Desinstalação)</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-[#0096D6] hover:bg-[#0082BA] text-white font-black py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#0096D6]"
                >
                  <Plus className="w-4 h-4" /> Adicionar Serviço
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Serviços Habilitados no Simulador</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.services.map((srv) => (
                <div key={srv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="p-1.5 bg-[#E6F5FC] text-[#0096D6] rounded-lg">
                        <Wind className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{srv.label}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{srv.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-2 block">ID: {srv.id}</span>
                  </div>
                  <button
                    onClick={() => removeService(srv.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    title="Remover serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Tipos de Imóvel */}
      {activeSubTab === 'properties' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Adicionar Tipo de Imóvel</h3>
            <form onSubmit={handleAddProperty} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ID (Ex: casa, empresa)</label>
                <input
                  type="text"
                  placeholder="Ex: sobrados"
                  value={newPropertyId}
                  onChange={(e) => setNewPropertyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0096D6] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Imóvel</label>
                <input
                  type="text"
                  placeholder="Ex: Sobrado / Triplex"
                  value={newPropertyLabel}
                  onChange={(e) => setNewPropertyLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0096D6] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Multiplicador de Preço</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.05"
                    value={newPropertyMultiplier}
                    onChange={(e) => setNewPropertyMultiplier(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0096D6] outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#0096D6] hover:bg-[#0082BA] text-white font-black px-4 py-2 rounded-xl text-xs shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer border border-[#0096D6]"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Tipos de Imóveis Cadastrados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.propertyTypes.map((prop) => (
                <div key={prop.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{prop.label}</h4>
                    <p className="text-xs text-[#0096D6] font-extrabold mt-1">
                      Multiplicador: {prop.multiplier}x
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">ID: {prop.id}</span>
                  </div>
                  <button
                    onClick={() => removePropertyType(prop.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    title="Remover tipo de imóvel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
