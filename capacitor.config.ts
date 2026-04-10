import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swiftconvert.app',
  appName: 'SwiftConvert',
  webDir: 'out',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      statsUrl: 'https://capgo.app/api/stats/',
    },
  },
};

export default config;
