
-- 1) Ensure fc_balances updates whenever a transaction is inserted
drop trigger if exists trg_update_fc_balance on public.fc_transactions;

create trigger trg_update_fc_balance
after insert on public.fc_transactions
for each row
execute function public.update_fc_balance();

-- 2) Fix Fortune Counter to count bookings by booked_at (not record created_at)
create or replace function public.get_fortune_counter(game_id uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  last_reset_date timestamptz;
  online_tickets_since_reset integer;
begin
  -- Get the most recent reset date for this game
  select max(reset_date) into last_reset_date
  from public.fortune_counter_resets
  where lottery_game_id = game_id;

  if last_reset_date is null then
    -- Count all online-sold tickets if no reset
    select count(*) into online_tickets_since_reset
    from public.lottery_tickets
    where lottery_game_id = game_id
      and status = 'sold_online';
  else
    -- Count tickets sold online since last reset based on when they were booked
    select count(*) into online_tickets_since_reset
    from public.lottery_tickets
    where lottery_game_id = game_id
      and status = 'sold_online'
      and booked_at >= last_reset_date;
  end if;

  return coalesce(online_tickets_since_reset, 0);
end;
$function$;

-- 3) Backfill balances so existing users reflect all past transactions
--    (This fixes the current "FC not deducted/credited" perception immediately)
insert into public.fc_balances (user_id, balance, created_at, updated_at)
select t.user_id, sum(t.amount_fc) as balance, now(), now()
from public.fc_transactions t
group by t.user_id
on conflict (user_id) do update
set balance = excluded.balance,
    updated_at = now();
