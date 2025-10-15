import { useState, useEffect, useCallback } from 'react';

export interface ConnectivityStatus {
  isOnline: boolean;
  lastChecked: Date;
  latency: number | null;
  status: 'online' | 'offline' | 'checking' | 'degraded';
}

export function useInternetConnectivity() {
  const [connectivity, setConnectivity] = useState<ConnectivityStatus>({
    isOnline: navigator.onLine,
    lastChecked: new Date(),
    latency: null,
    status: navigator.onLine ? 'online' : 'offline'
  });

  const checkConnectivity = useCallback(async (): Promise<void> => {
    setConnectivity(prev => ({ ...prev, status: 'checking' }));
    
    try {
      const startTime = performance.now();
      
      // Ping the current domain with a cache-busting parameter
      const response = await fetch('/api/system/status?ping=' + Date.now(), {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      if (response.ok) {
        const status = latency > 1000 ? 'degraded' : 'online';
        setConnectivity({
          isOnline: true,
          lastChecked: new Date(),
          latency,
          status
        });
      } else {
        setConnectivity({
          isOnline: false,
          lastChecked: new Date(),
          latency: null,
          status: 'offline'
        });
      }
    } catch (error) {
      setConnectivity({
        isOnline: false,
        lastChecked: new Date(),
        latency: null,
        status: 'offline'
      });
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);

    // Listen to browser online/offline events
    const handleOnline = () => {
      setConnectivity(prev => ({ 
        ...prev, 
        isOnline: true, 
        status: 'online',
        lastChecked: new Date()
      }));
      checkConnectivity(); // Verify with server
    };

    const handleOffline = () => {
      setConnectivity(prev => ({ 
        ...prev, 
        isOnline: false, 
        status: 'offline',
        lastChecked: new Date()
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkConnectivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkConnectivity]);

  return {
    ...connectivity,
    refresh: checkConnectivity
  };
}