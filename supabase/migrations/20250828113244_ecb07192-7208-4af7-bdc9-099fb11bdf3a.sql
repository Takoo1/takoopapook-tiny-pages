
-- 1) STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('media-images', 'media-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('media-videos', 'media-videos', true)
on conflict (id) do nothing;

-- 2) STORAGE POLICIES (public read; admins manage) FOR media-images
create policy "Public can read media-images"
on storage.objects for select
using (bucket_id = 'media-images');

create policy "Admins can insert media-images"
on storage.objects for insert
with check (bucket_id = 'media-images' and has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can update media-images"
on storage.objects for update
using (bucket_id = 'media-images' and has_role(auth.uid(), 'admin'::app_role))
with check (bucket_id = 'media-images' and has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete media-images"
on storage.objects for delete
using (bucket_id = 'media-images' and has_role(auth.uid(), 'admin'::app_role));

-- STORAGE POLICIES FOR media-videos
create policy "Public can read media-videos"
on storage.objects for select
using (bucket_id = 'media-videos');

create policy "Admins can insert media-videos"
on storage.objects for insert
with check (bucket_id = 'media-videos' and has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can update media-videos"
on storage.objects for update
using (bucket_id = 'media-videos' and has_role(auth.uid(), 'admin'::app_role))
with check (bucket_id = 'media-videos' and has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete media-videos"
on storage.objects for delete
using (bucket_id = 'media-videos' and has_role(auth.uid(), 'admin'::app_role));

-- 3) TABLE: media_videos
create table if not exists public.media_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,            -- storage path or public URL
  thumbnail_url text,                 -- stored in media-images
  is_active boolean not null default true,
  display_order integer not null default 1,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.media_videos enable row level security;

-- Public can view active videos
create policy "Public can view active videos"
on public.media_videos
for select
using (is_active = true);

-- Admins can view all videos
create policy "Admins can view all videos"
on public.media_videos
for select
using (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert videos
create policy "Admins can insert videos"
on public.media_videos
for insert
with check (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update videos
create policy "Admins can update videos"
on public.media_videos
for update
using (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete videos
create policy "Admins can delete videos"
on public.media_videos
for delete
using (has_role(auth.uid(), 'admin'::app_role));

-- Index for ordering and filtering
create index if not exists media_videos_active_order_idx
on public.media_videos (is_active, display_order);

-- Auto-update updated_at
drop trigger if exists trg_media_videos_updated_at on public.media_videos;
create trigger trg_media_videos_updated_at
before update on public.media_videos
for each row
execute function public.update_updated_at_column();

-- 4) TABLE: media_video_reactions
create table if not exists public.media_video_reactions (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.media_videos(id) on delete cascade,
  user_id uuid,                       -- optional if authenticated
  user_session text,                  -- optional client-generated (for guests)
  reaction_type text not null default 'like',
  created_at timestamptz not null default now()
);

-- Reaction type whitelist (immutable - OK)
alter table public.media_video_reactions
  add constraint reaction_type_valid check (reaction_type in ('like','love','wow','laugh','sad','angry'));

-- Ensure one reaction per user or session per video
create unique index if not exists ux_video_react_by_user
on public.media_video_reactions (video_id, user_id)
where user_id is not null;

create unique index if not exists ux_video_react_by_session
on public.media_video_reactions (video_id, user_session)
where user_id is null and user_session is not null;

create index if not exists idx_video_reactions_video
on public.media_video_reactions (video_id);

-- RLS
alter table public.media_video_reactions enable row level security;

-- Anyone can view reactions (counts, etc.)
create policy "Anyone can view video reactions"
on public.media_video_reactions
for select
using (true);

-- Anyone can create reactions (guest or logged in)
create policy "Anyone can create video reactions"
on public.media_video_reactions
for insert
with check (true);

-- Optional: allow authenticated users to delete their own reactions
create policy "Users can delete their own reactions"
on public.media_video_reactions
for delete
using (auth.uid() = user_id);

-- 5) TABLE: media_video_links (admin-managed ctas/links per video)
create table if not exists public.media_video_links (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.media_videos(id) on delete cascade,
  label text not null,
  url text not null,
  display_order integer not null default 1,
  is_active boolean not null default true,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.media_video_links enable row level security;

-- Public can view links for videos (no sensitive content)
create policy "Public can view video links"
on public.media_video_links
for select
using (true);

-- Admins manage video links
create policy "Admins can insert video links"
on public.media_video_links
for insert
with check (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can update video links"
on public.media_video_links
for update
using (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete video links"
on public.media_video_links
for delete
using (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
drop trigger if exists trg_media_video_links_updated_at on public.media_video_links;
create trigger trg_media_video_links_updated_at
before update on public.media_video_links
for each row
execute function public.update_updated_at_column();
