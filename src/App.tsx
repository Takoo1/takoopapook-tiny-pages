
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TermsProvider, useTermsContext } from "@/contexts/TermsContext";
import TermsPopupModal from "@/components/TermsPopupModal";
import Home from "./pages/Home";
import LotteryDetail from "./pages/LotteryDetail";
import TicketBuying from "./pages/TicketBuying";
import Admin from "./pages/Admin";
import GameOrganiserDashboard from "./pages/GameOrganiserDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import Videos from "./pages/Videos";
import Winners from "./pages/Winners";
import MyTickets from "./pages/MyTickets";
import MenuPage from "./pages/MenuPage";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import NotificationDetail from "./pages/NotificationDetail";
import { MobileLayout } from "./components/MobileLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const GlobalTermsPopup = () => {
  const { isPopupOpen, popupProps, hideTermsPopup } = useTermsContext();
  
  if (!popupProps) return null;
  
  return (
    <TermsPopupModal
      isOpen={isPopupOpen}
      onClose={hideTermsPopup}
      onAccept={popupProps.onAccept}
      acceptanceType={popupProps.acceptanceType}
      sectionsToShow={popupProps.sectionsToShow}
      title={popupProps.title}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <TermsProvider>
          <Toaster />
          <Sonner />
          <GlobalTermsPopup />
          <BrowserRouter>
            <ErrorBoundary>
              <MobileLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/lottery/:gameId" element={<LotteryDetail />} />
                  <Route path="/lottery/:gameId/buy" element={<TicketBuying />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/game-organiser-dashboard" element={<GameOrganiserDashboard />} />
                  <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/winners" element={<Winners />} />
                  <Route path="/my-tickets" element={<MyTickets />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/notifications/:id" element={<NotificationDetail />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MobileLayout>
            </ErrorBoundary>
          </BrowserRouter>
        </TermsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
