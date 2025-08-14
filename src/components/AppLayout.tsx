
import React from 'react';
import { Capacitor } from '@capacitor/core';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className = '' }) => {
  const isNativeApp = Capacitor.isNativePlatform();
  const isMobile = useIsMobile();
  
  // Use mobile design for both native apps and mobile browsers
  const useMobileLayout = isNativeApp || isMobile;

  return (
    <div className={`min-h-screen font-sans ${useMobileLayout ? 'pb-20' : ''} ${className}`}>
      <Header />
      <main className={`${isNativeApp ? 'pt-safe-area-top' : ''}`}>
        {children}
      </main>
      {useMobileLayout && <BottomNavigation />}
      {!useMobileLayout && <Footer />}
    </div>
  );
};

export default AppLayout;
