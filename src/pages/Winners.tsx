import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Calendar } from "lucide-react";
import { ProfileImagePopup } from "@/components/ProfileImagePopup";

interface Winner {
  id: string;
  name: string;
  prize_position: number;
  details: string | null;
  image_url: string;
  is_active: boolean;
  lottery_game_id: string | null;
  custom_game_id: string | null;
  prize_type: string;
  lottery_games?: {
    title: string;
    game_date: string;
  };
  custom_winner_games?: {
    game_name: string;
    game_date: string;
  };
}

interface GameWinners {
  gameId: string;
  gameTitle: string;
  gameDate: string | null;
  mainPrizes: Winner[];
  incentivePrizes: Winner[];
}

export default function Winners() {
  const [gameWinners, setGameWinners] = useState<GameWinners[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Winner | null>(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const handleProfileClick = (winner: Winner) => {
    setSelectedProfile(winner);
    setShowProfilePopup(true);
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select(`
          *,
          lottery_games!winners_lottery_game_id_fkey (
            title,
            game_date
          ),
          custom_winner_games!fk_winners_custom_game_id (
            game_name,
            game_date
          )
        `)
        .eq('is_active', true)
        .order('prize_position', { ascending: true });

      if (error) throw error;
      
      // Group winners by game (both lottery and custom games)
      const grouped = (data || []).reduce((acc, winner) => {
        let gameId, gameTitle, gameDate;
        
        if (winner.custom_game_id && winner.custom_winner_games) {
          gameId = winner.custom_game_id;
          gameTitle = winner.custom_winner_games.game_name;
          gameDate = winner.custom_winner_games.game_date;
        } else if (winner.lottery_game_id && winner.lottery_games) {
          gameId = winner.lottery_game_id;
          gameTitle = winner.lottery_games.title;
          gameDate = winner.lottery_games.game_date;
        } else {
          return acc; // Skip if no valid game reference
        }
        
        const existing = acc.find(g => g.gameId === gameId);
        
        if (existing) {
          if (winner.prize_type === 'main_prize') {
            existing.mainPrizes.push(winner);
          } else {
            existing.incentivePrizes.push(winner);
          }
        } else {
          acc.push({
            gameId,
            gameTitle,
            gameDate,
            mainPrizes: winner.prize_type === 'main_prize' ? [winner] : [],
            incentivePrizes: winner.prize_type === 'incentive_prize' ? [winner] : [],
          });
        }
        
        return acc;
      }, [] as GameWinners[]);

      // Sort main prizes by position within each game
      grouped.forEach(game => {
        game.mainPrizes.sort((a, b) => a.prize_position - b.prize_position);
      });

      setGameWinners(grouped);
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const gameBackgrounds = [
    'from-purple-500/15 via-pink-500/10 to-fuchsia-500/5 border-purple-400/30',
    'from-sky-500/15 via-cyan-500/10 to-blue-500/5 border-sky-400/30',
    'from-emerald-500/15 via-green-500/10 to-teal-500/5 border-emerald-400/30',
    'from-orange-500/15 via-amber-500/10 to-red-500/5 border-orange-400/30',
    'from-indigo-500/15 via-violet-500/10 to-purple-500/5 border-indigo-400/30',
    'from-teal-500/15 via-emerald-500/10 to-green-500/5 border-teal-400/30',
  ];

  const getPrizeIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-4 h-4 md:w-6 md:h-6 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />;
      case 3: return <Award className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />;
      default: return <Award className="w-3 h-3 md:w-5 md:h-5 text-muted-foreground" />;
    }
  };

  const getPrizeBadge = (position: number) => {
    const badges = {
      1: { text: "1st Prize", className: "bg-gradient-to-r from-yellow-400/30 to-amber-500/30 text-yellow-700 dark:text-yellow-300 border border-yellow-500/40" },
      2: { text: "2nd Prize", className: "bg-gradient-to-r from-gray-300/30 to-slate-400/30 text-gray-700 dark:text-gray-300 border border-gray-400/40" },
      3: { text: "3rd Prize", className: "bg-gradient-to-r from-amber-600/30 to-orange-700/30 text-amber-800 dark:text-amber-300 border border-amber-600/40" },
    };
    const badge = badges[position as keyof typeof badges] || { text: `${position}th Prize`, className: "bg-muted" };
    return <Badge className={`${badge.className} text-[10px] md:text-xs font-semibold tracking-wide shadow-sm`}>{badge.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-3 md:py-6">
        <div className="container mx-auto px-2 md:px-4">
          <div className="animate-pulse space-y-4 md:space-y-6">
            <div className="h-6 md:h-8 bg-muted rounded w-32 md:w-48 mx-auto"></div>
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div className="h-48 md:h-64 bg-muted rounded-lg"></div>
              <div className="h-48 md:h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background to-muted/40 py-3 md:py-8 overflow-hidden">
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 spot-gold opacity-70" />
        <div className="absolute inset-0 pattern-dots opacity-[0.15]" />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-lottery-gold/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-2 md:px-4 space-y-5 md:space-y-8">
        {/* Premium Header */}
        <div className="text-center space-y-2 md:space-y-3 animate-fade-in-up">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-lottery-gold/20 via-amber-400/20 to-lottery-gold/20 border border-lottery-gold/40 backdrop-blur-sm shadow-[0_4px_20px_-4px_hsl(var(--lottery-gold)/0.5)]">
            <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-lottery-gold" />
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-lottery-gold">Hall of Fame</span>
            <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-lottery-gold" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-gold-shimmer">
            Winners Gallery
          </h1>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-lottery-gold to-transparent rounded-full mx-auto" />
          <p className="text-xs md:text-base text-muted-foreground max-w-md mx-auto">
            Celebrating the champions whose fortune turned bright
          </p>
        </div>

        {gameWinners.length === 0 ? (
          <div className="text-center py-16 md:py-24 glass-card rounded-3xl mx-auto max-w-md">
            <Trophy className="w-14 h-14 md:w-20 md:h-20 mx-auto mb-4 text-muted-foreground/60" />
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">No Winners Yet</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Winners will be announced here after the draw!</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-10">
            {gameWinners.map((game, gameIndex) => {
              const bgClass = gameBackgrounds[gameIndex % gameBackgrounds.length];
              const firstPrize = game.mainPrizes.find(w => w.prize_position === 1);
              const secondPrize = game.mainPrizes.find(w => w.prize_position === 2);
              const thirdPrize = game.mainPrizes.find(w => w.prize_position === 3);

              return (
                <Card
                  key={game.gameId}
                  className={`relative bg-gradient-to-br ${bgClass} border-2 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up backdrop-blur-sm`}
                  style={{ animationDelay: `${gameIndex * 80}ms` }}
                >
                  {/* Decorative corner accents */}
                  <div aria-hidden className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-lottery-gold/20 to-transparent rounded-bl-full pointer-events-none" />
                  <div aria-hidden className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/15 to-transparent rounded-tr-full pointer-events-none" />

                  <CardContent className="relative p-4 md:p-7 space-y-4 md:space-y-5">
                    {/* Game Title */}
                    <div className="text-center space-y-1.5">
                      <div className="inline-flex items-center gap-2">
                        <span className="h-px w-6 md:w-10 bg-gradient-to-r from-transparent to-lottery-gold/60" />
                        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] text-lottery-gold">Winners of</span>
                        <span className="h-px w-6 md:w-10 bg-gradient-to-l from-transparent to-lottery-gold/60" />
                      </div>
                      <h2 className="text-xl md:text-3xl font-display font-extrabold tracking-tight text-foreground">
                        {game.gameTitle}
                      </h2>
                    </div>

                    {/* Row 2: Game Date (if available) */}
                    {game.gameDate && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          {new Date(game.gameDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}

                    {/* Row 3: Top 3 Winners Layout */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {/* Left Column: 1st Prize */}
                      <div className="col-span-1">
                        {firstPrize && (
                          <Card className="relative bg-gradient-to-br from-yellow-400/30 via-amber-500/25 to-yellow-600/30 border-yellow-500/50 h-full overflow-hidden shadow-[0_8px_30px_-8px_rgba(234,179,8,0.5)]">
                            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                            <div aria-hidden className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400/30 rounded-full blur-2xl pointer-events-none" />
                            <CardContent className="relative p-3 md:p-5 text-center h-full flex flex-col justify-center">
                              <div className="relative mb-3 md:mb-4">
                                <div aria-hidden className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 blur-md opacity-60" />
                                <img
                                  src={firstPrize.image_url}
                                  alt={firstPrize.name}
                                  className="relative w-20 h-20 md:w-28 md:h-28 rounded-full mx-auto object-cover ring-4 ring-yellow-500/70 shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300"
                                  onClick={() => handleProfileClick(firstPrize)}
                                />
                                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full p-1.5 md:p-2.5 shadow-lg ring-2 ring-background">
                                  <Trophy className="w-3 h-3 md:w-5 md:h-5 text-white drop-shadow" />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                {getPrizeBadge(1)}
                                <h3 className="text-base md:text-xl font-display font-extrabold text-foreground tracking-tight">{firstPrize.name}</h3>
                                {firstPrize.details && (
                                  <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">{firstPrize.details}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Right Column: 2nd and 3rd Prize */}
                      <div className="col-span-1 space-y-2 md:space-y-3">
                        {secondPrize && (
                          <Card className="relative bg-gradient-to-br from-slate-300/25 via-gray-400/20 to-slate-500/25 border-gray-400/40 overflow-hidden shadow-md">
                            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            <CardContent className="relative p-2 md:p-3 text-center">
                              <div className="relative mb-1 md:mb-2">
                                <img
                                  src={secondPrize.image_url}
                                  alt={secondPrize.name}
                                  className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto object-cover ring-2 ring-gray-400/60 shadow cursor-pointer hover:scale-105 transition-transform duration-300"
                                  onClick={() => handleProfileClick(secondPrize)}
                                />
                                <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-gradient-to-br from-gray-300 to-slate-500 rounded-full p-1 shadow ring-2 ring-background">
                                  <Medal className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-white" />
                                </div>
                              </div>
                              <div className="space-y-0.5 md:space-y-1">
                                {getPrizeBadge(2)}
                                <h4 className="font-bold text-[11px] md:text-sm line-clamp-1">{secondPrize.name}</h4>
                                {secondPrize.details && (
                                  <p className="text-[8px] md:text-xs text-muted-foreground line-clamp-1">{secondPrize.details}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {thirdPrize && (
                          <Card className="relative bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-700/25 border-amber-600/40 overflow-hidden shadow-md">
                            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            <CardContent className="relative p-2 md:p-3 text-center">
                              <div className="relative mb-1 md:mb-2">
                                <img
                                  src={thirdPrize.image_url}
                                  alt={thirdPrize.name}
                                  className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto object-cover ring-2 ring-amber-600/60 shadow cursor-pointer hover:scale-105 transition-transform duration-300"
                                  onClick={() => handleProfileClick(thirdPrize)}
                                />
                                <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-gradient-to-br from-amber-500 to-orange-700 rounded-full p-1 shadow ring-2 ring-background">
                                  <Award className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-white" />
                                </div>
                              </div>
                              <div className="space-y-0.5 md:space-y-1">
                                {getPrizeBadge(3)}
                                <h4 className="font-bold text-[11px] md:text-sm line-clamp-1">{thirdPrize.name}</h4>
                                {thirdPrize.details && (
                                  <p className="text-[8px] md:text-xs text-muted-foreground line-clamp-1">{thirdPrize.details}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>

                    {/* Incentive Prizes */}
                    {game.incentivePrizes.length > 0 && (
                      <div className="space-y-2 md:space-y-3 pt-2">
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
                          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Incentive Prizes</h3>
                          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                          {game.incentivePrizes.map((winner) => (
                            <Card key={winner.id} className="group bg-gradient-to-r from-background/70 to-background/50 border-border/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-md transition-all duration-300">
                              <CardContent className="p-2 md:p-3">
                                <div className="flex items-center space-x-2 md:space-x-3">
                                  <div className="relative shrink-0">
                                    <img
                                      src={winner.image_url}
                                      alt={winner.name}
                                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-border/50 cursor-pointer group-hover:ring-primary/50 group-hover:scale-105 transition-all duration-300"
                                      onClick={() => handleProfileClick(winner)}
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5 ring-2 ring-background">
                                      <Award className="w-2 h-2 md:w-2.5 md:h-2.5 text-primary-foreground" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Badge variant="secondary" className="text-[8px] md:text-[10px] mb-1 font-medium">
                                      Incentive
                                    </Badge>
                                    <h4 className="font-semibold text-xs md:text-sm truncate text-foreground">{winner.name}</h4>
                                    {winner.details && (
                                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">{winner.details}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <ProfileImagePopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        profile={selectedProfile ? {
          display_name: selectedProfile.name,
          avatar_url: selectedProfile.image_url,
          email: ''
        } : undefined}
      />
    </div>
  );
}