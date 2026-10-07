import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeSwitch({ mode, className = "", segmented = false }: { mode: "coupons" | "passes"; className?: string; segmented?: boolean }) {
  const navigate = useNavigate();

  if (segmented) {
    return (
      <div role="group" aria-label="Explore Fortuna Link" className={cn("mode-segmented flex w-full items-center gap-2 rounded-2xl bg-muted p-[3px]", className)}>
        <Button type="button" variant="ghost" aria-pressed={mode === "coupons"} onClick={() => navigate("/")}
          className={cn("mode-segment chip-gold-3d flex-1 h-8 rounded-xl text-[13px] font-bold hover:bg-transparent", mode === "coupons" ? "mode-segment-active" : "mode-segment-muted")}>
          <span className="relative z-10">Coupons</span>
        </Button>
        <Button type="button" variant="ghost" aria-pressed={mode === "passes"} onClick={() => navigate("/passes")}
          className={cn("mode-segment chip-blue-3d flex-1 h-8 rounded-xl text-[13px] font-bold hover:bg-transparent", mode === "passes" ? "mode-segment-active" : "mode-segment-muted")}>
          <span className="relative z-10">Passes</span>
        </Button>
      </div>
    );
  }

  return (
    <div role="group" aria-label="Explore Fortuna Link" className={`flex items-center gap-2 ${className}`}>
      <Button type="button" variant="ghost" aria-pressed={mode === "coupons"} onClick={() => navigate("/")}
        className={`mode-button chip-gold-3d h-8 px-3 rounded-full text-xs font-bold hover:bg-transparent ${mode === "coupons" ? "mode-current" : ""}`}>
        <span className="relative z-10">Coupons</span>
      </Button>
      <Button type="button" variant="ghost" aria-pressed={mode === "passes"} onClick={() => navigate("/passes")}
        className={`mode-button chip-blue-3d h-8 px-3 rounded-full text-xs font-bold hover:bg-transparent ${mode === "passes" ? "mode-current" : ""}`}>
        <span className="relative z-10">Passes</span>
      </Button>
    </div>
  );
}