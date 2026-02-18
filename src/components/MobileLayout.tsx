import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { DesktopHeader } from "./DesktopHeader";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Hide header on mobile for videos page
  const hideHeader = isMobile && location.pathname === '/videos';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Conditional Header - Mobile or Desktop */}
      {!hideHeader && (isMobile ? <MobileHeader /> : <DesktopHeader />)}
      
      {/* Main content with header padding */}
      <main className={cn(
        "flex-1 transition-all duration-200", 
        !hideHeader && isMobile ? "pt-[56px] pb-[72px]" : 
        !hideHeader ? "pt-0" : 
        isMobile ? "pb-[72px]" : "pt-0"
      )}>
        {children}
      </main>

      {/* Bottom navigation - only show on mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}