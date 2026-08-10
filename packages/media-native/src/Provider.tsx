import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { MediaClient, MediaClientConfig, MediaEventEmitter } from 'media-core';

export interface MediaContextValue {
  client: MediaClient | null;
  events: MediaEventEmitter | null;
}

const MediaContext = createContext<MediaContextValue>({ client: null, events: null });

export interface MediaProviderProps {
  config: MediaClientConfig;
  children: React.ReactNode;
}

export function MediaProvider({ config, children }: MediaProviderProps) {
  const [client, setClient] = useState<MediaClient | null>(null);

  useEffect(() => {
    // Initialize the client when config changes
    const newClient = new MediaClient(config);
    setClient(newClient);
  }, [config.apiKey]);

  const value = useMemo(() => ({
    client,
    events: client ? client.events : null
  }), [client]);

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaContext() {
  const context = useContext(MediaContext);
  if (!context.client) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }
  return context as { client: MediaClient; events: MediaEventEmitter };
}
