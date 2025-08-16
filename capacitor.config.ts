import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Takoopaook',
  appName: 'TakooPapook',
  webDir: 'dist',
  server: {
    url: 'https://42d85255-1700-464a-bbcd-919ecf5241eb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;