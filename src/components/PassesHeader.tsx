import { useNavigate } from "react-router-dom";
import { ModeSwitch } from "./ModeSwitch";
import { PassesNavigation } from "./PassesNavigation";
import { NotificationBell } from "./NotificationBell";
import { Button } from "@/components/ui/button";

const logo = "/__l5e/assets-v1/e013b595-501d-44f1-8ddb-13183d360966/fortuna-logo.png";
const wordmark = "/__l5e/assets-v1/21420f7f-e55f-4739-8be4-45b24b061c9a/fortunalink-name.png";

export function PassesHeader({ mobile }: { mobile: boolean }) {
  const navigate = useNavigate();
  return mobile ? (
    <header className="fixed inset-x-0 top-0 z-50 h-[100px] border-b border-border bg-card/95 backdrop-blur-xl pt-safe-top">
      <div className="flex h-[51px] items-center justify-between px-4">
        <Button variant="ghost" onClick={() => navigate("/passes")} aria-label="Fortuna Link Passes home" className="h-11 min-w-0 gap-2 p-0 hover:bg-transparent">
          <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-xl" />
          <img src={wordmark} alt="Fortuna Link" className="h-5 max-w-[128px] object-contain" />
        </Button>
        <div className="flex items-center gap-1"><span className="passes-header-label hidden min-[360px]:inline">PASS EXPERIENCE</span><NotificationBell /></div>
      </div>
      <div className="flex h-[48px] items-center justify-between gap-2 px-4">
        <ModeSwitch mode="passes" />
        <span className="text-xs font-semibold text-muted-foreground">Explore more</span>
      </div>
    </header>
  ) : (
    <header className="border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex min-h-[72px] items-center justify-between gap-5 px-6">
        <Button variant="ghost" onClick={() => navigate("/passes")} className="h-auto gap-3 p-0 hover:bg-transparent" aria-label="Fortuna Link Passes home">
          <img src={logo} alt="" className="h-12 w-12 rounded-xl" /><img src={wordmark} alt="Fortuna Link" className="h-7 object-contain" />
          <span className="passes-header-label">PASSES</span>
        </Button>
        <PassesNavigation desktop />
        <div className="flex items-center gap-2"><ModeSwitch mode="passes" /><NotificationBell /></div>
      </div>
    </header>
  );
}