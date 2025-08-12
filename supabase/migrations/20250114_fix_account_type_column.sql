-- Fix account_type column schema conflict
-- This migration resolves the conflict between ENUM and TEXT types for account_type

-- First, check if the enum type exists and create if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE public.account_type AS ENUM ('free', 'premium', 'enterprise');
    END IF;
END $$;

-- Drop the old column if it has wrong type and recreate it
DO $$ 
DECLARE
    column_type TEXT;
BEGIN
    -- Check current column type
    SELECT data_type INTO column_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'account_type';
    
    -- If column exists but is not the enum type, fix it
    IF column_type IS NOT NULL AND column_type != 'USER-DEFINED' THEN
        -- Update any 'basic' values to 'free' for consistency
        UPDATE profiles SET account_type = 'free' WHERE account_type = 'basic';
        
        -- Drop and recreate the column with proper type
        ALTER TABLE profiles DROP COLUMN IF EXISTS account_type;
        ALTER TABLE profiles ADD COLUMN account_type public.account_type DEFAULT 'free';
        
        -- Create index
        CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
    ELSIF column_type IS NULL THEN
        -- Column doesn't exist, create it
        ALTER TABLE profiles ADD COLUMN account_type public.account_type DEFAULT 'free';
        CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
    END IF;
END $$;

-- Ensure role column exists with proper constraints
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'premium'));

-- Ensure email column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Update existing profiles to have default values where NULL
UPDATE profiles SET 
  role = COALESCE(role, 'user'),
  account_type = COALESCE(account_type, 'free'::public.account_type),
  email = COALESCE(email, (SELECT email FROM auth.users WHERE id = profiles.id))
WHERE role IS NULL OR account_type IS NULL OR email IS NULL;

-- Set admin account
UPDATE profiles SET 
  role = 'admin',
  account_type = 'enterprise'::public.account_type
WHERE email = 'quachthanhlong2k3@gmail.com';

-- Ensure the trigger function exists for new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, role, account_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user',
    'free'::public.account_type,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Refresh the schema cache by updating table statistics
ANALYZE profiles;

-- Add helpful comments
COMMENT ON COLUMN profiles.account_type IS 'User account type: free, premium, enterprise';
COMMENT ON COLUMN profiles.role IS 'User role: user, admin, premium';
