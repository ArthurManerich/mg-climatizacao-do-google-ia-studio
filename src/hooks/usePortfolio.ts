import { useEffect, useState } from 'react';
import { Photo } from '../types';
import { portfolioService } from '../services/portfolioService';

export function usePortfolio() {
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load photos from unified service
  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await portfolioService.getAll();
      setUserPhotos(data);
    } catch (e: any) {
      console.warn("Erro ao carregar fotos do portfólio:", e);
      setError("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPhotos();
  }, []);

  return {
    userPhotos,
    loading,
    error,
    reloadPhotos: loadPhotos
  };
}
