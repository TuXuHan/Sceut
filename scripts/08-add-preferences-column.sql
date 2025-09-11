-- 08-add-preferences-column.sql
-- Adds a JSONB “preferences” column if it does not already exist.

DO $$
BEGIN
  ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS preferences jsonb
  DEFAULT '{}'::jsonb;
EXCEPTION
  WHEN duplicate_column THEN
    -- Column already exists; ignore.
END $$;
