import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LotteryDetail from "./pages/LotteryDetail";
import TicketBuying from "./pages/TicketBuying";
import Admin from "./pages/Admin";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lottery/:gameId" element={<LotteryDetail />} />
          <Route path="/lottery/:gameId/buy" element={<TicketBuying />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/organizer-login" element={<OrganizerLogin />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
