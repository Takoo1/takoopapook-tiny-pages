import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ModeSwitch({ mode, className = "" }: { mode: "coupons" | "passes"; className?: string }) {
  const navigate = useNavigate();
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