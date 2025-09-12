import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2dce9f3596ae47d6b50ad94cc45f7489',
  appName: 'takoopapook-tiny-pages',
  webDir: 'dist',
  server: {
    url: 'https://2dce9f35-96ae-47d6-b50a-d94cc45f7489.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;