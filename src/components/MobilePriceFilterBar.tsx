import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MobilePriceFilterBarProps {
  selectedPriceFilter: string;
  onPriceFilterChange: (filter: string) => void;
}

const FILTERS = [
  {
    value: "all",
    label: "All",
    base: "from-amber-500 to-orange-600",
    ring: "ring-amber-300/60",
    glow: "shadow-[0_-6px_20px_-6px_hsl(35_90%_50%/0.7)]",
  },
  {
    value: "200",
    label: "Rs. 200",
    base: "from-emerald-500 to-green-600",
    ring: "ring-emerald-300/60",
    glow: "shadow-[0_-6px_20px_-6px_hsl(150_70%_45%/0.7)]",
  },
  {
    value: "500",
    label: "Rs. 500",
    base: "from-sky-500 to-blue-600",
    ring: "ring-sky-300/60",
    glow: "shadow-[0_-6px_20px_-6px_hsl(215_85%_55%/0.7)]",
  },
  {
    value: "1000",
    label: "Rs. 1000",
    base: "from-fuchsia-500 to-purple-600",
    ring: "ring-fuchsia-300/60",
    glow: "shadow-[0_-6px_20px_-6px_hsl(285_75%_55%/0.7)]",
  },
];

export function MobilePriceFilterBar({
  selectedPriceFilter,
  onPriceFilterChange,
}: MobilePriceFilterBarProps) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) > 4) {
        setHidden(true);
        lastY.current = y;
      }
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setHidden(false), 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, []);

  const handleClick = (value: string) => {
    onPriceFilterChange(selectedPriceFilter === value ? "all" : value);
    const section = document.getElementById(`price-section-${value}`);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "md:hidden fixed left-0 right-0 z-40 pointer-events-none",
        "transition-all duration-300 ease-out",
        hidden ? "translate-y-[120%] opacity-0" : "translate-y-0 opacity-100"
      )}
      style={{ bottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto px-3">
        <div className="flex items-end justify-center gap-2">
          {FILTERS.map((f, i) => {
            const isActive = selectedPriceFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => handleClick(f.value)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={cn(
                  "relative flex-1 max-w-[120px] h-11 px-3",
                  "rounded-t-2xl rounded-b-none",
                  "bg-gradient-to-b text-white text-sm font-semibold tracking-tight",
                  "ring-1 ring-inset transition-all duration-200",
                  "active:scale-95 active:translate-y-0.5",
                  "animate-fade-in-up",
                  f.base,
                  f.ring,
                  f.glow,
                  isActive
                    ? "-translate-y-1 scale-[1.04] brightness-110"
                    : "hover:-translate-y-0.5"
                )}
              >
                {/* glossy top sheen */}
                <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-t-xl bg-gradient-to-b from-white/35 to-transparent" />
                <span className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  {f.label}
                </span>
                {isActive && (
                  <span className="absolute left-1/2 -translate-x-1/2 -top-1 w-8 h-1 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
