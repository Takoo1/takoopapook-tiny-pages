CREATE TABLE public.lottery_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_game_id uuid NOT NULL REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  series_name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lottery_series TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lottery_series TO authenticated;
GRANT ALL ON public.lottery_series TO service_role;

ALTER TABLE public.lottery_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View series for live or owned games"
ON public.lottery_series FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.lottery_games g
  WHERE g.id = lottery_series.lottery_game_id
    AND (g.status = ANY (ARRAY['live'::game_status, 'online'::game_status, 'booking_stopped'::game_status])
         OR has_role(auth.uid(), 'admin'::app_role)
         OR g.created_by_user_id = auth.uid())
));

CREATE POLICY "Owners or admins can insert lottery series"
ON public.lottery_series FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
  SELECT 1 FROM public.lottery_games g
  WHERE g.id = lottery_series.lottery_game_id AND g.created_by_user_id = auth.uid()
));

CREATE POLICY "Owners or admins can update lottery series"
ON public.lottery_series FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
  SELECT 1 FROM public.lottery_games g
  WHERE g.id = lottery_series.lottery_game_id AND g.created_by_user_id = auth.uid()
));

CREATE POLICY "Owners or admins can delete lottery series"
ON public.lottery_series FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
  SELECT 1 FROM public.lottery_games g
  WHERE g.id = lottery_series.lottery_game_id AND g.created_by_user_id = auth.uid()
));

CREATE TRIGGER update_lottery_series_updated_at
BEFORE UPDATE ON public.lottery_series
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.lottery_books
  ADD COLUMN series_id uuid REFERENCES public.lottery_series(id) ON DELETE SET NULL;

WITH games AS (
  SELECT DISTINCT lottery_game_id FROM public.lottery_books WHERE series_id IS NULL
), created AS (
  INSERT INTO public.lottery_series (lottery_game_id, series_name, display_order)
  SELECT lottery_game_id, 'Series A', 0 FROM games
  RETURNING id, lottery_game_id
)
UPDATE public.lottery_books b
SET series_id = c.id
FROM created c
WHERE b.lottery_game_id = c.lottery_game_id AND b.series_id IS NULL;