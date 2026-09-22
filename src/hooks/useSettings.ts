import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../lib/db/types';
import { repos } from '../lib/db';

const defaultSettings: Settings = {
  workspaceId: 'default',
  profile: { name: '' },
  defaults: {
    paypalPercent: 5.4,
    paypalFixedUSD: 0.30,
    siiPercent: 15.25,
    fallbackUsdRate: 900,
    currency: 'USD',
  },
  counters: { quote: 0, paymentRequest: 0, reminder: 0 },
  year: new Date().getFullYear(),
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    repos.settings.getDefaultSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const updateProfile = useCallback(async (data: Partial<Settings['profile']>) => {
    const updated = await repos.settings.updateProfile(data);
    setSettings(updated);
  }, []);

  const updateDefaults = useCallback(async (data: Partial<Settings['defaults']>) => {
    const updated = await repos.settings.updateDefaults(data);
    setSettings(updated);
  }, []);

  const resetAll = useCallback(async () => {
    await repos.settings.reset();
    const fresh = await repos.settings.getDefaultSettings();
    setSettings(fresh);
  }, []);

  const exportData = useCallback(() => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelancesk-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings]);

  const importData = useCallback(async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text) as Settings;
    await repos.settings.save(data);
    setSettings(data);
  }, []);

  return {
    settings,
    loading,
    updateProfile,
    updateDefaults,
    resetAll,
    exportData,
    importData,
  };
}
