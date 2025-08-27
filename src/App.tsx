import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LotteryDetail from "./pages/LotteryDetail";
import TicketBuying from "./pages/TicketBuying";
import Admin from "./pages/Admin";
import GameOrganiserDashboard from "./pages/GameOrganiserDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import GlobalFortuneCounter from "./pages/GlobalFortuneCounter";
import Videos from "./pages/Videos";
import Winners from "./pages/Winners";
import MyTickets from "./pages/MyTickets";
import MenuPage from "./pages/MenuPage";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { MobileLayout } from "./components/MobileLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MobileLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lottery/:gameId" element={<LotteryDetail />} />
              <Route path="/lottery/:gameId/buy" element={<TicketBuying />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/game-organiser-dashboard" element={<GameOrganiserDashboard />} />
              <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
              <Route path="/global-fortune-counter" element={<GlobalFortuneCounter />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/winners" element={<Winners />} />
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MobileLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
