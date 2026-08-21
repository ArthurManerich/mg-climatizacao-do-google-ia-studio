import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Fan,
  Gauge,
  Home,
  Minus,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Unplug,
  Wind,
  Wrench,
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';

const steps = [
  { number: 1, label: 'Serviço' },
  { number: 2, label: 'Equipamento' },
  { number: 3, label: 'Local' },
  { number: 4, label: 'Identificação' },
  { number: 5, label: 'Resumo' },
];

export default function BudgetSimulator() {
  const {
    simulator,
    setSimulator,
    config,
    loadingConfig,
    configError,
    reloadConfig,
    handleSendSimulation,
    resetSimulator,
    getServiceLabel,
    getCapacityLabel,
    getPropertyLabel,
  } = useBudget();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Wind,
      ShieldCheck,
      Wrench,
      Sparkles,
      Gauge,
      Unplug,
      Home,
      Building,
      Building2,
      Store,
      Fan,
    };
    return iconMap[iconName as keyof typeof iconMap] || Wind;
  };

  const updateField = <K extends keyof typeof simulator>(field: K, value: (typeof simulator)[K]) => {
    setSimulator((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1 && !simulator.serviceType) {
      return 'Selecione o serviço desejado.';
    }
    if (currentStep === 2 && !simulator.capacity) {
      return 'Informe a capacidade do equipamento ou selecione “Não sei informar”.';
    }
    if (currentStep === 2 && !simulator.necessity.trim()) {
      return 'Descreva brevemente o problema ou a necessidade.';
    }
    if (currentStep === 3 && !simulator.propertyType) {
      return 'Selecione o tipo de imóvel.';
    }
    if (currentStep === 3 && !simulator.city.trim()) {
      return 'Informe a cidade do atendimento.';
    }
    if (currentStep === 3 && !simulator.serviceAddress.trim()) {
      return 'Informe o endereço onde o serviço será realizado.';
    }
    if (currentStep === 4 && !simulator.fullName.trim()) {
      return 'Informe seu nome completo.';
    }
    return null;
  };

  const handleNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((current) => Math.min(5, current + 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((current) => Math.max(1, current - 1));
  };

  const editStep = (targetStep: number) => {
    setError(null);
    setStep(targetStep);
  };

  const handleRestart = () => {
    resetSimulator();
    setError(null);
    setStep(1);
  };

  const equipmentLabel = simulator.capacity === 'nao-sei'
    ? 'Não sei informar'
    : getCapacityLabel(simulator.capacity);

  return (
    <section id="orcamento-online" className="border-t border-line bg-surface-subtle py-section sm:py-section-lg">
      <div className="mx-auto max-w-5xl px-gutter sm:px-gutter-lg lg:px-8">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <p className="text-sm font-semibold text-brand-cyan-700">Solicitação de orçamento</p>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-brand-navy-800 sm:text-4xl">
            Conte o que você precisa.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            Organize as informações do atendimento e envie sua solicitação para conversarmos pelo WhatsApp.
          </p>
        </div>

        {configError && (
          <div role="alert" className="mb-5 flex flex-col gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-amber-900">Não foi possível atualizar as opções da solicitação.</p>
            <button
              type="button"
              onClick={() => void reloadConfig()}
              disabled={loadingConfig}
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-control px-2 text-sm font-bold text-brand-navy-800 disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {loadingConfig ? 'Tentando novamente...' : 'Tentar novamente'}
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-feature border border-line bg-surface shadow-card">
          <div className="border-b border-line bg-brand-navy-950 px-4 py-4 text-white sm:px-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-300">Passo {step} de {steps.length}</span>
              <span className="text-sm font-bold text-brand-cyan-400">{steps[step - 1].label}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div
                className="h-full rounded-full bg-brand-cyan-400 transition-[width]"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>
            <ol className="mt-4 hidden grid-cols-5 gap-3 text-xs sm:grid" aria-label="Etapas da solicitação">
              {steps.map((item) => (
                <li key={item.number} className={step >= item.number ? 'text-white' : 'text-slate-500'}>
                  <span className="font-bold">{item.number}.</span> {item.label}
                </li>
              ))}
            </ol>
          </div>

          <div className="p-4 sm:p-7 lg:p-9">
            {error && (
              <div
                role="alert"
                className="simulator-alert-reveal mb-5 flex items-start gap-2 rounded-control border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            <div key={step} className="simulator-step-reveal">
              {step === 1 && (
                <fieldset>
                  <legend className="font-display text-xl font-bold text-brand-navy-800 sm:text-2xl">Qual serviço você precisa?</legend>
                  <p className="mt-2 text-sm text-ink-muted">Escolha a opção mais próxima da sua necessidade.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {config.services.map((item) => {
                      const Icon = getIconComponent(item.icon);
                      const selected = simulator.serviceType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => updateField('serviceType', item.id)}
                          className={`flex min-h-14 items-center gap-3 rounded-control border px-4 py-3 text-left text-sm font-bold transition-colors ${
                            selected
                              ? 'border-brand-cyan-600 bg-brand-cyan-50 text-brand-navy-800'
                              : 'border-line text-ink-muted hover:border-brand-cyan-600/50 hover:text-brand-navy-800'
                          }`}
                        >
                          <Icon className={`h-5 w-5 shrink-0 ${selected ? 'text-brand-cyan-700' : 'text-slate-400'}`} aria-hidden="true" />
                          <span>{item.label}</span>
                          {selected && <Check className="ml-auto h-4 w-4 text-brand-cyan-700" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-brand-navy-800 sm:text-2xl">Equipamento e necessidade</h3>
                  <p className="mt-2 text-sm text-ink-muted">Informe apenas o que souber sobre o equipamento.</p>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="equipment-capacity" className="text-sm font-bold text-brand-navy-800">Tipo ou capacidade do equipamento</label>
                      <select
                        id="equipment-capacity"
                        value={simulator.capacity}
                        onChange={(event) => updateField('capacity', event.target.value)}
                        className="mt-2 min-h-12 w-full rounded-control border border-line bg-surface px-3 text-base text-ink-muted"
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="nao-sei">Não sei informar</option>
                        {config.capacities.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <span className="text-sm font-bold text-brand-navy-800">Quantidade de equipamentos</span>
                      <div className="mt-2 flex min-h-12 items-center rounded-control border border-line bg-surface">
                        <button
                          type="button"
                          aria-label="Diminuir quantidade de equipamentos"
                          onClick={() => updateField('quantity', Math.max(1, simulator.quantity - 1))}
                          disabled={simulator.quantity <= 1}
                          className="flex min-h-12 min-w-12 items-center justify-center text-brand-navy-800 disabled:text-slate-300"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <output className="flex-1 text-center font-display text-xl font-bold text-brand-navy-800" aria-label={`${simulator.quantity} equipamentos`}>
                          {simulator.quantity}
                        </output>
                        <button
                          type="button"
                          aria-label="Aumentar quantidade de equipamentos"
                          onClick={() => updateField('quantity', Math.min(10, simulator.quantity + 1))}
                          disabled={simulator.quantity >= 10}
                          className="flex min-h-12 min-w-12 items-center justify-center text-brand-navy-800 disabled:text-slate-300"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="service-necessity" className="text-sm font-bold text-brand-navy-800">Problema ou necessidade</label>
                      <textarea
                        id="service-necessity"
                        value={simulator.necessity}
                        onChange={(event) => updateField('necessity', event.target.value)}
                        rows={4}
                        maxLength={500}
                        placeholder="Ex.: aparelho não está resfriando ou preciso instalar um equipamento."
                        className="mt-2 w-full resize-y rounded-control border border-line bg-surface px-3 py-3 text-base text-ink-muted placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-brand-navy-800 sm:text-2xl">Onde será o atendimento?</h3>
                  <p className="mt-2 text-sm text-ink-muted">Esses dados serão usados somente na mensagem enviada ao WhatsApp.</p>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="property-type" className="text-sm font-bold text-brand-navy-800">Tipo de imóvel</label>
                      <select
                        id="property-type"
                        value={simulator.propertyType}
                        onChange={(event) => updateField('propertyType', event.target.value)}
                        className="mt-2 min-h-12 w-full rounded-control border border-line bg-surface px-3 text-base text-ink-muted"
                      >
                        <option value="">Selecione uma opção</option>
                        {config.propertyTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="service-city" className="text-sm font-bold text-brand-navy-800">Cidade</label>
                      <input
                        id="service-city"
                        type="text"
                        autoComplete="address-level2"
                        enterKeyHint="next"
                        value={simulator.city}
                        onChange={(event) => updateField('city', event.target.value)}
                        placeholder="Ex.: Blumenau"
                        className="mt-2 min-h-12 w-full rounded-control border border-line px-3 text-base text-ink-muted placeholder:text-slate-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="service-address" className="text-sm font-bold text-brand-navy-800">Endereço do serviço</label>
                      <input
                        id="service-address"
                        type="text"
                        autoComplete="street-address"
                        enterKeyHint="next"
                        value={simulator.serviceAddress}
                        onChange={(event) => updateField('serviceAddress', event.target.value)}
                        placeholder="Rua, número e complemento, se houver"
                        className="mt-2 min-h-12 w-full rounded-control border border-line px-3 text-base text-ink-muted placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="max-w-xl">
                  <h3 className="font-display text-xl font-bold text-brand-navy-800 sm:text-2xl">Como podemos identificar você?</h3>
                  <p className="mt-2 text-sm text-ink-muted">Informe somente seu nome para compor a solicitação.</p>
                  <div className="mt-5">
                    <label htmlFor="customer-name" className="text-sm font-bold text-brand-navy-800">Nome completo</label>
                    <input
                      id="customer-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      enterKeyHint="done"
                      value={simulator.fullName}
                      onChange={(event) => updateField('fullName', event.target.value)}
                      placeholder="Digite seu nome completo"
                      className="mt-2 min-h-12 w-full rounded-control border border-line px-3 text-base text-ink-muted placeholder:text-slate-400"
                    />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                    Nome, cidade e endereço permanecem apenas nesta solicitação e não são salvos pelo site.
                  </p>
                </div>
              )}

              {step === 5 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-brand-navy-800 sm:text-2xl">Revise sua solicitação</h3>
                  <p className="mt-2 text-sm text-ink-muted">Você pode editar qualquer grupo antes de abrir o WhatsApp.</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <SummaryGroup title="Serviço" onEdit={() => editStep(1)}>
                      <SummaryLine label="Serviço" value={getServiceLabel(simulator.serviceType)} />
                    </SummaryGroup>
                    <SummaryGroup title="Equipamento" onEdit={() => editStep(2)}>
                      <SummaryLine label="Equipamento" value={equipmentLabel} />
                      <SummaryLine label="Quantidade" value={String(simulator.quantity)} />
                      <SummaryLine label="Necessidade" value={simulator.necessity} />
                    </SummaryGroup>
                    <SummaryGroup title="Local" onEdit={() => editStep(3)}>
                      <SummaryLine label="Imóvel" value={getPropertyLabel(simulator.propertyType)} />
                      <SummaryLine label="Cidade" value={simulator.city} />
                      <SummaryLine label="Endereço" value={simulator.serviceAddress} />
                    </SummaryGroup>
                    <SummaryGroup title="Identificação" onEdit={() => editStep(4)}>
                      <SummaryLine label="Nome" value={simulator.fullName} />
                    </SummaryGroup>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <button
                      type="button"
                      onClick={handleSendSimulation}
                      className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-control bg-brand-orange-500 px-6 text-base font-bold text-brand-navy-950 transition-colors hover:bg-brand-orange-600"
                    >
                      <Send className="h-5 w-5" aria-hidden="true" />
                      Enviar pelo WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="inline-flex min-h-12 items-center justify-center rounded-control border border-line px-5 text-sm font-bold text-brand-navy-800 transition-colors hover:bg-surface-subtle"
                    >
                      Nova solicitação
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
              {step > 1 && step < 5 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex min-h-12 items-center gap-1 rounded-control px-3 text-sm font-bold text-brand-navy-800 transition-colors hover:bg-surface-subtle"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Voltar
                </button>
              ) : <span />}
              {step < 5 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex min-h-12 items-center gap-1 rounded-control bg-brand-cyan-600 px-5 text-sm font-bold text-white transition-colors hover:bg-brand-cyan-700"
                >
                  Continuar
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryGroup({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface-subtle p-4">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-3">
        <h4 className="font-display text-base font-bold text-brand-navy-800">{title}</h4>
        <button type="button" onClick={onEdit} className="min-h-11 rounded-control px-2 text-sm font-bold text-brand-cyan-700 hover:text-brand-navy-800">
          Editar
        </button>
      </div>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-sm sm:grid-cols-[7rem_1fr] sm:gap-3">
      <dt className="font-medium text-ink-muted">{label}</dt>
      <dd className="break-words font-semibold text-brand-navy-800">{value}</dd>
    </div>
  );
}
