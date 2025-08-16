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
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className = ''
}) => {
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
  return <div className={`min-h-screen font-sans ${useMobileLayout ? 'pb-16' : ''} ${className}`}>
      {showHeader && <Header />}
      <main className={`${isNativeApp ? 'pt-safe-area-top' : ''} ${useMobileLayout && isHomePage && !className?.includes('hero-no-gap') ? 'pt-20' : ''} ${className?.includes('hero-no-gap') && useMobileLayout && isHomePage ? 'pt-14' : ''}`}>
        {children}
      </main>
      {useMobileLayout && <BottomNavigation isMenuOpen={isMenuOpen} onMenuToggle={handleMenuToggle} />}
      {!useMobileLayout && <Footer />}
      
      {/* Mobile Menu Overlay - Compact Bottom Menu */}
      {isMenuOpen && <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border shadow-2xl rounded-t-3xl p-4 pb-20" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-primary">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Menu Grid - Three Rows */}
            <div className="grid grid-cols-2 gap-2">
              {/* First Row */}
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl hover:from-primary/20 hover:to-primary/10 transition-all duration-200 active:scale-95">
                <svg className="h-5 w-5 mb-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs font-medium">Home</span>
              </a>
              
              <a href="/packages" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl hover:from-primary/20 hover:to-primary/10 transition-all duration-200 active:scale-95">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mb-1.5 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                <span className="text-xs font-medium">Packages</span>
              </a>
              
              {/* Second Row */}
              <a href="/explore" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl hover:from-accent/20 hover:to-accent/10 transition-all duration-200 active:scale-95">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mb-1.5 text-muted-foreground">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs font-medium">Explore</span>
              </a>
              
              <a href="/my-tour" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center p-3 bg-gradient-to-r from-muted-foreground/10 to-muted-foreground/5 rounded-xl hover:from-muted-foreground/20 hover:to-muted-foreground/10 transition-all duration-200 active:scale-95">
                <svg className="h-5 w-5 mb-1.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-medium">My Tour</span>
              </a>
              
              {/* Third Row */}
              <a href="/about" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center p-3 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 rounded-xl hover:from-emerald-500/20 hover:to-emerald-400/10 transition-all duration-200 active:scale-95">
                <svg className="h-5 w-5 mb-1.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium">About</span>
              </a>
              
              <a href="/auth" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center p-3 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 rounded-xl hover:from-emerald-500/20 hover:to-emerald-400/10 transition-all duration-200 active:scale-95">
                <svg className="h-5 w-5 mb-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-xs font-medium">Login</span>
              </a>
            </div>
          </div>
        </div>}
    </div>;
};
export default AppLayout;