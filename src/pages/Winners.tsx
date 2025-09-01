import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface Winner {
  id: string;
  name: string;
  prize_position: number;
  details: string | null;
  image_url: string;
  is_active: boolean;
}

export default function Winners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .eq('is_active', true)
        .order('prize_position', { ascending: true });

      if (error) throw error;
      setWinners(data || []);
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const firstPrize = winners.find(w => w.prize_position === 1);
  const secondPrize = winners.find(w => w.prize_position === 2);
  const thirdPrize = winners.find(w => w.prize_position === 3);
  const otherWinners = winners.filter(w => w.prize_position > 3);

  const getPrizeIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <Award className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPrizeBadge = (position: number) => {
    const badges = {
      1: { text: "1st Prize", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      2: { text: "2nd Prize", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
      3: { text: "3rd Prize", className: "bg-amber-600/10 text-amber-700 dark:text-amber-400" },
    };
    const badge = badges[position as keyof typeof badges] || { text: `${position}th Prize`, className: "bg-muted" };
    return <Badge className={badge.className}>{badge.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-6">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-6">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-lottery-gold to-accent bg-clip-text text-transparent">
            🏆 Winners Gallery
          </h1>
          <p className="text-muted-foreground">Celebrating our lucky winners!</p>
        </div>

        {winners.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Winners Yet</h2>
            <p className="text-muted-foreground">Winners will be announced here after the draw!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Winners Section */}
            {(firstPrize || secondPrize || thirdPrize) && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-center">Top Winners</h2>
                
                {/* 1st Prize - Large Card */}
                {firstPrize && (
                  <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-600/10 border-yellow-500/20 mx-auto max-w-md">
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <img
                          src={firstPrize.image_url}
                          alt={firstPrize.name}
                          className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-yellow-500/30"
                        />
                        <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {getPrizeBadge(1)}
                        <h3 className="text-xl font-bold">{firstPrize.name}</h3>
                        {firstPrize.details && (
                          <p className="text-sm text-muted-foreground">{firstPrize.details}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 2nd and 3rd Prize - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {secondPrize && (
                    <Card className="bg-gradient-to-br from-gray-500/5 to-gray-600/10 border-gray-500/20">
                      <CardContent className="p-4 text-center">
                        <div className="relative mb-3">
                          <img
                            src={secondPrize.image_url}
                            alt={secondPrize.name}
                            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gray-500/30"
                          />
                          <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-1.5">
                            <Medal className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          {getPrizeBadge(2)}
                          <h3 className="text-lg font-bold">{secondPrize.name}</h3>
                          {secondPrize.details && (
                            <p className="text-sm text-muted-foreground">{secondPrize.details}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {thirdPrize && (
                    <Card className="bg-gradient-to-br from-amber-600/5 to-amber-700/10 border-amber-600/20">
                      <CardContent className="p-4 text-center">
                        <div className="relative mb-3">
                          <img
                            src={thirdPrize.image_url}
                            alt={thirdPrize.name}
                            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-amber-600/30"
                          />
                          <div className="absolute -top-1 -right-1 bg-amber-600 rounded-full p-1.5">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          {getPrizeBadge(3)}
                          <h3 className="text-lg font-bold">{thirdPrize.name}</h3>
                          {thirdPrize.details && (
                            <p className="text-sm text-muted-foreground">{thirdPrize.details}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Other Winners - Vertical List */}
            {otherWinners.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-center">Other Winners</h2>
                <div className="space-y-3 max-w-2xl mx-auto">
                  {otherWinners.map((winner) => (
                    <Card key={winner.id} className="bg-gradient-to-r from-card to-card/80 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={winner.image_url}
                              alt={winner.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-border"
                            />
                            <div className="absolute -top-1 -right-1 bg-muted rounded-full p-1">
                              {getPrizeIcon(winner.prize_position)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {getPrizeBadge(winner.prize_position)}
                            </div>
                            <h3 className="font-semibold truncate">{winner.name}</h3>
                            {winner.details && (
                              <p className="text-sm text-muted-foreground truncate">{winner.details}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}