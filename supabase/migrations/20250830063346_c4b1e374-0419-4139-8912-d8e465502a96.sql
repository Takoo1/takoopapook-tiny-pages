
-- 1) Store per-game serial number overlay configuration
-- We keep everything in a single JSONB column so the editor can evolve without future migrations.
ALTER TABLE public.lottery_games
ADD COLUMN IF NOT EXISTS ticket_serial_config jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.lottery_games.ticket_serial_config IS
'Editor-driven configuration for the serial number overlay. Expected keys:
{
  "position": { "xPct": number, "yPct": number },      -- top-left, percentage of image width/height
  "size": { "wPct": number, "hPct": number },          -- box width/height in %
  "rotation": number,                                  -- degrees
  "prefix": "Sl. No.",                                 -- editable label
  "digitCount": number,                                -- e.g. 5 => 00001
  "format": "Sl. No. {number}",                        -- optional format pattern
  "background": { "type": "none|color|image|preset", "color": "#000000", "opacity": 0.85, "radiusPct": 50, "imageUrl": null, "preset": "pill|tag|rounded" },
  "text": { "fontFamily": "Inter", "fontWeight": 700, "fontSizePctOfHeight": 60, "color": "#ffffff", "letterSpacing": 0.02, "align": "center",
            "shadow": { "blur": 2, "offsetX": 0, "offsetY": 1, "color": "rgba(0,0,0,.35)" } },
  "paddingPct": { "x": 6, "y": 4 }                     -- inner padding as % of box
}';

-- 2) Optional storage for a rendered ticket image URL (MVP can render on-demand; this is for caching/persisting if desired)
ALTER TABLE public.lottery_tickets
ADD COLUMN IF NOT EXISTS rendered_ticket_url text,
ADD COLUMN IF NOT EXISTS rendered_at timestamptz;

-- 3) Indexes to keep MyTickets queries fast
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_booked_by_user ON public.lottery_tickets (booked_by_user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery_game ON public.lottery_tickets (lottery_game_id);

-- 4) RLS: let buyers view their own tickets regardless of game status
-- Existing policy allows viewing tickets of live/owned games; this one ensures buyers can always see their own.
CREATE POLICY "Users can view their own purchased tickets"
  ON public.lottery_tickets
  FOR SELECT
  USING (booked_by_user_id = auth.uid());

-- 5) RLS: let buyers view games they have tickets in (needed to fetch ticket_image_url and overlay config)
CREATE POLICY "Buyers can view games they purchased tickets in"
  ON public.lottery_games
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM public.lottery_tickets t
    WHERE t.lottery_game_id = lottery_games.id
      AND t.booked_by_user_id = auth.uid()
  ));
