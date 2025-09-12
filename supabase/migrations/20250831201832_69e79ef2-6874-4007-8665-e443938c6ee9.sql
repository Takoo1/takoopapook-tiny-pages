
-- 1) Membership table to allow multiple organisers/admins to manage a game
create table if not exists public.lottery_game_members (
  id uuid primary key default gen_random_uuid(),
  lottery_game_id uuid not null,
  user_id uuid not null,
  role text not null default 'organiser',
  added_by_user_id uuid,
  created_at timestamptz not null default now(),
  unique (lottery_game_id, user_id)
);

-- Helpful indexes
create index if not exists idx_lgm_user_id on public.lottery_game_members (user_id);
create index if not exists idx_lgm_game_id on public.lottery_game_members (lottery_game_id);

alter table public.lottery_game_members enable row level security;

-- Users can view their own memberships
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'lottery_game_members' and policyname = 'Users can view their game memberships'
  ) then
    create policy "Users can view their game memberships"
    on public.lottery_game_members
    for select
    using (auth.uid() = user_id);
  end if;
end;
$$;

-- 2) Backfill: make creators members of their own games (idempotent)
insert into public.lottery_game_members (lottery_game_id, user_id, role, added_by_user_id)
select g.id, g.created_by_user_id, 'organiser', g.created_by_user_id
from public.lottery_games g
where g.created_by_user_id is not null
on conflict (lottery_game_id, user_id) do nothing;

-- 3) Ensure game_code is unique for easier sharing (allows multiple NULLs)
create unique index if not exists ux_lottery_games_game_code on public.lottery_games (game_code);

-- 4) Secure RPC to join by code + password
create or replace function public.join_lottery_game_by_code(p_game_code text, p_password text)
returns uuid
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user uuid := auth.uid();
  v_game_id uuid;
  v_stored_password text;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  -- Require organiser or admin
  if not (public.has_role(v_user, 'admin'::app_role) or public.has_role(v_user, 'organiser'::app_role)) then
    raise exception 'Only organisers or admins can join games';
  end if;

  select id, game_password
    into v_game_id, v_stored_password
  from public.lottery_games
  where game_code = p_game_code
  limit 1;

  if v_game_id is null then
    raise exception 'Invalid game code or password';
  end if;

  if coalesce(v_stored_password, '') <> coalesce(p_password, '') then
    raise exception 'Invalid game code or password';
  end if;

  insert into public.lottery_game_members (lottery_game_id, user_id, role, added_by_user_id)
  values (v_game_id, v_user, 'organiser', v_user)
  on conflict (lottery_game_id, user_id) do nothing;

  return v_game_id;
end;
$$;

-- 5) Update RLS policies to include members as managers (owners OR members OR admins)

-- lottery_games: organisers can view their own games (extend to members)
alter policy "Organisers can view their own lottery games"
on public.lottery_games
using (
  created_by_user_id = auth.uid()
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_games.id
      and m.user_id = auth.uid()
  )
);

-- lottery_games: owners or admins can update (extend to members)
alter policy "Owners or admins can update lottery games"
on public.lottery_games
for update
using (
  public.has_role(auth.uid(), 'admin'::app_role)
  or created_by_user_id = auth.uid()
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_games.id
      and m.user_id = auth.uid()
  )
);

-- lottery_books: insert/update for owners OR members OR admins
alter policy "Owners or admins can insert lottery books"
on public.lottery_books
for insert
with check (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_books.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_books.lottery_game_id
      and m.user_id = auth.uid()
  )
);

alter policy "Owners or admins can update lottery books"
on public.lottery_books
for update
using (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_books.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_books.lottery_game_id
      and m.user_id = auth.uid()
  )
);

-- lottery_prizes: ALL (manage) for owners OR members OR admins
alter policy "Admins or owners can manage lottery prizes"
on public.lottery_prizes
using (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_prizes.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_prizes.lottery_game_id
      and m.user_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_prizes.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_prizes.lottery_game_id
      and m.user_id = auth.uid()
  )
);

-- lottery_terms: ALL for owners OR members OR admins
alter policy "Admins or owners can manage lottery terms"
on public.lottery_terms
using (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_terms.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_terms.lottery_game_id
      and m.user_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_terms.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_terms.lottery_game_id
      and m.user_id = auth.uid()
  )
);

-- organising committee: ALL for owners OR members OR admins
alter policy "Admins or owners can manage organising committee"
on public.lottery_organising_committee
using (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_organising_committee.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_organising_committee.lottery_game_id
      and m.user_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_organising_committee.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_organising_committee.lottery_game_id
      and m.user_id = auth.uid()
  )
);

-- lottery_tickets: allow owners OR members OR admins to create tickets (generation/maintenance)
alter policy "Owners or admins can create lottery tickets"
on public.lottery_tickets
for insert
with check (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.lottery_tickets.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.lottery_tickets.lottery_game_id
      and m.user_id = auth.uid()
  )
);

-- fortune_counter_resets: organisers can reset for their games (extend to members)
alter policy "Organizers can reset their own games fortune counter"
on public.fortune_counter_resets
for insert
with check (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.fortune_counter_resets.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.fortune_counter_resets.lottery_game_id
      and m.user_id = auth.uid()
  )
);

alter policy "Organizers can update their own games fortune counter resets"
on public.fortune_counter_resets
for update
using (
  public.has_role(auth.uid(), 'admin'::app_role)
  or exists (
    select 1 from public.lottery_games g
    where g.id = public.fortune_counter_resets.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.fortune_counter_resets.lottery_game_id
      and m.user_id = auth.uid()
  )
);

-- fortune_counter_requests: organisers can view/update for their games (extend to members)
alter policy "Organizers can update requests for their games"
on public.fortune_counter_requests
for update
using (
  exists (
    select 1 from public.lottery_games g
    where g.id = public.fortune_counter_requests.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.fortune_counter_requests.lottery_game_id
      and m.user_id = auth.uid()
  )
);

alter policy "Organizers can view requests for their games"
on public.fortune_counter_requests
for select
using (
  exists (
    select 1 from public.lottery_games g
    where g.id = public.fortune_counter_requests.lottery_game_id
      and g.created_by_user_id = auth.uid()
  )
  or exists (
    select 1 from public.lottery_game_members m
    where m.lottery_game_id = public.fortune_counter_requests.lottery_game_id
      and m.user_id = auth.uid()
  )
);
