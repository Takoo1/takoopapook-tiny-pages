-- Add foreign key on planned_packages.package_id to public.packages(id) so relational selects work
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'planned_packages'
      AND tc.constraint_name = 'planned_packages_package_id_fkey'
  ) THEN
    ALTER TABLE public.planned_packages
    ADD CONSTRAINT planned_packages_package_id_fkey
    FOREIGN KEY (package_id)
    REFERENCES public.packages(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure a unique constraint exists on (package_id, user_session) (in case only an index was created)
DO $$
BEGIN
  -- Create a unique constraint if not already backed by a constraint
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'planned_packages'
      AND tc.constraint_type = 'UNIQUE'
      AND tc.constraint_name = 'planned_packages_package_id_user_session_key'
  ) THEN
    -- Drop any existing non-constraint unique index to avoid duplication
    DROP INDEX IF EXISTS public.idx_planned_packages_unique;
    ALTER TABLE public.planned_packages
    ADD CONSTRAINT planned_packages_package_id_user_session_key
    UNIQUE (package_id, user_session);
  END IF;
END $$;