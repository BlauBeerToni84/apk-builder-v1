import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type ProviderName = 'grok' | 'claude' | 'qwen' | 'deepseek' | 'gemini' | 'openai';

export interface Settings {
  activeProvider: ProviderName;
  githubToken?: string;
  easToken?: string;
  expoAccountName?: string;
  expoProjectId?: string;
  repoOwner?: string;
  repoNamePrefix?: string;
}

type Ctx = {
  settings: Settings;
  setSettings: (s: Settings) => void;
  save: () => Promise<void>;
};

const SettingsContext = createContext<Ctx | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({ activeProvider: 'grok', repoNamePrefix: 'k1w1-' });

  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync('settings');
      if (raw) setSettings(JSON.parse(raw));
    })();
  }, []);

  const save = async () => {
    await SecureStore.setItemAsync('settings', JSON.stringify(settings));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, save }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings outside provider');
  return ctx;
};

