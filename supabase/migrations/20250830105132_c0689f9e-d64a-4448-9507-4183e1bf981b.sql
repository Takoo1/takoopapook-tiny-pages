
-- 1) Function to update lottery statuses on schedule
create or replace function public.update_lottery_statuses()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  -- Move Online -> Booking Stopped when stop_booking_time reached
  update public.lottery_games
  set status = 'booking_stopped'::game_status,
      updated_at = now()
  where status = 'online'::game_status
    and stop_booking_time is not null
    and now() >= stop_booking_time;

  -- Move Online/Booking Stopped -> Live when game_date reached
  update public.lottery_games
  set status = 'live'::game_status,
      updated_at = now()
  where status in ('online'::game_status, 'booking_stopped'::game_status)
    and game_date is not null
    and now() >= game_date;
end;
$$;

-- 2) Helpful indexes to optimize the scheduled updates
create index if not exists idx_lottery_games_status_stop
  on public.lottery_games (status, stop_booking_time);

create index if not exists idx_lottery_games_status_game_date
  on public.lottery_games (status, game_date);

-- 3) Schedule the function to run every minute with pg_cron
-- Requires pg_cron to be enabled in the project (it is available on Supabase Pro/Team)
do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'update-lottery-statuses-every-minute'
  ) then
    perform cron.schedule(
      'update-lottery-statuses-every-minute',
      '* * * * *',
      $$ select public.update_lottery_statuses(); $$
    );
  end if;
end;
$$;
