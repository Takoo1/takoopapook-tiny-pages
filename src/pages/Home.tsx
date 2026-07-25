import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LotteryCard } from "@/components/lottery-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthButton } from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search, Gift, UserPlus, Trophy } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ImageCarousel } from "@/components/ImageCarousel";
import { VideoThumbnailCarousel } from "@/components/VideoThumbnailCarousel";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MobilePriceFilterBar } from "@/components/MobilePriceFilterBar";
import { FAQSection } from "@/components/FAQSection";

interface LotteryGame {
  id: string;
  title: string;
  description: string;
  game_date: string;
  ticket_image_url: string;
  ticket_price: number;
  total_tickets: number;
  available_tickets: number;
  organising_group_name: string;
  status: 'online' | 'booking_stopped' | 'live';
}

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [lotteryGames, setLotteryGames] = useState<LotteryGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<LotteryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState("all");
  const [organizerSuggestions, setOrganizerSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [showReferralBanner, setShowReferralBanner] = useState(false);

  useEffect(() => {
    fetchLotteryGames();
    checkAuthAndReferral();
  }, []);

  // Add polling for real-time status updates
  useEffect(() => {
    const statusInterval = setInterval(() => {
      fetchLotteryGames();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(statusInterval);
  }, []);

  const checkAuthAndReferral = async () => {
    try {
      console.log('Checking auth and referral...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth session error:', error);
      }
      console.log('Auth session:', session ? 'logged in' : 'not logged in');
      setUser(session?.user ?? null);

    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get('ref');
    const refFromStorage = localStorage.getItem('ref_code');
    const referralCodeToCheck = refFromUrl || refFromStorage;

    if (referralCodeToCheck && !session?.user) {
      setReferralCode(referralCodeToCheck);
      
      // Store the referral code for later use during signup
      if (refFromUrl) {
        localStorage.setItem('ref_code', refFromUrl);
      }
      
      try {
        const { data: referrerName, error } = await supabase
          .rpc('get_referrer_display_name', { ref_code: referralCodeToCheck });
        
        if (!error && referrerName) {
          setReferrerName(referrerName);
          setShowReferralBanner(true);
        } else {
          console.error('Error fetching referrer:', error);
        }
      } catch (error) {
        console.error('Error fetching referrer info:', error);
      }
    }

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowReferralBanner(false);
      }
    });
    } catch (error) {
      console.error('Error in checkAuthAndReferral:', error);
    }
  };

  useEffect(() => {
    let filtered = lotteryGames;

    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.organising_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPriceFilter !== "all") {
      if (selectedPriceFilter === "other") {
        filtered = filtered.filter(game => 
          ![100, 500, 1000].includes(game.ticket_price)
        );
      } else {
        const targetPrice = parseInt(selectedPriceFilter);
        filtered = filtered.filter(game => game.ticket_price === targetPrice);
      }
    }

    filtered.sort((a, b) => new Date(a.game_date).getTime() - new Date(b.game_date).getTime());

    setFilteredGames(filtered);
  }, [lotteryGames, searchTerm, selectedPriceFilter]);

  useEffect(() => {
    if (searchTerm) {
      const suggestions = Array.from(new Set(
        lotteryGames
          .filter(game => 
            game.organising_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(game => game.organising_group_name)
          .filter(Boolean)
      ));
      setOrganizerSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0 && searchTerm.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, lotteryGames]);

  const fetchLotteryGames = async () => {
    try {
      console.log('Fetching lottery games...');
      const { data: games, error } = await supabase
        .from('lottery_games')
        .select(`
          id,
          title,
          description,
          game_date,
          ticket_image_url,
          ticket_price,
          total_tickets,
          organising_group_name,
          status
        `)
        .in('status', ['live', 'online', 'booking_stopped'])
        .order('game_date', { ascending: true });

      if (error) {
        console.error('Database error fetching games:', error);
        throw error;
      }

      console.log('Games fetched successfully:', games?.length || 0);

      const gamesWithAvailableTickets = await Promise.all(
        (games || []).map(async (game) => {
          const { count } = await supabase
            .from('lottery_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('lottery_game_id', game.id)
            .eq('status', 'available');

          return {
            ...game,
            available_tickets: count || 0
          };
        })
      );

      setLotteryGames(gamesWithAvailableTickets);
      console.log('Lottery games state updated');
    } catch (error) {
      console.error('Error fetching lottery games:', error);
      // Add retry logic for failed requests
      setTimeout(() => {
        console.log('Retrying lottery games fetch...');
        fetchLotteryGames();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (gameId: string) => {
    navigate(`/lottery/${gameId}`);
  };

  const handleSearch = () => {
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const priceFilters = [
    { label: "All Prices", value: "all" },
    { label: "₹100", value: "100" },
    { label: "₹500", value: "500" },
    { label: "₹1000", value: "1000" },
    { label: "Other Prices", value: "other" }
  ];

  const getThemeForPrice = (price: number): 'tier-100' | 'tier-500' | 'tier-1000' | 'tier-other' => {
    if (price === 100) return 'tier-100';
    if (price === 500) return 'tier-500';
    if (price === 1000) return 'tier-1000';
    return 'tier-other';
  };

  const getSectionTheme = (price: string) => {
    switch (price) {
      case '100':
        return {
          gradient: 'from-red-500/20 via-red-400/15 to-red-300/5',
          border: 'border-red-200 dark:border-red-800/30',
          title: 'text-red-600 dark:text-red-400',
          subtitle: 'text-red-500/80 dark:text-red-400/80',
          badge: 'bg-red-500 text-white',
          icon: '🔥'
        };
      case '500':
        return {
          gradient: 'from-blue-500/20 via-blue-400/15 to-blue-300/5',
          border: 'border-blue-200 dark:border-blue-800/30',
          title: 'text-blue-600 dark:text-blue-400',
          subtitle: 'text-blue-500/80 dark:text-blue-400/80',
          badge: 'bg-blue-500 text-white',
          icon: '👑'
        };
      case '1000':
        return {
          gradient: 'from-purple-500/20 via-purple-400/15 to-purple-300/5',
          border: 'border-purple-200 dark:border-purple-800/30',
          title: 'text-purple-600 dark:text-purple-400',
          subtitle: 'text-purple-500/80 dark:text-purple-400/80',
          badge: 'bg-purple-500 text-white',
          icon: '💎'
        };
      default:
        return {
          gradient: 'from-green-500/20 via-green-400/15 to-green-300/5',
          border: 'border-green-200 dark:border-green-800/30',
          title: 'text-green-600 dark:text-green-400',
          subtitle: 'text-green-500/80 dark:text-green-400/80',
          badge: 'bg-green-500 text-white',
          icon: '⭐'
        };
    }
  };

  const groupGamesByPrice = (games: LotteryGame[]) => {
    const grouped: { [key: string]: LotteryGame[] } = {};
    
    games.forEach(game => {
      const price = game.ticket_price.toString();
      if (!grouped[price]) {
        grouped[price] = [];
      }
      grouped[price].push(game);
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-primary/15"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-2 border-primary/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 rounded-full border-t-2 border-primary/30 animate-spin" style={{ animationDuration: '2s' }}></div>
          </div>
          <p className="text-muted-foreground font-medium text-sm tracking-wide animate-pulse">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-noir min-h-screen relative font-['Manrope']">
      {/* Ambient gold spot */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.18]" style={{ background: 'radial-gradient(circle, hsl(var(--noir-gold)/0.6), transparent 60%)' }} />
        <div className="absolute bottom-0 -left-32 w-[380px] h-[380px] rounded-full blur-3xl opacity-[0.12]" style={{ background: 'radial-gradient(circle, hsl(var(--noir-mid)/0.9), transparent 60%)' }} />
      </div>
      <div className="relative z-10">
      {showReferralBanner && (
        <div className="fixed top-16 left-0 right-0 z-50 backdrop-blur-md" style={{ background: 'linear-gradient(90deg, hsl(var(--noir-mid)/0.85), hsl(var(--noir-deep)/0.85))', borderBottom: '1px solid hsl(var(--noir-gold)/0.35)' }}>
          <div className="max-w-4xl mx-auto p-4">
            <Alert className="border-0 bg-transparent">
              <Gift className="h-4 w-4" style={{ color: 'hsl(var(--noir-gold))' }} />
              <AlertDescription style={{ color: 'hsl(var(--noir-cream))' }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <strong style={{ color: 'hsl(var(--noir-gold))' }}>{referrerName}</strong> invited you to Fortune Bridge!
                    Sign up now and get <strong style={{ color: 'hsl(var(--noir-gold))' }}>50 FC free</strong> to start playing!
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="home-gold-btn border-0"
                      onClick={() => {
                        const authButton = document.querySelector('[data-auth-trigger]') as HTMLElement;
                        authButton?.click();
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up & Get 50 FC
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowReferralBanner(false)}
                      style={{ color: 'hsl(var(--noir-cream)/0.75)' }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full home-band" style={{ aspectRatio: '16/9' }}>
        <div className="relative z-10 h-full"><HeroCarousel /></div>
      </section>

      {/* Why Choose strip (mobile-friendly trust markers) */}
      <section className="home-band-dark px-5 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-8 overflow-x-auto no-scrollbar home-chip-row py-4">
          <div className="home-chip">
            <div className="ico"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
            <span className="lbl">Secure</span>
          </div>
          <div className="home-chip">
            <div className="ico"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
            <span className="lbl">Instant</span>
          </div>
          <div className="home-chip">
            <div className="ico"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <span className="lbl">Verified</span>
          </div>
          <div className="home-chip">
            <div className="ico"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>
            <span className="lbl">Fair Play</span>
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <div className="relative home-band-dark">
        <div className="relative z-10"><ImageCarousel /></div>
      </div>

      <section id="games" className="relative py-8 md:py-20 px-3 md:px-6 home-band scroll-mt-16 md:scroll-mt-0 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-10 animate-fade-in-up">
            <div className="home-eyebrow mb-2">Featured Draws</div>
            <h2 className="home-section-title text-3xl md:text-4xl">Choose Your Fortune</h2>
            <div className="w-12 h-[3px] mt-3 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--noir-gold)), hsl(var(--noir-gold-soft)))' }} />
          </div>

          {/* Desktop Search and Filters */}
          <div className="mb-6 md:mb-12 space-y-4 md:space-y-6 hidden md:block">
            <div className="relative max-w-md mx-auto px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 text-sm md:text-base"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-md mt-1 shadow-lg z-10">
                  {organizerSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-2">
              {priceFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedPriceFilter === filter.value ? "lottery" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPriceFilter(filter.value)}
                  className="transition-all text-xs md:text-sm px-3 md:px-4"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile floating price filter bar (above bottom nav) */}
          <MobilePriceFilterBar
            selectedPriceFilter={selectedPriceFilter}
            onPriceFilterChange={setSelectedPriceFilter}
          />
          
          {lotteryGames.length === 0 ? (
            <div className="home-empty mx-auto max-w-md text-center py-14 px-6 mt-4 animate-fade-in-up">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--noir-mid))', border: '1px solid hsl(var(--noir-gold)/0.35)' }}>
                <Trophy className="w-7 h-7" style={{ color: 'hsl(var(--noir-gold))' }} />
              </div>
              <h3 className="home-section-title text-lg mb-1">No Active Draws</h3>
              <p className="text-sm" style={{ color: 'hsl(var(--noir-cream)/0.7)' }}>
                New premium draws are on their way. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-10 md:space-y-14 mt-4">
              {Object.entries(groupGamesByPrice(filteredGames))
                .sort(([priceA], [priceB]) => {
                  const getPriority = (price: string) => {
                    if (price === '1000') return 1;
                    if (price === '500') return 2;
                    return 3 + (10000 - parseInt(price));
                  };
                  return getPriority(priceA) - getPriority(priceB);
                })
                .map(([price, games]) => {
                const sectionTitle = price === '100' ? 'Budget Collection' :
                                  price === '500' ? 'Premium Collection' :
                                  price === '1000' ? 'Elite Selection' :
                                  'Featured Collection';

                return (
                  <section
                    key={price}
                    id={`price-section-${price}`}
                    className="relative rounded-[24px] p-4 md:p-8 overflow-hidden scroll-mt-[72px] md:scroll-mt-20 animate-fade-in-up"
                    style={{
                      background: 'linear-gradient(180deg, hsl(var(--noir-mid)/0.28), hsl(var(--noir-deep)/0.6))',
                      border: '1px solid hsl(var(--noir-gold)/0.18)',
                      boxShadow: '0 10px 32px -18px hsl(0 0% 0% / 0.55)'
                    }}
                  >
                    {/* Section header */}
                    <div className="flex items-center justify-between gap-3 mb-5 md:mb-8">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="home-tier-pill">
                          <span className="dot" />
                          {sectionTitle}
                        </span>
                      </div>
                      <span className="home-tier-price whitespace-nowrap">₹{price}</span>
                    </div>

                    <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 stagger-children">
                      {games.map((game) => (
                        <LotteryCard
                          key={game.id}
                          id={game.id}
                          title={game.title}
                          description={game.description}
                          gameDate={game.game_date}
                          ticketImageUrl={game.ticket_image_url}
                          ticketPrice={game.ticket_price}
                          totalTickets={game.total_tickets}
                          availableTickets={game.available_tickets}
                          organizingGroup={game.organising_group_name}
                          onViewDetails={handleViewDetails}
                          theme={getThemeForPrice(game.ticket_price)}
                          status={game.status}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <div className="relative home-band-dark">
        <div className="relative z-10"><FAQSection /></div>
      </div>

      {/* Video Thumbnail Carousel - Desktop Only */}
      <div className="hidden md:block relative home-band">
        <div className="relative z-10"><VideoThumbnailCarousel /></div>
      </div>


      {/* Footer - Hidden on mobile */}
      {!isMobile && (
        <footer className="bg-gradient-to-b from-card/30 to-muted/10 border-t border-border/30 py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-3 md:px-6 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mb-4">
              <button 
                onClick={() => navigate('/admin')}
                className="text-muted-foreground hover:text-lottery-gold transition-colors text-xs md:text-sm"
              >
                Admin
              </button>
              <span className="hidden md:inline text-muted-foreground">•</span>
              <button 
                onClick={() => navigate('/game-organiser-dashboard')}
                className="text-muted-foreground hover:text-lottery-gold transition-colors text-xs md:text-sm"
              >
                Organizer Dashboard
              </button>
              <span className="hidden md:inline text-muted-foreground">•</span>
              <span className="text-muted-foreground text-xs md:text-sm">
                © 2024 Fortune Bridge. All rights reserved.
              </span>
            </div>
          </div>
        </footer>
      )}
      </div>
    </div>
  );
}
