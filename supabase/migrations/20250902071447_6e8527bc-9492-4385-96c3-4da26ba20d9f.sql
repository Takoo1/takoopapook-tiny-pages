
-- 1) Create comments table for videos
create table if not exists public.media_video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null,
  user_id uuid null,
  user_session text null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Optional but recommended index for fetching comments per video
create index if not exists idx_media_video_comments_video_created
  on public.media_video_comments (video_id, created_at desc);

-- Enable Row Level Security
alter table public.media_video_comments enable row level security;

-- Policies
-- Anyone can view comments
create policy "Anyone can view video comments"
  on public.media_video_comments
  for select
  using (true);

-- Anyone can insert comments (we'll set user_id on the client if logged-in)
create policy "Anyone can create video comments"
  on public.media_video_comments
  for insert
  with check (true);

-- Users can delete their own comments
create policy "Users can delete their own comments"
  on public.media_video_comments
  for delete
  using (auth.uid() = user_id);

-- 2) Enable realtime (optional but useful for live comments)
alter table public.media_video_comments replica identity full;

-- Add to Supabase realtime publication if not already added
-- If the publication already includes 'all tables', this will be a no-op.
alter publication supabase_realtime add table public.media_video_comments;
