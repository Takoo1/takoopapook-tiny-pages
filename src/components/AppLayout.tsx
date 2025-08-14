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
    <div className={`min-h-screen font-sans ${useMobileLayout ? 'pb-24' : ''} ${className}`}>
      <Header />
      <main className={`${useMobileLayout ? 'pt-32' : 'pt-16 sm:pt-20'}`}>
        {children}
      </main>
      {!useMobileLayout && <Footer />}
      {useMobileLayout && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;