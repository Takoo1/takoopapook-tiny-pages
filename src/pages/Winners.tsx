import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Calendar, Sparkles, Crown } from "lucide-react";
import { ProfileImagePopup } from "@/components/ProfileImagePopup";
import { format } from "date-fns";

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
  lottery_games?: { title: string; game_date: string };
  custom_winner_games?: { game_name: string; game_date: string };
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
          lottery_games!winners_lottery_game_id_fkey ( title, game_date ),
          custom_winner_games!fk_winners_custom_game_id ( game_name, game_date )
        `)
        .eq('is_active', true)
        .order('prize_position', { ascending: true });

      if (error) throw error;

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
          return acc;
        }

        const existing = acc.find(g => g.gameId === gameId);
        if (existing) {
          if (winner.prize_type === 'main_prize') existing.mainPrizes.push(winner);
          else existing.incentivePrizes.push(winner);
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

      grouped.forEach(g => g.mainPrizes.sort((a, b) => a.prize_position - b.prize_position));

      // Sort games by date desc so latest is first
      grouped.sort((a, b) => {
        const da = a.gameDate ? new Date(a.gameDate).getTime() : 0;
        const db = b.gameDate ? new Date(b.gameDate).getTime() : 0;
        return db - da;
      });

      setGameWinners(grouped);
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrizeLabel = (position: number) => {
    if (position === 1) return "1st Prize";
    if (position === 2) return "2nd Prize";
    if (position === 3) return "3rd Prize";
    return `${position}th Prize`;
  };

  const getPrizeIcon = (position: number, className = "w-3.5 h-3.5") => {
    if (position === 1) return <Trophy className={className} />;
    if (position === 2) return <Medal className={className} />;
    return <Award className={className} />;
  };

  const statusChip = (label: string) => (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.1em] whitespace-nowrap"
      style={{
        background: 'hsl(var(--noir-gold)/0.14)',
        color: 'hsl(var(--noir-gold))',
        border: '1px solid hsl(var(--noir-gold)/0.45)',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--noir-gold))' }} />
      {label}
    </span>
  );

  const ambient = (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.18]"
        style={{ background: 'radial-gradient(circle, hsl(var(--noir-gold)/0.6), transparent 60%)' }}
      />
      <div
        className="absolute top-1/2 -left-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, hsl(var(--noir-gold)/0.5), transparent 60%)' }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen relative font-['Manrope']">
        {ambient}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-5">
          <div>
            <div className="home-eyebrow">Hall of Fame</div>
            <h1 className="home-section-title text-2xl md:text-3xl">Winners</h1>
          </div>
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-52 rounded-[24px]" />)}
        </div>
      </div>
    );
  }

  if (gameWinners.length === 0) {
    return (
      <div className="min-h-screen relative font-['Manrope']">
        {ambient}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-4 pb-24">
          <div className="mb-6">
            <div className="home-eyebrow">Hall of Fame</div>
            <h1 className="home-section-title text-2xl md:text-3xl">Winners</h1>
          </div>
          <div className="home-empty mx-auto max-w-md text-center py-14 px-6 animate-fade-in-up">
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(var(--noir-mid))', border: '1px solid hsl(var(--noir-gold)/0.35)' }}
            >
              <Trophy className="w-8 h-8" style={{ color: 'hsl(var(--noir-gold))' }} />
            </div>
            <h3 className="home-section-title text-lg mb-1">No Winners Yet</h3>
            <p className="text-sm mb-5" style={{ color: 'hsl(var(--noir-cream)/0.7)' }}>
              Results will appear here right after each draw. Stay tuned.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const featuredGame = gameWinners[0];
  const featuredWinner = featuredGame?.mainPrizes.find(w => w.prize_position === 1);
  const restGames = featuredWinner ? gameWinners.slice(1) : gameWinners;

  const renderGameCard = (game: GameWinners, index: number) => {
    const first = game.mainPrizes.find(w => w.prize_position === 1);
    const rest = game.mainPrizes.filter(w => w.prize_position !== 1);

    return (
      <section
        key={game.gameId}
        className="relative rounded-[24px] p-4 md:p-6 overflow-hidden animate-fade-in-up"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--noir-mid)/0.28), hsl(var(--noir-deep)/0.6))',
          border: '1px solid hsl(var(--noir-gold)/0.18)',
          boxShadow: '0 10px 32px -18px hsl(0 0% 0% / 0.55)',
          animationDelay: `${index * 60}ms`,
        }}
      >
        {/* Group header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <div className="home-eyebrow mb-1">Result</div>
            <h3
              className="text-base md:text-lg font-extrabold leading-tight truncate"
              style={{ color: 'hsl(var(--noir-cream))' }}
            >
              {game.gameTitle}
            </h3>
            {game.gameDate && (
              <div
                className="flex items-center gap-1.5 mt-2 text-xs"
                style={{ color: 'hsl(var(--noir-cream)/0.7)' }}
              >
                <Calendar className="w-3.5 h-3.5" style={{ color: 'hsl(var(--noir-gold))' }} />
                {format(new Date(game.gameDate), 'dd MMM yyyy')}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">{statusChip('RESULT DECLARED')}</div>
        </div>

        {/* Winners grid */}
        <div className="space-y-3">
          {first && renderWinnerRow(first, true)}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rest.map(w => renderWinnerRow(w, false))}
            </div>
          )}
        </div>

        {/* Incentive prizes */}
        {game.incentivePrizes.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-5 mb-3">
              <span className="h-px flex-1" style={{ background: 'hsl(var(--noir-gold)/0.2)' }} />
              <span
                className="text-[10px] font-bold tracking-[0.18em] uppercase"
                style={{ color: 'hsl(var(--noir-cream)/0.65)' }}
              >
                Incentive Prizes
              </span>
              <span className="h-px flex-1" style={{ background: 'hsl(var(--noir-gold)/0.2)' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {game.incentivePrizes.map(w => (
                <div
                  key={w.id}
                  className="flex items-center gap-3 rounded-[16px] px-3 py-2.5"
                  style={{
                    background: 'hsl(var(--noir-charcoal)/0.6)',
                    border: '1px solid hsl(var(--noir-gold)/0.15)',
                  }}
                >
                  <img
                    src={w.image_url}
                    alt={w.name}
                    onClick={() => handleProfileClick(w)}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer flex-shrink-0"
                    style={{ border: '1px solid hsl(var(--noir-gold)/0.35)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[10px] font-bold tracking-wider uppercase"
                      style={{ color: 'hsl(var(--noir-gold)/0.85)' }}
                    >
                      Incentive
                    </div>
                    <div
                      className="text-sm font-semibold truncate"
                      style={{ color: 'hsl(var(--noir-cream))' }}
                    >
                      {w.name}
                    </div>
                    {w.details && (
                      <div
                        className="text-[11px] truncate"
                        style={{ color: 'hsl(var(--noir-cream)/0.6)' }}
                      >
                        {w.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    );
  };

  const renderWinnerRow = (w: Winner, isFirst: boolean) => (
    <div
      key={w.id}
      className="relative flex items-center gap-3 rounded-[18px] p-3 overflow-hidden"
      style={{
        background: isFirst
          ? 'linear-gradient(90deg, hsl(var(--noir-gold)/0.14), hsl(var(--noir-charcoal)/0.6))'
          : 'hsl(var(--noir-charcoal)/0.6)',
        border: isFirst
          ? '1px solid hsl(var(--noir-gold)/0.4)'
          : '1px solid hsl(var(--noir-gold)/0.18)',
        boxShadow: isFirst
          ? '0 8px 22px -14px hsl(var(--noir-gold)/0.5)'
          : '0 6px 18px -12px hsl(0 0% 0% / 0.55)',
      }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={w.image_url}
          alt={w.name}
          onClick={() => handleProfileClick(w)}
          className={`rounded-full object-cover cursor-pointer transition-transform hover:scale-105 ${
            isFirst ? 'w-16 h-16' : 'w-12 h-12'
          }`}
          style={{
            border: isFirst
              ? '2px solid hsl(var(--noir-gold))'
              : '1px solid hsl(var(--noir-gold)/0.35)',
          }}
        />
        <div
          className="absolute -bottom-1 -right-1 rounded-full p-1 flex items-center justify-center"
          style={{
            background: 'hsl(var(--noir-deep))',
            border: '1px solid hsl(var(--noir-gold)/0.5)',
            color: 'hsl(var(--noir-gold))',
          }}
        >
          {getPrizeIcon(w.prize_position, isFirst ? 'w-3.5 h-3.5' : 'w-3 h-3')}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[10px] font-bold tracking-[0.14em] uppercase"
            style={{ color: 'hsl(var(--noir-gold))' }}
          >
            {getPrizeLabel(w.prize_position)}
          </span>
          {isFirst && <Sparkles className="w-3 h-3" style={{ color: 'hsl(var(--noir-gold))' }} />}
        </div>
        <div
          className={`font-extrabold truncate ${isFirst ? 'text-base' : 'text-sm'}`}
          style={{ color: 'hsl(var(--noir-cream))' }}
        >
          {w.name}
        </div>
        {w.details && (
          <div
            className="text-xs truncate"
            style={{ color: 'hsl(var(--noir-cream)/0.65)' }}
          >
            {w.details}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative font-['Manrope']">
      {ambient}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="home-eyebrow">Hall of Fame</div>
          <h1 className="home-section-title text-2xl md:text-3xl">Results & Winners</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--noir-cream)/0.7)' }}>
            Celebrating the champions of every Fortuna Link draw.
          </p>
        </div>

        {/* Featured Winner */}
        {featuredWinner && (
          <section
            className="relative rounded-[24px] p-5 md:p-6 overflow-hidden animate-fade-in-up"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--noir-gold)/0.16), hsl(var(--noir-mid)/0.6) 60%, hsl(var(--noir-deep)/0.8))',
              border: '1px solid hsl(var(--noir-gold)/0.4)',
              boxShadow: '0 16px 42px -20px hsl(var(--noir-gold)/0.45)',
            }}
          >
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(circle, hsl(var(--noir-gold)/0.6), transparent 60%)' }}
            />
            <div className="relative flex items-center justify-between mb-4">
              <div className="home-eyebrow flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" style={{ color: 'hsl(var(--noir-gold))' }} />
                Featured Winner
              </div>
              {statusChip('LATEST RESULT')}
            </div>

            <div className="relative flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={featuredWinner.image_url}
                  alt={featuredWinner.name}
                  onClick={() => handleProfileClick(featuredWinner)}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover cursor-pointer"
                  style={{
                    border: '2px solid hsl(var(--noir-gold))',
                    boxShadow: '0 10px 28px -12px hsl(var(--noir-gold)/0.55)',
                  }}
                />
                <div
                  className="absolute -bottom-1 -right-1 rounded-full p-1.5"
                  style={{
                    background: 'hsl(var(--noir-deep))',
                    border: '1px solid hsl(var(--noir-gold)/0.6)',
                    color: 'hsl(var(--noir-gold))',
                  }}
                >
                  <Trophy className="w-4 h-4" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1"
                  style={{ color: 'hsl(var(--noir-gold))' }}
                >
                  1st Prize · {featuredGame.gameTitle}
                </div>
                <div
                  className="text-xl md:text-2xl font-extrabold leading-tight truncate"
                  style={{ color: 'hsl(var(--noir-cream))' }}
                >
                  {featuredWinner.name}
                </div>
                {featuredWinner.details && (
                  <div
                    className="text-sm mt-0.5 truncate"
                    style={{ color: 'hsl(var(--noir-cream)/0.75)' }}
                  >
                    {featuredWinner.details}
                  </div>
                )}
                {featuredGame.gameDate && (
                  <div
                    className="flex items-center gap-1.5 mt-2 text-xs"
                    style={{ color: 'hsl(var(--noir-cream)/0.7)' }}
                  >
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'hsl(var(--noir-gold))' }} />
                    {format(new Date(featuredGame.gameDate), 'dd MMM yyyy')}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Latest Result (full featured game breakdown) */}
        {featuredGame && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2
                className="text-sm font-bold tracking-[0.14em] uppercase"
                style={{ color: 'hsl(var(--noir-cream))' }}
              >
                Latest Result
              </h2>
              <span className="text-xs font-semibold" style={{ color: 'hsl(var(--noir-gold))' }}>
                {featuredGame.mainPrizes.length + featuredGame.incentivePrizes.length} winners
              </span>
            </div>
            {renderGameCard(featuredGame, 0)}
          </div>
        )}

        {/* Past Results */}
        {restGames.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2
                className="text-sm font-bold tracking-[0.14em] uppercase"
                style={{ color: 'hsl(var(--noir-cream))' }}
              >
                Past Results
              </h2>
              <span className="text-xs font-semibold" style={{ color: 'hsl(var(--noir-gold))' }}>
                {restGames.length}
              </span>
            </div>
            {restGames.map((g, i) => renderGameCard(g, i + 1))}
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
