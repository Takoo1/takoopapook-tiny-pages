
-- 1) Helper function: user_has_ticket_in_game
create or replace function public.user_has_ticket_in_game(
  p_game_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path to public
as $$
  select exists (
    select 1
    from public.lottery_tickets t
    where t.lottery_game_id = p_game_id
      and t.booked_by_user_id = p_user_id
  );
$$;

-- 2) Helper function: game_is_live_or_owned
create or replace function public.game_is_live_or_owned(
  p_game_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path to public
as $$
  select exists (
    select 1
    from public.lottery_games g
    where g.id = p_game_id
      and (
        g.status = 'live'::game_status
        or g.created_by_user_id = p_user_id
        or public.has_role(p_user_id, 'admin'::app_role)
      )
  );
$$;

-- 3) Recreate problematic policies to remove cross-table subqueries

-- lottery_games: buyers policy
drop policy if exists "Buyers can view games they purchased tickets in" on public.lottery_games;

create policy "Buyers can view games they purchased tickets in"
on public.lottery_games
for select
using (public.user_has_ticket_in_game(lottery_games.id, auth.uid()));

-- lottery_tickets: visibility policy
drop policy if exists "View tickets for live or owned games" on public.lottery_tickets;

create policy "View tickets for live or owned games"
on public.lottery_tickets
for select
using (public.game_is_live_or_owned(lottery_tickets.lottery_game_id, auth.uid()));
