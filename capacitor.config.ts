import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kgold.app',
  appName: 'KGold | کی گلد',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#07090E',
    allowMixedContent: false
  },
  plugins: {
    StatusBar: {
      backgroundColor: '#07090E',
      style: 'DARK'
    }
  }
};

export default config;
