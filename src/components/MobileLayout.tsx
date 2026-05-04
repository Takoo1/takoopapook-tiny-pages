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
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Ambient decorative blobs (mobile only, behind content) */}
      {isMobile && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="blob bg-primary/30 w-[280px] h-[280px] -top-20 -left-16" style={{ animation: 'blob-float 18s ease-in-out infinite' }} />
          <div className="blob bg-accent/25 w-[260px] h-[260px] top-1/3 -right-20" style={{ animation: 'blob-float 22s ease-in-out infinite reverse' }} />
          <div className="blob bg-primary-glow/20 w-[300px] h-[300px] bottom-32 -left-24" style={{ animation: 'blob-float 26s ease-in-out infinite' }} />
        </div>
      )}

      {/* Conditional Header - Mobile or Desktop */}
      {!hideHeader && (isMobile ? <MobileHeader /> : <DesktopHeader />)}

      {/* Main content with header padding */}
      <main className={cn(
        "flex-1 transition-all duration-200 relative z-10",
        !hideHeader && isMobile ? "pt-[58px] pb-[72px]" :
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