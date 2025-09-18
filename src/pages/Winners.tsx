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
    'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    'from-green-500/10 to-emerald-500/10 border-green-500/20',
    'from-orange-500/10 to-red-500/10 border-orange-500/20',
    'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
    'from-teal-500/10 to-green-500/10 border-teal-500/20',
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
      1: { text: "1st Prize", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      2: { text: "2nd Prize", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
      3: { text: "3rd Prize", className: "bg-amber-600/10 text-amber-700 dark:text-amber-400" },
    };
    const badge = badges[position as keyof typeof badges] || { text: `${position}th Prize`, className: "bg-muted" };
    return <Badge className={`${badge.className} text-[10px] md:text-xs`}>{badge.text}</Badge>;
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
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-3 md:py-6">
      <div className="container mx-auto px-2 md:px-4 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-lottery-gold to-accent bg-clip-text text-transparent">
            🏆 Winners Gallery
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">Celebrating our lucky winners!</p>
        </div>

        {gameWinners.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <Trophy className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-muted-foreground" />
            <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">No Winners Yet</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Winners will be announced here after the draw!</p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-10">
            {gameWinners.map((game, gameIndex) => {
              const bgClass = gameBackgrounds[gameIndex % gameBackgrounds.length];
              const firstPrize = game.mainPrizes.find(w => w.prize_position === 1);
              const secondPrize = game.mainPrizes.find(w => w.prize_position === 2);
              const thirdPrize = game.mainPrizes.find(w => w.prize_position === 3);

              return (
                <Card key={game.gameId} className={`bg-gradient-to-br ${bgClass} overflow-hidden`}>
                  <CardContent className="p-3 md:p-6 space-y-3 md:space-y-4">
                    {/* Row 1: Game Name with "Winners of" prefix */}
                    <div className="text-center">
                      <h2 className="text-2xl md:text-3xl font-bold">
                        <span className="text-primary">Winners of </span>
                        <span className="text-foreground">{game.gameTitle}</span>
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
                          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border-yellow-500/30 h-full">
                            <CardContent className="p-3 md:p-4 text-center h-full flex flex-col justify-center">
                              <div className="relative mb-2 md:mb-3">
                                <img
                                  src={firstPrize.image_url}
                                  alt={firstPrize.name}
                                  className="w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto object-cover border-2 md:border-3 border-yellow-500/50 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleProfileClick(firstPrize)}
                                />
                                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-yellow-500 rounded-full p-1 md:p-2">
                                  <Trophy className="w-3 h-3 md:w-5 md:h-5 text-white" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                {getPrizeBadge(1)}
                                <h3 className="text-sm md:text-lg font-bold">{firstPrize.name}</h3>
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
                        {/* 2nd Prize (top of right column) */}
                        {secondPrize && (
                          <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/20 border-gray-500/30">
                            <CardContent className="p-2 md:p-3 text-center">
                              <div className="relative mb-1 md:mb-2">
                                <img
                                  src={secondPrize.image_url}
                                  alt={secondPrize.name}
                                  className="w-10 h-10 md:w-14 md:h-14 rounded-full mx-auto object-cover border-2 border-gray-500/40 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleProfileClick(secondPrize)}
                                />
                                <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-gray-500 rounded-full p-1">
                                  <Medal className="w-2 h-2 md:w-3 md:h-3 text-white" />
                                </div>
                              </div>
                              <div className="space-y-0.5 md:space-y-1">
                                {getPrizeBadge(2)}
                                <h4 className="font-bold text-[10px] md:text-sm line-clamp-1">{secondPrize.name}</h4>
                                {secondPrize.details && (
                                  <p className="text-[8px] md:text-xs text-muted-foreground line-clamp-1">{secondPrize.details}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* 3rd Prize (bottom of right column) */}
                        {thirdPrize && (
                          <Card className="bg-gradient-to-br from-amber-600/10 to-amber-700/20 border-amber-600/30">
                            <CardContent className="p-2 md:p-3 text-center">
                              <div className="relative mb-1 md:mb-2">
                                <img
                                  src={thirdPrize.image_url}
                                  alt={thirdPrize.name}
                                  className="w-10 h-10 md:w-14 md:h-14 rounded-full mx-auto object-cover border-2 border-amber-600/40 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleProfileClick(thirdPrize)}
                                />
                                <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-amber-600 rounded-full p-1">
                                  <Award className="w-2 h-2 md:w-3 md:h-3 text-white" />
                                </div>
                              </div>
                              <div className="space-y-0.5 md:space-y-1">
                                {getPrizeBadge(3)}
                                <h4 className="font-bold text-[10px] md:text-sm line-clamp-1">{thirdPrize.name}</h4>
                                {thirdPrize.details && (
                                  <p className="text-[8px] md:text-xs text-muted-foreground line-clamp-1">{thirdPrize.details}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Incentive Prizes - Vertical Stack */}
                    {game.incentivePrizes.length > 0 && (
                      <div className="space-y-2 md:space-y-3">
                        <h3 className="text-sm md:text-lg font-semibold text-center">Incentive Prizes</h3>
                        <div className="space-y-1 md:space-y-2">
                          {game.incentivePrizes.map((winner) => (
                            <Card key={winner.id} className="bg-gradient-to-r from-background/50 to-background/80 border-border/50">
                              <CardContent className="p-2 md:p-3">
                                <div className="flex items-center space-x-2 md:space-x-3">
                                  <div className="relative">
                                    <img
                                      src={winner.image_url}
                                      alt={winner.name}
                                      className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover border border-muted cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => handleProfileClick(winner)}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 md:space-x-2 mb-0.5 md:mb-1">
                                      <Badge variant="secondary" className="text-[8px] md:text-xs">
                                        Incentive Prize
                                      </Badge>
                                    </div>
                                    <h4 className="font-semibold text-xs md:text-sm truncate">{winner.name}</h4>
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