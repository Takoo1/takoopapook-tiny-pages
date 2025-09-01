
-- 1) Enum for attachment media type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_media_type') THEN
    CREATE TYPE public.notification_media_type AS ENUM ('image', 'video', 'pdf');
  END IF;
END$$;

-- 2) Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins can manage all notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Admins can manage notifications'
  ) THEN
    CREATE POLICY "Admins can manage notifications"
    ON public.notifications
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;

-- Public can view active notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Public can view active notifications'
  ) THEN
    CREATE POLICY "Public can view active notifications"
    ON public.notifications
    FOR SELECT
    USING (is_active = true);
  END IF;
END$$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_notifications_updated_at'
  ) THEN
    CREATE TRIGGER set_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 3) Notification attachments (support multiple media per notification)
CREATE TABLE IF NOT EXISTS public.notification_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  media_type public.notification_media_type NOT NULL,
  url TEXT NOT NULL,
  preview_url TEXT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_attachments ENABLE ROW LEVEL SECURITY;

-- Admins can manage all attachments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_attachments' AND policyname = 'Admins can manage notification attachments'
  ) THEN
    CREATE POLICY "Admins can manage notification attachments"
    ON public.notification_attachments
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;

-- Public can view attachments of active notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_attachments' AND policyname = 'Public can view attachments of active notifications'
  ) THEN
    CREATE POLICY "Public can view attachments of active notifications"
    ON public.notification_attachments
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.notifications n
        WHERE n.id = notification_attachments.notification_id
          AND n.is_active = true
      )
    );
  END IF;
END$$;

-- 4) Storage bucket for notification media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'notifications'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('notifications', 'notifications', true);
  END IF;
END$$;

-- 5) Storage policies
-- Public can read notification media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read for notifications bucket'
  ) THEN
    CREATE POLICY "Public read for notifications bucket"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'notifications');
  END IF;
END$$;

-- Admins can manage notification media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins manage notifications bucket'
  ) THEN
    CREATE POLICY "Admins manage notifications bucket"
    ON storage.objects
    FOR ALL
    USING (bucket_id = 'notifications' AND public.has_role(auth.uid(), 'admin'))
    WITH CHECK (bucket_id = 'notifications' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;
