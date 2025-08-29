import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main content with header padding */}
      <main className={cn(
        "flex-1 pt-14", // Add top padding for fixed header
        isMobile ? "pb-20" : ""
      )}>
        {children}
      </main>

      {/* Bottom navigation - only show on mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}