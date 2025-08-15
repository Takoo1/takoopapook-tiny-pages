
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Use mobile design for both native apps and mobile browsers
  const useMobileLayout = isNativeApp || isMobile;
  
  // Show header only on home page for mobile, always show for desktop
  const showHeader = !useMobileLayout || isHomePage;

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`min-h-screen font-sans ${useMobileLayout ? 'pb-16' : ''} ${className}`}>
      {showHeader && <Header />}
      <main className={`${isNativeApp ? 'pt-safe-area-top' : ''} ${
        useMobileLayout && isHomePage ? 'pt-20' : ''
      }`}>
        {children}
      </main>
      {useMobileLayout && (
        <BottomNavigation 
          isMenuOpen={isMenuOpen} 
          onMenuToggle={handleMenuToggle} 
        />
      )}
      {!useMobileLayout && <Footer />}
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md">
          <div className="flex flex-col p-6 space-y-4 mt-20">
            <h2 className="text-xl font-bold text-center mb-6">Menu</h2>
            {/* Add menu items here */}
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="self-end p-2 bg-primary/10 rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
