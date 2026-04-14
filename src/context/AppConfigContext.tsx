import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const CONFIG_KEY = 'app_config';

export interface AppConfig {
  /** Minutos de inactividad antes de mostrar el aviso (0 = desactivado) */
  inactivityTimeoutMinutes: number;
  /** Segundos de aviso antes del logout automático */
  warningTimeoutSeconds: number;
  /** Tamaño máximo de portada en MB */
  maxCoverSizeMB: number;
  /** Tamaño máximo de PDF en MB */
  maxPdfSizeMB: number;
  /** Permitir que nuevos usuarios se registren desde la app */
  allowPublicRegistration: boolean;
  /** Intervalo de sincronización del catálogo en segundos (0 = desactivado) */
  catalogPollingSeconds: number;
  /** Mostrar libros "Próximamente" en el catálogo del lector */
  showComingSoonBooks: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  inactivityTimeoutMinutes: 15,
  warningTimeoutSeconds: 60,
  maxCoverSizeMB: 5,
  maxPdfSizeMB: 50,
  allowPublicRegistration: true,
  catalogPollingSeconds: 30,
  showComingSoonBooks: true,
};

interface AppConfigContextValue {
  config: AppConfig;
  isLoading: boolean;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export function AppConfigProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(CONFIG_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<AppConfig>;
          setConfig({ ...DEFAULT_CONFIG, ...saved });
        } catch {
          // corrupt data — use defaults
        }
      }
      setIsLoading(false);
    });
  }, []);

  const updateConfig = useCallback(async (partial: Partial<AppConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      SecureStore.setItemAsync(CONFIG_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetConfig = useCallback(async () => {
    await SecureStore.setItemAsync(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
    setConfig(DEFAULT_CONFIG);
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, isLoading, updateConfig, resetConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig(): AppConfigContextValue {
  const ctx = useContext(AppConfigContext);
  if (!ctx) throw new Error('useAppConfig must be used inside AppConfigProvider');
  return ctx;
}
