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
    <div className="home-noir min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Soft ambient tint (very subtle) */}
      {isMobile && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(70% 40% at 50% 0%, hsl(var(--primary) / 0.05), transparent 70%), radial-gradient(50% 40% at 100% 100%, hsl(var(--lottery-gold) / 0.05), transparent 70%)',
          }}
        />
      )}

      {/* Conditional Header - Mobile or Desktop */}
      {!hideHeader && (isMobile ? <MobileHeader /> : <DesktopHeader />)}

      {/* Main content with header padding */}
      <main
        key={location.pathname}
        className={cn(
          "flex-1 relative z-10 animate-fade-in",
          !hideHeader && isMobile ? "pt-[58px] pb-[76px]" :
          !hideHeader ? "pt-0" :
          isMobile ? "pb-[76px]" : "pt-0"
        )}
      >
        {children}
      </main>

      {/* Bottom navigation - only show on mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}