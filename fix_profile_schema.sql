-- Emergency fix for profile schema - run this directly in Supabase SQL editor

-- First, ensure the enum types exist
DO $$ 
BEGIN
    -- Create account_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE public.account_type AS ENUM ('free', 'premium', 'enterprise');
    END IF;
    
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'premium');
    END IF;
    
    -- Create privacy_profile enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_profile') THEN
        CREATE TYPE public.privacy_profile AS ENUM ('public', 'private', 'friends');
    END IF;
    
    -- Create theme_preference enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_preference') THEN
        CREATE TYPE public.theme_preference AS ENUM ('light', 'dark', 'system');
    END IF;
END $$;

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type public.account_type DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_sms BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference public.theme_preference DEFAULT 'system';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'vi';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_profile public.privacy_profile DEFAULT 'public';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_portfolio BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_activity BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS backup_codes TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- Update existing profiles with default values and sync email from auth.users
UPDATE profiles SET 
  role = COALESCE(role, 'user'::public.user_role),
  account_type = COALESCE(account_type, 'free'::public.account_type),
  email = COALESCE(email, (SELECT email FROM auth.users WHERE id = profiles.id)),
  theme_preference = COALESCE(theme_preference, 'system'::public.theme_preference),
  language = COALESCE(language, 'vi'),
  timezone = COALESCE(timezone, 'Asia/Ho_Chi_Minh'),
  currency = COALESCE(currency, 'USD'),
  privacy_profile = COALESCE(privacy_profile, 'public'::public.privacy_profile),
  notification_email = COALESCE(notification_email, true),
  notification_push = COALESCE(notification_push, true),
  notification_sms = COALESCE(notification_sms, false),
  privacy_portfolio = COALESCE(privacy_portfolio, false),
  privacy_activity = COALESCE(privacy_activity, false),
  two_factor_enabled = COALESCE(two_factor_enabled, false),
  email_verified = COALESCE(email_verified, false)
WHERE role IS NULL OR account_type IS NULL OR email IS NULL;

-- Set admin role for the main admin account
UPDATE profiles SET 
  role = 'admin'::public.user_role,
  account_type = 'enterprise'::public.account_type
WHERE email = 'quachthanhlong2k3@gmail.com';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update the trigger function for new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, role, account_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user'::public.user_role,
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

-- Refresh schema cache
ANALYZE profiles;

SELECT 'Profile schema fix completed successfully!' as message;
