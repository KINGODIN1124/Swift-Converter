import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swiftconvert.app',
  appName: 'SwiftConvert',
  webDir: 'out',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      statsUrl: 'https://capgo.app/api/stats/',
    },
  },
  server: {
    androidScheme: 'http',
    hostname: 'localhost'
  }
};

export default config;
