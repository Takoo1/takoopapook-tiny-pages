import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Compass, MapPinned, Newspaper, Play, Ticket, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import passesImage from "@/assets/hero-banner.jpg";

const categories: Record<string, { title: string; eyebrow: string; description: string; empty: string; icon: LucideIcon }> = {
  events: { title: "Events", eyebrow: "EVENT PASSES", description: "Find your next moment worth being there for.", empty: "There are no events to book right now. New event passes will appear here when available.", icon: CalendarDays },
  news: { title: "News", eyebrow: "THE LATEST", description: "Updates from the world of experiences.", empty: "There are no news updates yet. Check back for announcements.", icon: Newspaper },
  videos: { title: "Videos", eyebrow: "WATCH & EXPLORE", description: "A closer look at what’s happening.", empty: "There are no Passes videos yet. New stories will appear here when available.", icon: Play },
  tourism: { title: "Tourism", eyebrow: "PLACES TO GO", description: "Make room for a memorable escape.", empty: "There are no tourism passes to book right now. Destinations will appear here when available.", icon: MapPinned },
};

function EmptyState({ title, text, icon: Icon }: { title: string; text: string; icon: LucideIcon }) {
  return <div className="mx-auto flex max-w-sm flex-col items-center py-12 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary text-primary"><Icon className="h-7 w-7" /></span>
    <h2 className="mt-5 text-xl font-bold text-foreground">{title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
  </div>;
}

export default function Passes() {
  const location = useLocation();
  const navigate = useNavigate();
  const key = location.pathname.split("/")[2];
  const category = key ? categories[key] : undefined;

  if (category) {
    return <div className="passes-page min-h-[calc(100vh-176px)]">
      <div className="mx-auto max-w-5xl px-5 pt-8 pb-16 md:px-8 md:pt-12">
        <p className="passes-kicker">{category.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{category.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{category.description}</p>
        <div className="mt-8 border-t border-border"><EmptyState title={`No ${category.title.toLowerCase()} yet`} text={category.empty} icon={category.icon} /></div>
        <Button variant="outline" onClick={() => navigate("/passes")} className="mx-auto flex">Explore Passes</Button>
      </div>
    </div>;
  }

  const destinations = [
    { ...categories.events, path: "/passes/events", detail: "Live experiences", icon: CalendarDays },
    { ...categories.tourism, path: "/passes/tourism", detail: "Places & journeys", icon: MapPinned },
    { ...categories.news, path: "/passes/news", detail: "Stories & updates", icon: Newspaper },
    { ...categories.videos, path: "/passes/videos", detail: "Watch & discover", icon: Play },
  ];
  return <div className="passes-page min-h-screen">
    <section className="passes-cover relative overflow-hidden">
      <img src={passesImage} alt="A bridge lit at dusk" className="absolute inset-0 h-full w-full object-cover" />
      <div className="passes-cover-shade absolute inset-0" />
      <div className="relative mx-auto flex min-h-[280px] max-w-6xl flex-col justify-end px-5 pb-8 pt-16 md:min-h-[370px] md:px-8 md:pb-12">
        <span className="passes-cover-kicker">FORTUNA LINK / PASSES</span>
        <h1 className="mt-3 max-w-lg text-3xl font-bold leading-tight text-primary-foreground md:text-5xl">Be there for more.</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/90 md:text-base">Explore events, destinations, stories and more.</p>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
      <div className="flex items-center gap-3 text-primary"><Compass className="h-5 w-5" /><span className="passes-kicker">EXPLORE PASSES</span></div>
      <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">What would you like to explore?</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {destinations.map(({ title, detail, path, icon: Icon }) => <Button key={path} variant="ghost" onClick={() => navigate(path)}
          className="passes-destination h-[152px] flex-col items-start justify-between whitespace-normal rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:bg-secondary/60 md:h-[180px] md:p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="h-5 w-5" /></span>
          <span className="flex w-full items-end justify-between gap-1"><span><span className="block text-base font-bold text-foreground">{title}</span><span className="block text-xs font-normal text-muted-foreground">{detail}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-primary" /></span>
        </Button>)}
      </div>
    </section>
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto flex max-w-6xl items-start gap-4 px-5 py-7 md:px-8"><Ticket className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h2 className="text-base font-bold text-foreground">Pass bookings</h2><p className="mt-1 text-sm text-muted-foreground">Real pass availability and booking will be available here when passes are added.</p></div></div>
    </section>
  </div>;
}