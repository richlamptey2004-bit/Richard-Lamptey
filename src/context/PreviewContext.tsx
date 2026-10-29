import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServerConfigStatus } from '../types';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface PreviewContextType {
  isPreviewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
  isConfigured: boolean;
  serverStatus: ServerConfigStatus;
  refreshStatus: () => Promise<void>;
  showSetupModal: boolean;
  setShowSetupModal: (open: boolean) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configured = isSupabaseConfigured();
  // By default, if Supabase is not configured, preview mode is active with demo fixtures
  const [isPreviewMode, setPreviewMode] = useState<boolean>(!configured);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<ServerConfigStatus>({
    supabaseConfigured: configured,
    previewMode: !configured,
    databaseConnected: false,
    adminEmailConfigured: false,
    storageConfigured: false,
  });

  const refreshStatus = async () => {
    try {
      const res = await fetch('/api/config-status');
      if (res.ok) {
        const data: ServerConfigStatus = await res.json();
        setServerStatus(data);
        if (!data.supabaseConfigured) {
          setPreviewMode(true);
        }
      }
    } catch {
      // In standalone client preview without server proxy
      setServerStatus({
        supabaseConfigured: configured,
        previewMode: true,
        databaseConnected: false,
        adminEmailConfigured: false,
        storageConfigured: false,
      });
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <PreviewContext.Provider
      value={{
        isPreviewMode,
        setPreviewMode,
        isConfigured: serverStatus.supabaseConfigured || configured,
        serverStatus,
        refreshStatus,
        showSetupModal,
        setShowSetupModal,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = (): PreviewContextType => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};
