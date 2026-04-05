'use client';
import { useState, useEffect } from 'react';

export function usePlatform() {
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCapacitor = !!window.Capacitor || (window.navigator.userAgent.includes('Capacitor'));
      setPlatform(isCapacitor ? 'native' : 'web');
    }
  }, []);

  return {
    isNative: platform === 'native',
    isWeb: platform === 'web'
  };
}
