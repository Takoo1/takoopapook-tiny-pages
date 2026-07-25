import { RefObject, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MobilePriceFilterBarProps {
  selectedPriceFilter: string;
  onPriceFilterChange: (filter: string) => void;
  targetRef?: RefObject<HTMLElement>;
  blockSelector?: string;
}


const FILTERS = [
  {
    value: "all",
    label: "All",
    base: "from-amber-600 via-yellow-600 to-amber-700",
    ring: "ring-amber-300/60",
    glow: "shadow-[0_-6px_20px_-6px_hsl(43_70%_50%/0.7)]",
  },
  {
    value: "200",
    label: "Rs. 200",
    base: "from-neutral-700 to-neutral-900",
    ring: "ring-neutral-400/60",
    glow: "shadow-[0_-6px_20px_-6px_hsl(0_0%_30%/0.7)]",
  },
  {
    value: "500",
    label: "Rs. 500",
    base: "from-stone-700 to-stone-900",
    ring: "ring-stone-400/60",
    glow: "shadow-[0_-6px_20px_-6px_hsl(30_10%_30%/0.7)]",
  },
  {
    value: "1000",
    label: "Rs. 1000",
    base: "from-yellow-600 to-amber-800",
    ring: "ring-yellow-300/60",
    glow: "shadow-[0_-6px_20px_-6px_hsl(43_80%_45%/0.7)]",
  },
];

export function MobilePriceFilterBar({
  selectedPriceFilter,
  onPriceFilterChange,
  targetRef,
  blockSelector,
}: MobilePriceFilterBarProps) {
  const [scrollHidden, setScrollHidden] = useState(false);
  const [inView, setInView] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const lastY = useRef(0);
  const idleTimer = useRef<number | null>(null);


  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) > 4) {
        setScrollHidden(true);
        lastY.current = y;
      }
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setScrollHidden(false), 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, []);

  // Only show when the target section covers >30% of the viewport height.
  useEffect(() => {
    const el = targetRef?.current;
    if (!el) {
      setInView(true);
      return;
    }
    const evaluate = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
      setInView(visible / vh > 0.3);
    };
    evaluate();
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const io = new IntersectionObserver(evaluate, { threshold: thresholds });
    io.observe(el);
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [targetRef]);

  // Block completely when any element matching blockSelector is in the viewport.
  useEffect(() => {
    if (!blockSelector) return;
    const evaluate = () => {
      const els = Array.from(document.querySelectorAll(blockSelector)) as HTMLElement[];
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const anyVisible = els.some((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < vh;
      });
      setBlocked(anyVisible);
    };
    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [blockSelector]);


  const hidden = scrollHidden || !inView;

  const scrollToId = (id: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleClick = (value: string) => {
    if (value === "all") {
      onPriceFilterChange("all");
      scrollToId("games");
      return;
    }
    onPriceFilterChange(value);
    // Wait a tick for the section to render after filter change, then scroll.
    // Fall back to the games section if that price tier has no tickets.
    setTimeout(() => {
      const target = document.getElementById(`price-section-${value}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        scrollToId("games");
      }
    }, 80);
  };

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "md:hidden fixed left-0 right-0 z-50 pointer-events-none",
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
