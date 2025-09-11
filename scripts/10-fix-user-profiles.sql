-- Add email column to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create or replace the ensure_user_profile function
CREATE OR REPLACE FUNCTION ensure_user_profile(
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user profile
  INSERT INTO user_profiles (id, name, email, quiz_answers, preferences)
  VALUES (p_user_id, p_name, p_email, NULL, NULL)
  ON CONFLICT (id) 
  DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_user_profile(UUID, TEXT, TEXT) TO authenticated;
