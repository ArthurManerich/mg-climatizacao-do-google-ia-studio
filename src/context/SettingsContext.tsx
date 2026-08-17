import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { settingsService } from '../services/settingsService';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '../types/settings.types';

export interface SettingsContextType {
  settings: CompanySettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchSettings = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const result = await settingsService.getCompanySettings();
      if (requestId === requestIdRef.current) {
        setSettings(result.settings);
      }
    } catch (loadError) {
      console.error("Erro ao carregar configuracoes globais:", loadError);
      if (requestId === requestIdRef.current) {
        setError('Não foi possível carregar as configurações. Tente novamente.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchSettings]);

  const value = useMemo(() => ({
    settings,
    loading,
    error,
    refreshSettings: fetchSettings
  }), [settings, loading, error, fetchSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
