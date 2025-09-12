
-- 1) Ensure exactly one trigger executes update_fc_balance on INSERT into fc_transactions
do $$
declare
  trig record;
  kept boolean := false;
begin
  -- Drop duplicate triggers that call update_fc_balance (keep only one)
  for trig in
    select tgname
    from pg_trigger
    where tgrelid = 'public.fc_transactions'::regclass
      and not tgisinternal
      and position('update_fc_balance' in pg_get_triggerdef(oid)) > 0
  loop
    if not kept then
      kept := true; -- keep the first one found
    else
      execute format('drop trigger %I on public.fc_transactions', trig.tgname);
    end if;
  end loop;

  -- If none exist (edge case), create a single correct trigger
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.fc_transactions'::regclass
      and not tgisinternal
      and position('update_fc_balance' in pg_get_triggerdef(oid)) > 0
  ) then
    create trigger fc_balance_update_trigger
      after insert on public.fc_transactions
      for each row execute function public.update_fc_balance();
  end if;
end
$$;

-- 2) Reconcile balances to the true sum of transactions
-- Upsert balances for users who have any transactions
insert into public.fc_balances (user_id, balance, updated_at)
select user_id, coalesce(sum(amount_fc), 0)::integer as balance, now()
from public.fc_transactions
group by user_id
on conflict (user_id) do update
set balance = excluded.balance,
    updated_at = now();

-- For any balance rows without transactions, set balance to 0 (safety)
update public.fc_balances fb
set balance = 0,
    updated_at = now()
where not exists (
  select 1 from public.fc_transactions ft
  where ft.user_id = fb.user_id
);
