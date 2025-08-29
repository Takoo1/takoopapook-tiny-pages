import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LotteryCard } from "@/components/lottery-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthButton } from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Trophy, Zap, Search, Gift, UserPlus } from "lucide-react";
import heroImage from "@/assets/hero-fortune-bridge.jpg";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ImageCarousel } from "@/components/ImageCarousel";
import { VideoThumbnailCarousel } from "@/components/VideoThumbnailCarousel";
import { MobileStickySearchFAB } from "@/components/MobileStickySearchFAB";

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
}

export default function Home() {
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchLotteryGames();
    checkAuthAndReferral();
  }, []);

  const checkAuthAndReferral = async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
          organising_group_name
        `)
        .eq('status', 'live')
        .order('game_date', { ascending: true });

      if (error) throw error;

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
    } catch (error) {
      console.error('Error fetching lottery games:', error);
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
          gradient: 'from-red-500/10 via-red-400/5 to-transparent',
          border: 'border-red-200 dark:border-red-800/30',
          title: 'text-red-600 dark:text-red-400',
          subtitle: 'text-red-500/80 dark:text-red-400/80',
          badge: 'bg-red-500 text-white',
          icon: '🔥'
        };
      case '500':
        return {
          gradient: 'from-purple-500/10 via-purple-400/5 to-transparent',
          border: 'border-purple-200 dark:border-purple-800/30',
          title: 'text-purple-600 dark:text-purple-400',
          subtitle: 'text-purple-500/80 dark:text-purple-400/80',
          badge: 'bg-purple-500 text-white',
          icon: '👑'
        };
      case '1000':
        return {
          gradient: 'from-blue-500/10 via-blue-400/5 to-transparent',
          border: 'border-blue-200 dark:border-blue-800/30',
          title: 'text-blue-600 dark:text-blue-400',
          subtitle: 'text-blue-500/80 dark:text-blue-400/80',
          badge: 'bg-blue-500 text-white',
          icon: '💎'
        };
      default:
        return {
          gradient: 'from-green-500/10 via-green-400/5 to-transparent',
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
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-lottery-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lottery games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      {showReferralBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-4">
            <Alert className="border-primary/50 bg-primary/10">
              <Gift className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <strong className="text-primary">{referrerName}</strong> invited you to Fortune Bridge! 
                    Sign up now and get <strong className="text-primary">50 FC free</strong> to start playing!
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
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
                      className="text-muted-foreground hover:text-foreground"
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
      <section className="relative h-[40vh] md:h-[70vh] flex items-center overflow-hidden pt-14">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        
        <div className="relative z-10 text-left max-w-4xl mx-auto px-4 md:px-6 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white drop-shadow-2xl">
            Your Gateway to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Fortune</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed drop-shadow-lg max-w-2xl">
            Experience premium lottery games with complete transparency, instant results, and life-changing prizes
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              const gamesSection = document.getElementById('games');
              gamesSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Games
          </Button>
        </div>
      </section>

      {/* Image Carousel Section */}
      <ImageCarousel />

      <section id="games" className="py-8 md:py-20 px-3 md:px-6 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-foreground">
            Choose Your Fortune
          </h2>
          
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

          {/* Mobile Sticky Search FAB */}
          <MobileStickySearchFAB
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedPriceFilter={selectedPriceFilter}
            onPriceFilterChange={setSelectedPriceFilter}
          />
          
          {lotteryGames.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-lottery-gold mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Active Games</h3>
              <p className="text-muted-foreground">
                Check back soon for exciting new lottery games!
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupGamesByPrice(filteredGames)).map(([price, games]) => {
                const sectionTheme = getSectionTheme(price);
                const sectionTitle = price === '100' ? 'STARTER DEALS' :
                                  price === '500' ? 'PREMIUM COLLECTION' :
                                  price === '1000' ? 'ELITE SELECTION' :
                                  'SPECIAL OFFERS';
                
                return (
                  <div key={price} className={`relative p-8 rounded-3xl bg-gradient-to-br ${sectionTheme.gradient} border-2 ${sectionTheme.border} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                      <div className="absolute top-4 right-4 text-6xl opacity-30">{sectionTheme.icon}</div>
                    </div>
                    
                    <div className="relative z-10 text-center mb-8">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className={`px-4 py-2 rounded-full ${sectionTheme.badge} text-sm font-bold tracking-wider`}>
                          {sectionTheme.icon} {sectionTitle}
                        </div>
                        <div className={`text-3xl font-bold ${sectionTheme.title}`}>
                          ₹{price} TICKETS
                        </div>
                      </div>
                      <p className={`text-lg ${sectionTheme.subtitle} font-medium`}>
                        {price === '100' ? 'Perfect for beginners • Budget-friendly prizes' :
                         price === '500' ? 'Best value for money • Premium rewards' :
                         price === '1000' ? 'Exclusive games • Maximum prizes' :
                         'Limited edition • Unique experiences'}
                      </p>
                    </div>
                    
                    <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Video Thumbnail Carousel - Desktop Only */}
      <div className="hidden md:block">
        <VideoThumbnailCarousel />
      </div>

      <section className="py-12 md:py-20 px-3 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-foreground">
            Why Choose Fortune Bridge?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-4 md:p-6 rounded-lg bg-card/50 border border-border/30">
              <Shield className="w-10 md:w-12 h-10 md:h-12 text-lottery-gold mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">Secure & Transparent</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                All draws are conducted transparently with verifiable results and secure payment processing.
              </p>
            </div>
            <div className="text-center p-4 md:p-6 rounded-lg bg-card/50 border border-border/30">
              <Trophy className="w-10 md:w-12 h-10 md:h-12 text-lottery-gold mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">Premium Prizes</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Win big with our carefully curated lottery games featuring attractive prizes and great odds.
              </p>
            </div>
            <div className="text-center p-4 md:p-6 rounded-lg bg-card/50 border border-border/30">
              <Zap className="w-10 md:w-12 h-10 md:h-12 text-lottery-gold mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">Instant Results</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Get instant notifications and results. Your winnings are processed immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card/30 border-t border-border/30 py-6 md:py-8">
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
    </div>
  );
}
