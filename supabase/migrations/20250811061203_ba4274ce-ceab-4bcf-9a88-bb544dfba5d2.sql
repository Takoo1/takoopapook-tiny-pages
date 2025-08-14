
-- 1) Create booking_cancellations table to record traveler cancellation reasons and track status
create table if not exists public.booking_cancellations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'processing',
  user_session text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists booking_cancellations_booking_id_idx on public.booking_cancellations(booking_id);
create index if not exists booking_cancellations_created_at_idx on public.booking_cancellations(created_at desc);

-- 2) RLS (match existing permissive project patterns)
alter table public.booking_cancellations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'booking_cancellations'
      and policyname = 'Allow all operations on booking_cancellations'
  ) then
    create policy "Allow all operations on booking_cancellations"
      on public.booking_cancellations
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- 3) Auto-update updated_at on booking_cancellations
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_booking_cancellations_updated_at'
  ) then
    create trigger set_booking_cancellations_updated_at
      before update on public.booking_cancellations
      for each row
      execute function public.update_updated_at_column();
  end if;
end $$;

-- 4) Ensure bookings.updated_at auto-updates on update
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_bookings_updated_at'
  ) then
    create trigger set_bookings_updated_at
      before update on public.bookings
      for each row
      execute function public.update_bookings_updated_at();
  end if;
end $$;
