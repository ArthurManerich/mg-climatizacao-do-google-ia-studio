import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { getWhatsAppLink } from '../utils/whatsapp';
import { useSettings } from './SettingsContext';
import { settingsService } from '../services/settingsService';
import { defaultSimulatorConfig } from '../config/simulator';
import { SimulatorConfig, EstimatedPrice } from '../types';

export interface SimulatorState {
  serviceType: string;
  capacity: string;
  quantity: number;
  propertyType: string;
}

export interface BudgetContextType {
  simulator: SimulatorState;
  setSimulator: React.Dispatch<React.SetStateAction<SimulatorState>>;
  estimation: EstimatedPrice;
  config: SimulatorConfig;
  loadingConfig: boolean;
  configError: string | null;
  reloadConfig: () => Promise<void>;
  handleSendSimulation: () => void;
  getServiceLabel: (id: string) => string;
  getCapacityLabel: (id: string) => string;
  getPropertyLabel: (id: string) => string;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [config, setConfig] = useState<SimulatorConfig>(defaultSimulatorConfig);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const [simulator, setSimulator] = useState<SimulatorState>({
    serviceType: '',
    capacity: '',
    quantity: 1,
    propertyType: '',
  });

  const fetchConfig = useCallback(async () => {
    try {
      setLoadingConfig(true);
      setConfigError(null);
      const data = await settingsService.get<SimulatorConfig>('simulator_config');
      if (data && data.services && data.capacities) {
        setConfig(data);
      } else {
        setConfig(defaultSimulatorConfig);
      }
    } catch (err: any) {
      console.warn("Erro ao carregar configuracoes do simulador:", err);
      setConfigError("Erro ao carregar os dados.");
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const getServiceLabel = useCallback((id: string): string => {
    const found = config.services.find(s => s.id === id);
    return found ? found.label : id;
  }, [config.services]);

  const getCapacityLabel = useCallback((id: string): string => {
    const found = config.capacities.find(c => c.id === id);
    return found ? found.label : id;
  }, [config.capacities]);

  const getPropertyLabel = useCallback((id: string): string => {
    const found = config.propertyTypes.find(p => p.id === id);
    return found ? found.label : id;
  }, [config.propertyTypes]);

  const estimation = useMemo((): EstimatedPrice => {
    const basePrices = config.basePrices || defaultSimulatorConfig.basePrices;
    const base = basePrices[simulator.serviceType]?.[simulator.capacity] || { min: 150, max: 250, time: "2 horas" };
    
    const prop = config.propertyTypes.find(p => p.id === simulator.propertyType);
    const multiplier = prop ? prop.multiplier : 1.0;
    
    const qty = Math.max(1, simulator.quantity);
    const qtyDiscount = qty >= 3 ? 0.9 : qty >= 2 ? 0.95 : 1.0;

    return {
      min: Math.round(base.min * multiplier * qty * qtyDiscount),
      max: Math.round(base.max * multiplier * qty * qtyDiscount),
      time: base.time || "2 a 3 horas",
    };
  }, [config, simulator.serviceType, simulator.capacity, simulator.propertyType, simulator.quantity]);

  const handleSendSimulation = useCallback(() => {
    const serviceName = getServiceLabel(simulator.serviceType) || 'Instalação';
    const capacityName = getCapacityLabel(simulator.capacity) || '12.000 BTUs';
    const propertyName = getPropertyLabel(simulator.propertyType) || 'Residencial';

    const message =
      `Olá ${settings.company_name}!\n\n` +
      `Fiz uma simulação de orçamento no seu site:\n` +
      `• Serviço: ${serviceName}\n` +
      `• Capacidade: ${capacityName}\n` +
      `• Quantidade: ${simulator.quantity} aparelho(s)\n` +
      `• Tipo de Imóvel: ${propertyName}\n` +
      `• Valor Estimado no Site: R$ ${estimation.min} a R$ ${estimation.max}\n\n` +
      `Gostaria de agendar ou confirmar este orçamento!\n` +
      `Meu nome é: \n` +
      `Bairro/Cidade: `;

    window.open(getWhatsAppLink(message, settings.whatsapp_number), 'whatsapp', 'noopener,noreferrer');
  }, [getServiceLabel, getCapacityLabel, getPropertyLabel, simulator, estimation, settings]);

  const contextValue = useMemo(() => ({
    simulator,
    setSimulator,
    estimation,
    config,
    loadingConfig,
    configError,
    reloadConfig: fetchConfig,
    handleSendSimulation,
    getServiceLabel,
    getCapacityLabel,
    getPropertyLabel
  }), [
    simulator,
    setSimulator,
    estimation,
    config,
    loadingConfig,
    configError,
    fetchConfig,
    handleSendSimulation,
    getServiceLabel,
    getCapacityLabel,
    getPropertyLabel
  ]);

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
