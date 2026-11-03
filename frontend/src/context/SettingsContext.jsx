import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBaseUrl, setBaseUrl, checkBackendHealth } from '../api/plantApi';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [apiUrl, setApiUrlState] = useState(getBaseUrl());
  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    online: false,
    data: null,
    error: null,
    checking: false
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('plantcare_user_settings');
      return saved ? JSON.parse(saved) : {
        autoSaveHistory: true,
        showTopPredictions: true,
        highConfidenceThreshold: 85,
        enableSound: false
      };
    } catch {
      return {
        autoSaveHistory: true,
        showTopPredictions: true,
        highConfidenceThreshold: 85,
        enableSound: false
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('plantcare_user_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  // Ping backend health
  const verifyBackend = async () => {
    setBackendStatus(prev => ({ ...prev, checking: true }));
    const result = await checkBackendHealth();
    if (result.success) {
      setBackendStatus({
        checked: true,
        online: true,
        data: result.data,
        error: null,
        checking: false
      });
    } else {
      setBackendStatus({
        checked: true,
        online: false,
        data: null,
        error: result.error,
        checking: false
      });
    }
  };

  // Initial check on mount and periodic ping
  useEffect(() => {
    verifyBackend();
    const interval = setInterval(verifyBackend, 30000); // ping every 30s
    return () => clearInterval(interval);
  }, [apiUrl]);

  const updateApiUrl = (newUrl) => {
    setBaseUrl(newUrl);
    setApiUrlState(getBaseUrl());
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{
      apiUrl,
      updateApiUrl,
      backendStatus,
      verifyBackend,
      settings,
      updateSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

