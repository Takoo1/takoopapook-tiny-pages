import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Status bar safe area */}
      <div className="pt-safe-top" />
      
      {/* Main content with bottom navigation padding on mobile */}
      <main className={cn(
        "flex-1",
        isMobile ? "pb-20" : ""
      )}>
        {children}
      </main>

      {/* Bottom navigation - only show on mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}