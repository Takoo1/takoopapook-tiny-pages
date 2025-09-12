
-- 1) Enforce status rules and auto-pending for organiser edits
create or replace function public.enforce_lottery_game_status_rules()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_is_admin boolean := public.has_role(auth.uid(), 'admin'::app_role);
  v_user uuid := auth.uid();
begin
  -- Manual status restrictions
  if NEW.status is distinct from OLD.status then
    -- Live/Booking Stopped are automatic-only
    if NEW.status in ('live'::game_status, 'booking_stopped'::game_status)
       and coalesce(current_setting('app.allow_status_change', true), 'false') <> 'true' then
      raise exception 'Statuses live and booking_stopped are automatic-only';
    end if;

    -- Only admins can set Online
    if NEW.status = 'online'::game_status and not v_is_admin then
      raise exception 'Only admins can set status to online';
    end if;

    -- Only admins can Archive
    if NEW.status = 'archived'::game_status and not v_is_admin then
      raise exception 'Only admins can set status to archived';
    end if;
  end if;

  -- Organiser edits: flip to Pending (unless archived)
  if not v_is_admin and v_user is not null and NEW.created_by_user_id = v_user then
    if (
      coalesce(NEW.title,'') is distinct from coalesce(OLD.title,'') or
      NEW.game_date is distinct from OLD.game_date or
      NEW.stop_booking_time is distinct from OLD.stop_booking_time or
      NEW.ticket_price is distinct from OLD.ticket_price or
      NEW.total_tickets is distinct from OLD.total_tickets or
      coalesce(NEW.description,'') is distinct from coalesce(OLD.description,'') or
      coalesce(NEW.ticket_image_url,'') is distinct from coalesce(OLD.ticket_image_url,'') or
      coalesce(NEW.organiser_logo_url,'') is distinct from coalesce(OLD.organiser_logo_url,'') or
      coalesce(NEW.headline,'') is distinct from coalesce(OLD.headline,'') or
      coalesce(NEW.live_draw_url,'') is distinct from coalesce(OLD.live_draw_url,'') or
      coalesce(NEW.contact_phone,'') is distinct from coalesce(OLD.contact_phone,'') or
      coalesce(NEW.contact_email,'') is distinct from coalesce(OLD.contact_email,'') or
      coalesce(NEW.organising_group_name,'') is distinct from coalesce(OLD.organising_group_name,'') or
      NEW.ticket_serial_config is distinct from OLD.ticket_serial_config
    ) then
      if OLD.status <> 'archived'::game_status then
        NEW.status := 'pending'::game_status;
      end if;
    end if;
  end if;

  return NEW;
end;
$$;

-- 2) Attach trigger to lottery_games (idempotent)
drop trigger if exists trg_enforce_lottery_game_status on public.lottery_games;
create trigger trg_enforce_lottery_game_status
before update on public.lottery_games
for each row
execute function public.enforce_lottery_game_status_rules();

-- 3) Ensure the scheduled function uses a safe guard to allow automatic transitions
create or replace function public.update_lottery_statuses()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  -- Allow automatic transitions in the trigger via a guarded setting
  perform set_config('app.allow_status_change', 'true', true);

  -- Online -> Booking Stopped at stop_booking_time
  update public.lottery_games
  set status = 'booking_stopped'::game_status,
      updated_at = now()
  where status = 'online'::game_status
    and stop_booking_time is not null
    and now() >= stop_booking_time;

  -- Online/Booking Stopped -> Live at game_date
  update public.lottery_games
  set status = 'live'::game_status,
      updated_at = now()
  where status in ('online'::game_status, 'booking_stopped'::game_status)
    and game_date is not null
    and now() >= game_date;
end;
$$;
