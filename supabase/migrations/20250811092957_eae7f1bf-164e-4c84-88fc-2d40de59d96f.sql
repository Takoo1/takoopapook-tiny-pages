-- Create trigger to auto-insert into profiles on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Ensure updated_at is maintained on profiles updates
create trigger trg_update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_profiles_updated_at();

-- Backfill existing users into profiles (defaults role to 'user')
insert into public.profiles (id)
select u.id
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;