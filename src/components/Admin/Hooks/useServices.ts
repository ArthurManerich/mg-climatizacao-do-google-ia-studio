import { useState } from 'react';
import { servicesService } from '../../../services/servicesService';
import { Service } from '../../../types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesService.getAll();
      setServices(data);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    setServices,
    loading,
    loadServices
  };
}
