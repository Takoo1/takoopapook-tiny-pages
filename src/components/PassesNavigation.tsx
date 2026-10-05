import { Compass, CalendarDays, Newspaper, Play, MapPinned } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const passesNav = [
  { label: "Discover", path: "/passes", icon: Compass },
  { label: "Events", path: "/passes/events", icon: CalendarDays },
  { label: "News", path: "/passes/news", icon: Newspaper },
  { label: "Videos", path: "/passes/videos", icon: Play },
  { label: "Tourism", path: "/passes/tourism", icon: MapPinned },
] as const;

export function PassesNavigation({ desktop = false }: { desktop?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav aria-label="Passes" className={desktop ? "flex items-center gap-1" : "fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl pb-safe"}>
      <div className={desktop ? "flex items-center gap-1" : "mx-auto flex max-w-md items-stretch px-2 pt-1.5 pb-1"}>
        {passesNav.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return <Button key={path} type="button" variant="ghost" onClick={() => navigate(path)} aria-label={label} aria-current={active ? "page" : undefined}
            className={cn(desktop ? "h-9 px-3 rounded-xl text-sm" : "group flex-1 h-[56px] min-w-0 flex-col gap-1 rounded-2xl px-0 py-1.5 text-[11px]", active ? "text-primary" : "text-muted-foreground")}>
            <span className={cn("flex items-center justify-center", desktop ? "" : "w-14 h-8 rounded-full", active && !desktop && "bg-secondary")}><Icon className="h-[21px] w-[21px]" /></span>
            <span className={cn("leading-none", active ? "font-bold" : "font-medium")}>{label}</span>
          </Button>;
        })}
      </div>
    </nav>
  );
}