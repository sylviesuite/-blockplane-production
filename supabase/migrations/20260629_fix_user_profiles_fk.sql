-- Fix user_profiles FK to reference auth.users directly.
--
-- Background: the user_profiles table may have been created with its id
-- column referencing a public.users shadow table (common Supabase tutorial
-- pattern) rather than auth.users directly. If the trigger that populates
-- public.users from auth.users is missing, every signup produces a 409 FK
-- violation even though auth.users has the row. This migration corrects the
-- FK to point at auth.users(id), which is the correct target given the app
-- uses auth.uid() in all RLS policies.

-- 1. Drop the existing FK on user_profiles.id (whatever it points to).
DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT tc.constraint_name
    INTO v_constraint
    FROM information_schema.table_constraints  tc
    JOIN information_schema.key_column_usage   kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema    = kcu.table_schema
   WHERE tc.constraint_type = 'FOREIGN KEY'
     AND tc.table_schema    = 'public'
     AND tc.table_name      = 'user_profiles'
     AND kcu.column_name    = 'id'
   LIMIT 1;

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.user_profiles DROP CONSTRAINT %I', v_constraint);
    RAISE NOTICE 'Dropped FK constraint: %', v_constraint;
  ELSE
    RAISE NOTICE 'No FK on user_profiles.id found — will add one.';
  END IF;
END;
$$;

-- 2. Delete any user_profiles rows whose id has no matching auth.users row.
--    These are orphans that would cause the FK constraint to fail on validation.
--    Log them first so there's a record.
DO $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count
    FROM public.user_profiles p
    LEFT JOIN auth.users u ON u.id = p.id
   WHERE u.id IS NULL;

  IF v_count > 0 THEN
    RAISE NOTICE 'Deleting % orphaned user_profiles row(s) with no matching auth.users entry.', v_count;
    DELETE FROM public.user_profiles p
     WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
  ELSE
    RAISE NOTICE 'No orphaned rows found — safe to proceed.';
  END IF;
END;
$$;

-- 3. Re-add the FK pointing directly at auth.users.
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users (id)
  ON DELETE CASCADE;

-- 4. Ensure user_profiles.id is the primary key (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.table_constraints
     WHERE table_schema    = 'public'
       AND table_name      = 'user_profiles'
       AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE public.user_profiles ADD PRIMARY KEY (id);
    RAISE NOTICE 'Added PRIMARY KEY on user_profiles.id';
  END IF;
END;
$$;
