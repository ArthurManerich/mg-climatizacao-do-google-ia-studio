import { useState, useEffect } from 'react';
import { adminSettingsService } from '../../../services/adminSettingsService';
import { defaultAdminSimulatorConfig } from '../../../config/adminSimulator';
import { 
  SimulatorConfig, 
  SimulatorServiceOption, 
  SimulatorBtuOption, 
  SimulatorPropertyOption, 
  SimulatorBasePrice 
} from '../../../types';

export function useSimulator() {
  const [config, setConfig] = useState<SimulatorConfig>(defaultAdminSimulatorConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSettingsService.getAdminSimulatorConfig();
      if (data && data.services && data.capacities) {
        setConfig(data);
      } else {
        setConfig(defaultAdminSimulatorConfig);
      }
    } catch (err: any) {
      console.error("Erro ao carregar configuracoes do simulador:", err);
      setError("Erro ao carregar dados do simulador.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const saveConfig = async (newConfig: SimulatorConfig) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await adminSettingsService.set('simulator_config', newConfig);
      setConfig(newConfig);
      setSuccess("Configurações do simulador salvas com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar configuracoes do simulador:", err);
      setError("Erro ao salvar as alterações no banco de dados.");
    } finally {
      setSaving(false);
    }
  };

  // Helper setters
  const updateBasePrice = (serviceId: string, capacityId: string, field: keyof SimulatorBasePrice, value: string | number) => {
    setConfig(prev => {
      const nextPrices = { ...prev.basePrices };
      if (!nextPrices[serviceId]) {
        nextPrices[serviceId] = {};
      }
      const current = nextPrices[serviceId][capacityId] || { min: 0, max: 0, time: '' };
      nextPrices[serviceId][capacityId] = {
        ...current,
        [field]: value
      };
      return { ...prev, basePrices: nextPrices };
    });
  };

  const addService = (service: SimulatorServiceOption) => {
    setConfig(prev => ({
      ...prev,
      services: [...prev.services, service]
    }));
  };

  const removeService = (serviceId: string) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
  };

  const addCapacity = (capacity: SimulatorBtuOption) => {
    setConfig(prev => ({
      ...prev,
      capacities: [...prev.capacities, capacity]
    }));
  };

  const removeCapacity = (capacityId: string) => {
    setConfig(prev => ({
      ...prev,
      capacities: prev.capacities.filter(c => c.id !== capacityId)
    }));
  };

  const addPropertyType = (property: SimulatorPropertyOption) => {
    setConfig(prev => ({
      ...prev,
      propertyTypes: [...prev.propertyTypes, property]
    }));
  };

  const removePropertyType = (propertyId: string) => {
    setConfig(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.filter(p => p.id !== propertyId)
    }));
  };

  const resetToDefault = () => {
    setConfig(defaultAdminSimulatorConfig);
  };

  return {
    config,
    setConfig,
    loading,
    saving,
    error,
    success,
    reloadConfig: loadConfig,
    saveConfig,
    updateBasePrice,
    addService,
    removeService,
    addCapacity,
    removeCapacity,
    addPropertyType,
    removePropertyType,
    resetToDefault
  };
}
