import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LotteryCard } from "@/components/lottery-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthButton } from "@/components/AuthButton";
import { Shield, Trophy, Zap, Search } from "lucide-react";
import heroImage from "@/assets/Fortune_Bridge_Banner.png";

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchLotteryGames();
  }, []);

  useEffect(() => {
    let filtered = lotteryGames;

    // Filter by search term (organising group name)
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.organising_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price
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

    // Sort by nearest upcoming game date
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
        .order('game_date', { ascending: true });

      if (error) throw error;

      // Get available tickets count for each game
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
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-lottery-gold">Fortune Bridge</h1>
          <AuthButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-lottery-gold to-lottery-gold-light bg-clip-text text-transparent">
            Fortune Bridge
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-8 leading-relaxed">
            Cross the bridge to your fortune. Premium lottery games with transparent draws and instant wins.
          </p>
          <Button 
            size="lg"
            variant="lottery"
            className="px-8 py-6 text-lg"
            onClick={() => {
              const gamesSection = document.getElementById('games');
              gamesSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Games
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            Why Choose Fortune Bridge?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-card/50 border border-border/30">
              <Shield className="w-12 h-12 text-lottery-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Secure & Transparent</h3>
              <p className="text-muted-foreground">
                All draws are conducted transparently with verifiable results and secure payment processing.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 border border-border/30">
              <Trophy className="w-12 h-12 text-lottery-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Premium Prizes</h3>
              <p className="text-muted-foreground">
                Win big with our carefully curated lottery games featuring attractive prizes and great odds.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 border border-border/30">
              <Zap className="w-12 h-12 text-lottery-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Instant Results</h3>
              <p className="text-muted-foreground">
                Get instant notifications and results. Your winnings are processed immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lottery Games Section */}
      <section id="games" className="py-20 px-6 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            Choose Your Fortune
          </h2>
          
          {/* Search and Filter Section */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by organizer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4"
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
              
              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-md mt-1 shadow-lg z-10">
                  {organizerSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {priceFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedPriceFilter === filter.value ? "lottery" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPriceFilter(filter.value)}
                  className="transition-all"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
          
          {lotteryGames.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-lottery-gold mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Active Games</h3>
              <p className="text-muted-foreground">
                Check back soon for exciting new lottery games!
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupGamesByPrice(filteredGames)).map(([price, games]) => (
                <div key={price}>
                  <h3 className="text-2xl font-bold mb-6 text-foreground text-center">
                    ₹{price} Tickets
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/30 border-t border-border/30 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <button 
              onClick={() => navigate('/admin')}
              className="text-muted-foreground hover:text-lottery-gold transition-colors text-sm"
            >
              Admin
            </button>
            <span className="text-muted-foreground">•</span>
            <button 
              onClick={() => navigate('/organizer-login')}
              className="text-muted-foreground hover:text-lottery-gold transition-colors text-sm"
            >
              Organizer Dashboard
            </button>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground text-sm">
              © 2024 Fortune Bridge. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
