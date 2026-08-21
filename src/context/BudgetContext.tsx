import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useWhatsAppContact } from './WhatsAppContactContext';
import { settingsService } from '../services/settingsService';
import { defaultPublicSimulatorConfig } from '../config/simulator';
import type { PublicSimulatorConfig } from '../types';

export interface SimulatorState {
  serviceType: string;
  capacity: string;
  quantity: number;
  propertyType: string;
  necessity: string;
  city: string;
  serviceAddress: string;
  fullName: string;
}

export interface BudgetContextType {
  simulator: SimulatorState;
  setSimulator: React.Dispatch<React.SetStateAction<SimulatorState>>;
  config: PublicSimulatorConfig;
  loadingConfig: boolean;
  configError: string | null;
  reloadConfig: () => Promise<void>;
  handleSendSimulation: () => void;
  resetSimulator: () => void;
  getServiceLabel: (id: string) => string;
  getCapacityLabel: (id: string) => string;
  getPropertyLabel: (id: string) => string;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const initialSimulatorState: SimulatorState = {
  serviceType: '',
  capacity: '',
  quantity: 1,
  propertyType: '',
  necessity: '',
  city: '',
  serviceAddress: '',
  fullName: '',
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { openWhatsAppSelector } = useWhatsAppContact();
  const [config, setConfig] = useState<PublicSimulatorConfig>(defaultPublicSimulatorConfig);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const [simulator, setSimulator] = useState<SimulatorState>(initialSimulatorState);

  const fetchConfig = useCallback(async () => {
    try {
      setLoadingConfig(true);
      setConfigError(null);
      const data = await settingsService.getPublicSimulatorConfig();
      if (data && data.services && data.capacities) {
        setConfig(data);
      } else {
        setConfig(defaultPublicSimulatorConfig);
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

  const handleSendSimulation = useCallback(() => {
    const serviceName = getServiceLabel(simulator.serviceType);
    const capacityName = simulator.capacity === 'nao-sei'
      ? 'Não sei informar'
      : getCapacityLabel(simulator.capacity);
    const propertyName = getPropertyLabel(simulator.propertyType);

    const message =
      `Olá! Gostaria de solicitar um orçamento.\n\n` +
      `Nome: ${simulator.fullName.trim()}\n` +
      `Cidade: ${simulator.city.trim()}\n` +
      `Endereço do serviço: ${simulator.serviceAddress.trim()}\n` +
      `Serviço: ${serviceName}\n` +
      `Equipamento: ${capacityName}\n` +
      `Quantidade: ${simulator.quantity}\n` +
      `Tipo de imóvel: ${propertyName}\n` +
      `Necessidade: ${simulator.necessity.trim()}\n\n` +
      `Gostaria de conversar sobre o atendimento e o valor do serviço.`;

    openWhatsAppSelector(message);
  }, [getServiceLabel, getCapacityLabel, getPropertyLabel, openWhatsAppSelector, simulator]);

  const resetSimulator = useCallback(() => {
    setSimulator(initialSimulatorState);
  }, []);

  const contextValue = useMemo(() => ({
    simulator,
    setSimulator,
    config,
    loadingConfig,
    configError,
    reloadConfig: fetchConfig,
    handleSendSimulation,
    resetSimulator,
    getServiceLabel,
    getCapacityLabel,
    getPropertyLabel
  }), [
    simulator,
    setSimulator,
    config,
    loadingConfig,
    configError,
    fetchConfig,
    handleSendSimulation,
    resetSimulator,
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
