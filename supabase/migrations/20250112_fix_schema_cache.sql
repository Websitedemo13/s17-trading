-- Fix schema cache issues and add missing profile fields
-- This migration ensures all profile fields are properly defined

-- First, let's ensure the profiles table has all necessary fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'premium'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'free' CHECK (account_type IN ('free', 'premium', 'enterprise'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add bio and extended profile fields that might be missing
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

-- Notification preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_sms BOOLEAN DEFAULT false;

-- Appearance and localization
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'vi';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Privacy settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_profile VARCHAR(10) DEFAULT 'public' CHECK (privacy_profile IN ('public', 'private', 'friends'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_portfolio BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_activity BOOLEAN DEFAULT false;

-- Security settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS backup_codes TEXT[];

-- Update timestamps
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to include role-based access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Function to update profile with proper validation
CREATE OR REPLACE FUNCTION update_profile_safe(
  user_id UUID,
  profile_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  current_user_role TEXT;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  -- Check if user can update this profile
  IF auth.uid() != user_id AND current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update other user profiles';
  END IF;

  -- Update the profile
  UPDATE profiles SET
    display_name = COALESCE(profile_data->>'display_name', display_name),
    bio = COALESCE(profile_data->>'bio', bio),
    phone = COALESCE(profile_data->>'phone', phone),
    location = COALESCE(profile_data->>'location', location),
    company = COALESCE(profile_data->>'company', company),
    website = COALESCE(profile_data->>'website', website),
    github_url = COALESCE(profile_data->>'github_url', github_url),
    twitter_url = COALESCE(profile_data->>'twitter_url', twitter_url),
    linkedin_url = COALESCE(profile_data->>'linkedin_url', linkedin_url),
    facebook_url = COALESCE(profile_data->>'facebook_url', facebook_url),
    instagram_url = COALESCE(profile_data->>'instagram_url', instagram_url),
    notification_email = COALESCE((profile_data->>'notification_email')::BOOLEAN, notification_email),
    notification_push = COALESCE((profile_data->>'notification_push')::BOOLEAN, notification_push),
    notification_sms = COALESCE((profile_data->>'notification_sms')::BOOLEAN, notification_sms),
    theme_preference = COALESCE(profile_data->>'theme_preference', theme_preference),
    language = COALESCE(profile_data->>'language', language),
    timezone = COALESCE(profile_data->>'timezone', timezone),
    currency = COALESCE(profile_data->>'currency', currency),
    privacy_profile = COALESCE(profile_data->>'privacy_profile', privacy_profile),
    privacy_portfolio = COALESCE((profile_data->>'privacy_portfolio')::BOOLEAN, privacy_portfolio),
    privacy_activity = COALESCE((profile_data->>'privacy_activity')::BOOLEAN, privacy_activity),
    two_factor_enabled = COALESCE((profile_data->>'two_factor_enabled')::BOOLEAN, two_factor_enabled),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING to_jsonb(profiles.*) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_profile_safe TO authenticated;

-- Update existing profiles to have default values
UPDATE profiles SET 
  role = COALESCE(role, 'user'),
  account_type = COALESCE(account_type, 'free'),
  theme_preference = COALESCE(theme_preference, 'system'),
  language = COALESCE(language, 'vi'),
  timezone = COALESCE(timezone, 'Asia/Ho_Chi_Minh'),
  currency = COALESCE(currency, 'USD'),
  privacy_profile = COALESCE(privacy_profile, 'public'),
  notification_email = COALESCE(notification_email, true),
  notification_push = COALESCE(notification_push, true),
  notification_sms = COALESCE(notification_sms, false),
  privacy_portfolio = COALESCE(privacy_portfolio, false),
  privacy_activity = COALESCE(privacy_activity, false),
  two_factor_enabled = COALESCE(two_factor_enabled, false),
  email_verified = COALESCE(email_verified, false)
WHERE role IS NULL OR account_type IS NULL;

-- Set admin role for the main admin account
UPDATE profiles SET 
  role = 'admin',
  account_type = 'enterprise'
WHERE email = 'quachthanhlong2k3@gmail.com';

COMMENT ON TABLE profiles IS 'User profiles with extended fields for comprehensive user management';
COMMENT ON COLUMN profiles.role IS 'User role: user, admin, premium';
COMMENT ON COLUMN profiles.account_type IS 'Account type: free, premium, enterprise';
COMMENT ON COLUMN profiles.theme_preference IS 'UI theme preference: light, dark, system';
COMMENT ON COLUMN profiles.language IS 'User interface language preference';
COMMENT ON COLUMN profiles.currency IS 'Preferred currency for display';
