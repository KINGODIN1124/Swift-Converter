'use client';
import { useEffect } from 'react';

export default function CapacitorProvider({ children }) {
  useEffect(() => {
    // Signal to Capacitor that the app has loaded successfully
    // This supports the 'Auto-Rollback' feature if an update is broken
    const notifyReady = async () => {
      try {
        const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
        await CapacitorUpdater.notifyAppReady();
        console.log("App ready signal sent to Capacitor.");
      } catch (e) {
        // Not running in a Capacitor environment
      }
    };
    
    if (typeof window !== 'undefined') {
      notifyReady();
    }
  }, []);

  return <>{children}</>;
}
