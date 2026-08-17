import React, { useState } from 'react';
import { 
  Wind, 
  Wrench, 
  Sparkles, 
  Gauge, 
  Check, 
  Clock, 
  Phone, 
  Minus, 
  Plus, 
  Home, 
  Building2, 
  Building, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Unplug,
  Store,
  RefreshCw
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { motion } from 'motion/react';

export default function BudgetSimulator() {
  const {
    simulator,
    setSimulator,
    estimation,
    config,
    loadingConfig,
    configError,
    reloadConfig,
    handleSendSimulation,
    getServiceLabel,
    getCapacityLabel,
    getPropertyLabel
  } = useBudget();

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { number: 1, label: 'Serviço' },
    { number: 2, label: 'BTUs' },
    { number: 3, label: 'Quantidade' },
    { number: 4, label: 'Imóvel' },
    { number: 5, label: 'Resumo' },
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Wind,
      ShieldCheck,
      Wrench,
      Sparkles,
      Gauge,
      Unplug,
      Home,
      Building,
      Building2,
      Store
    };
    return iconMap[iconName] || Wind;
  };

  const handleServiceSelect = (id: string) => {
    setSimulator(prev => ({ ...prev, serviceType: id }));
    setError(null);
  };

  const handleBtuSelect = (id: string) => {
    setSimulator(prev => ({ ...prev, capacity: id }));
    setError(null);
  };

  const adjustQuantity = (delta: number) => {
    setSimulator(prev => ({
      ...prev,
      quantity: Math.max(1, Math.min(10, prev.quantity + delta)),
    }));
  };

  const handlePropertySelect = (id: string) => {
    setSimulator(prev => ({ ...prev, propertyType: id }));
    setError(null);
  };

  const isStepCompleted = (currentStep: number): boolean => {
    if (currentStep === 1) return Boolean(simulator.serviceType);
    if (currentStep === 2) return Boolean(simulator.capacity);
    if (currentStep === 3) return simulator.quantity >= 1;
    if (currentStep === 4) return Boolean(simulator.propertyType);
    return true;
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!simulator.serviceType) {
        setError("Por favor, selecione um tipo de serviço para continuar.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!simulator.capacity) {
        setError("Por favor, selecione a capacidade em BTUs adequada.");
        return false;
      }
    } else if (currentStep === 4) {
      if (!simulator.propertyType) {
        setError("Por favor, selecione o tipo de imóvel para o atendimento.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(5, prev + 1));
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleRestart = () => {
    setSimulator({
      serviceType: '',
      capacity: '',
      quantity: 1,
      propertyType: '',
    });
    setError(null);
    setStep(1);
  };

  const services = config?.services || [];
  const btuOptions = config?.capacities || [];
  const properties = (config?.propertyTypes || []).map(p => {
    let icon = Home;
    let desc = 'Atendimento em residências.';
    if (p.id === 'casa') {
      icon = Home;
      desc = 'Instalação e serviços padrão em residências térreas ou sobrados.';
    } else if (p.id === 'apartamento') {
      icon = Building;
      desc = 'Adequado para normas de condomínios, sacadas e furação especial.';
    } else if (p.id === 'empresa') {
      icon = Building2;
      desc = 'Serviços corporativos para escritórios, indústrias e prédios comerciais.';
    } else if (p.id === 'comercio') {
      icon = Store;
      desc = 'Lojas, restaurantes e estabelecimentos comerciais.';
    }
    return {
      id: p.id,
      label: p.label,
      icon,
      desc
    };
  });


  return (
    <section id="orcamento-online" className="py-12 sm:py-16 md:py-20 bg-slate-50/80 border-t border-[#E2E8F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 px-3 py-1.5 rounded-full">
            Simulador de Climatização
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002E5C] font-display mt-3 sm:mt-4 mb-2">
            Simule seu Orçamento na Hora
          </h2>
          <p className="text-[#475569] text-xs sm:text-base leading-relaxed">
            Selecione as especificações abaixo e descubra uma estimativa de preço instantânea para o seu projeto.
          </p>
        </div>

        {/* Stepper Indicator - Desktop */}
        <div className="hidden sm:flex justify-between items-center mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-[#0096D6] -translate-y-1/2 z-0 transition-all duration-300 rounded-full"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center z-10">
              <button
                onClick={() => {
                  if (s.number < step) {
                    setStep(s.number);
                    setError(null);
                  }
                }}
                disabled={s.number >= step}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === s.number
                    ? 'bg-[#002E5C] text-white shadow-lg ring-4 ring-[#E6F5FC]'
                    : step > s.number
                    ? 'bg-[#0096D6] text-white cursor-pointer hover:bg-[#0082BA]'
                    : 'bg-white border-2 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {step > s.number ? <Check className="w-5 h-5 stroke-[3]" /> : s.number}
              </button>
              <span className={`text-xs font-bold mt-2 ${step === s.number ? 'text-[#002E5C]' : 'text-[#475569]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Stepper Indicator - Mobile */}
        <div className="sm:hidden mb-6 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Passo {step} de 5
            </span>
            <span className="text-sm font-extrabold text-[#0096D6]">
              {steps[step - 1].label}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-[#0096D6] transition-all duration-300 rounded-full"
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
          {/* Mobile step quick nav */}
          <div className="flex justify-between gap-1 pt-1 border-t border-slate-100">
            {steps.map((s) => (
              <button
                key={s.number}
                onClick={() => {
                  if (s.number < step) {
                    setStep(s.number);
                    setError(null);
                  }
                }}
                disabled={s.number >= step}
                className={`flex-1 py-1 px-0.5 rounded text-[11px] font-bold text-center transition-colors ${
                  step === s.number
                    ? 'bg-[#E6F5FC] text-[#002E5C]'
                    : step > s.number
                    ? 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                    : 'text-slate-300'
                }`}
              >
                {s.number}. {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wizard Main Card */}
        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-sm relative min-h-[350px] flex flex-col justify-between">
          
          {/* Step Header */}
          {step < 5 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-xl font-extrabold text-[#002E5C] font-display">
                {step === 1 && "1. Qual serviço você precisa?"}
                {step === 2 && "2. Qual a capacidade do aparelho em BTUs?"}
                {step === 3 && "3. Quantos aparelhos receberão o serviço?"}
                {step === 4 && "4. Qual o tipo de imóvel?"}
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] mt-1 mb-3 sm:mb-4">
                {step === 1 && "Selecione a opção desejada para o atendimento. O formulário não avançará sozinho."}
                {step === 2 && "Caso não saiba a potência exata, selecione a opção aproximada mais próxima."}
                {step === 3 && "Você pode simular de 1 a 10 aparelhos simultâneos com descontos."}
                {step === 4 && "A estrutura do imóvel pode influenciar o tempo e complexidade."}
              </p>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>
          )}

          {/* Animated step wrapper */}
          <div className="flex-1">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* STEP 1: Tipo de serviço */}
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {services.map((item) => {
                    const IconComp = typeof item.icon === 'string' ? getIconComponent(item.icon) : (item.icon || Wind);
                    const isSelected = simulator.serviceType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleServiceSelect(item.id)}
                        className={`p-3.5 sm:p-5 min-h-[52px] rounded-2xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
                          isSelected
                            ? 'border-[#0096D6] bg-[#E6F5FC]/60 text-[#002E5C] shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={`p-2.5 sm:p-3 rounded-xl ${
                            isSelected ? 'bg-[#002E5C] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          } transition-colors flex-shrink-0`}>
                            <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="pr-6 min-w-0">
                            <h4 className="font-bold text-sm sm:text-base text-[#002E5C]">{item.label}</h4>
                            <p className="text-xs text-[#475569] mt-0.5 sm:mt-1 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-[#0096D6] rounded-full flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 2: BTUs */}
              {step === 2 && (
                <div className="space-y-2.5 sm:space-y-3">
                  {btuOptions.map((item) => {
                    const isSelected = simulator.capacity === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleBtuSelect(item.id)}
                        className={`w-full p-3.5 sm:p-4.5 min-h-[52px] rounded-2xl border-2 text-left flex justify-between items-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0096D6] bg-[#E6F5FC]/60 text-[#002E5C] shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="pr-3">
                          <span className="font-bold text-sm sm:text-base text-[#002E5C] block">{item.label}</span>
                          <span className="text-[11px] sm:text-xs text-[#475569] mt-0.5 block">{item.desc}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          isSelected ? 'border-[#0096D6] bg-[#0096D6] text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 3: Quantidade */}
              {step === 3 && (
                <div className="flex flex-col items-center justify-center py-6 sm:py-10 bg-slate-50/50 rounded-2xl border border-[#E2E8F0]">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-4">
                    Selecione a quantidade
                  </span>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade de aparelhos"
                      onClick={() => adjustQuantity(-1)}
                      disabled={simulator.quantity <= 1}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6] ${
                        simulator.quantity <= 1
                          ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-[#0096D6] hover:text-[#0096D6] hover:bg-[#E6F5FC]'
                      }`}
                    >
                      <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <span className="text-4xl sm:text-5xl font-black font-display text-[#002E5C] w-16 sm:w-20 text-center select-none">
                      {simulator.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar quantidade de aparelhos"
                      onClick={() => adjustQuantity(1)}
                      disabled={simulator.quantity >= 10}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0096D6] ${
                        simulator.quantity >= 10
                          ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-[#0096D6] hover:text-[#0096D6] hover:bg-[#E6F5FC]'
                      }`}
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <p className="text-xs text-[#475569] mt-4 font-medium text-center px-2">
                    Descontos progressivos são aplicados para 2 ou mais aparelhos!
                  </p>
                </div>
              )}

              {/* STEP 4: Tipo de imóvel */}
              {step === 4 && (
                <div className="space-y-2.5 sm:space-y-3">
                  {properties.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = simulator.propertyType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handlePropertySelect(item.id)}
                        className={`w-full p-3.5 sm:p-5 min-h-[52px] rounded-2xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
                          isSelected
                            ? 'border-[#0096D6] bg-[#E6F5FC]/60 text-[#002E5C] shadow-md'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={`p-2.5 sm:p-3 rounded-xl ${
                            isSelected ? 'bg-[#002E5C] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          } transition-colors flex-shrink-0`}>
                            <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="pr-6 min-w-0">
                            <h4 className="font-bold text-sm sm:text-base text-[#002E5C]">{item.label}</h4>
                            <p className="text-xs text-[#475569] mt-0.5 sm:mt-1 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-[#0096D6] rounded-full flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 5: Resumo */}
              {step === 5 && (
                <div className="grid md:grid-cols-12 gap-5 sm:gap-8">
                  {/* Left Column: Details & Price */}
                  <div className="md:col-span-7 space-y-4 sm:space-y-5">
                    <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-[#E2E8F0]">
                      <h4 className="text-xs font-bold text-[#002E5C] uppercase tracking-widest mb-3 sm:mb-4 border-b border-slate-200 pb-2">
                        Resumo do Pedido
                      </h4>
                      
                      <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[#475569] font-medium">Serviço:</span>
                          <span className="font-extrabold text-[#002E5C] text-right">
                            {getServiceLabel(simulator.serviceType)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[#475569] font-medium">Capacidade:</span>
                          <span className="font-extrabold text-[#002E5C] text-right">
                            {getCapacityLabel(simulator.capacity)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[#475569] font-medium">Quantidade:</span>
                          <span className="font-extrabold text-[#002E5C] text-right">
                            {simulator.quantity} aparelho(s)
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[#475569] font-medium">Tipo de Imóvel:</span>
                          <span className="font-extrabold text-[#002E5C] text-right">
                            {getPropertyLabel(simulator.propertyType)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#E6F5FC] p-4 sm:p-6 rounded-2xl border border-[#0096D6]/30">
                      <span className="text-[10px] font-bold text-[#0096D6] uppercase tracking-widest block mb-1">
                        Valor Estimado Total
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-4xl font-black text-[#002E5C] font-display tracking-tight">
                          R$ {estimation.min} <span className="text-sm sm:text-base text-[#475569] font-semibold uppercase">a</span> R$ {estimation.max}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 sm:mt-3 text-xs text-[#002E5C] font-semibold">
                        <Clock className="w-4 h-4 text-[#0096D6] flex-shrink-0" />
                        <span>Tempo estimado de serviço: ~{estimation.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: CTA & Benefits */}
                  <div className="md:col-span-5 flex flex-col justify-between">
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-xs font-bold text-[#002E5C] uppercase tracking-widest">
                        Próximo Passo
                      </h4>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        Seu orçamento simulado está pronto! Clique no botão abaixo para nos enviar os detalhes diretamente no WhatsApp para agendarmos o seu atendimento.
                      </p>

                      <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-[#002E5C] font-semibold">
                          <Check className="w-4 h-4 text-[#0096D6] stroke-[3] flex-shrink-0" />
                          <span>Orçamento rápido e sem custo</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#002E5C] font-semibold">
                          <Check className="w-4 h-4 text-[#0096D6] stroke-[3] flex-shrink-0" />
                          <span>Garantia de 90 dias no serviço</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#002E5C] font-semibold">
                          <Check className="w-4 h-4 text-[#0096D6] stroke-[3] flex-shrink-0" />
                          <span>Técnicos limpos e uniformizados</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 space-y-2.5">
                      <button
                        type="button"
                        onClick={handleSendSimulation}
                        className="w-full bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white font-extrabold py-3.5 sm:py-4.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
                      >
                        <Phone className="w-4.5 h-4.5 fill-current flex-shrink-0" />
                        <span>CHAMAR NO WHATSAPP</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRestart}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-[#002E5C] font-bold py-3 sm:py-3.5 rounded-2xl text-xs transition-colors cursor-pointer min-h-[44px]"
                      >
                        Iniciar Nova Simulação
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Card Footer Navigation for steps */}
          <div className="flex justify-between items-center gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="bg-slate-100 hover:bg-slate-200 text-[#002E5C] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[48px] sm:min-h-[50px] px-4 sm:px-6 rounded-2xl border border-slate-200"
              >
                <ChevronLeft className="w-5 h-5" /> <span>Voltar</span>
              </button>
            ) : (
              <div />
            )}
            
            {step < 5 ? (
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepCompleted(step)}
                  className={`font-extrabold px-6 sm:px-8 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[50px] ${
                    !isStepCompleted(step)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                      : 'bg-[#0096D6] hover:bg-[#0082BA] active:bg-[#002E5C] text-white cursor-pointer shadow-[#0096D6]/20'
                  }`}
                >
                  <span>Avançar</span> <ChevronRight className="w-5 h-5" />
                </button>
                {!isStepCompleted(step) && (
                  <span className="text-[10px] text-[#0096D6] font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> Selecione uma opção acima para avançar
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-bold text-[#002E5C] bg-[#E6F5FC] px-3 py-1.5 rounded-xl border border-[#0096D6]/30 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#0096D6] stroke-[3]" /> Simulação Concluída
              </span>
            )}
          </div>

        </div>

        {/* Dynamic bottom tip */}
        <div className="mt-6 flex gap-2 items-start justify-center bg-[#FFFBEB] border border-[#F5A524]/30 p-4 rounded-2xl max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-[#F5A524] shrink-0 mt-0.5" />
          <p className="text-xs text-[#002E5C] leading-relaxed">
            <strong className="text-[#F5A524]">⚠️ Importante:</strong> Os valores gerados no simulador são referenciais estimados para serviços em condições normais de acesso. Confirmações de infraestrutura complexa ou tubulações adicionais serão analisadas sob consulta.
          </p>
        </div>

      </div>
    </section>
  );
}
