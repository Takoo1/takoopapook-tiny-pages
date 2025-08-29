import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { DesktopHeader } from "./DesktopHeader";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Conditional Header - Mobile or Desktop */}
      {isMobile ? <MobileHeader /> : <DesktopHeader />}
      
      {/* Main content with header padding */}
      <main className={cn(
        "flex-1", 
        isMobile ? "pt-14 pb-20" : "pt-0" // Different padding for mobile vs desktop
      )}>
        {children}
      </main>

      {/* Bottom navigation - only show on mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}