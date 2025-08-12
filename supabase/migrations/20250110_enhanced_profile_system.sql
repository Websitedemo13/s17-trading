-- Enhanced Profile System Migration
-- This migration adds comprehensive profile fields and supporting tables

-- First, let's enhance the existing profiles table
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

-- Create User Activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);

-- Create User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active DESC);

-- Create Security Settings table
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  backup_codes_generated_at TIMESTAMP WITH TIME ZONE,
  recovery_email VARCHAR(255),
  security_questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dashboard_layout JSONB DEFAULT '{}',
  chart_preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  portfolio_display_options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars
CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete their own avatar" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Enable RLS on all new tables
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activities
CREATE POLICY "Users can view their own activities" ON user_activities
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON user_activities
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities" ON user_activities
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON user_sessions
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for user_security_settings
CREATE POLICY "Users can view their own security settings" ON user_security_settings
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings" ON user_security_settings
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings" ON user_security_settings
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  -- Create default user preferences
  INSERT INTO user_preferences (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default security settings
  INSERT INTO user_security_settings (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- Log user registration activity
  INSERT INTO user_activities (user_id, activity_type, activity_data, created_at)
  VALUES (
    NEW.id,
    'user_registered',
    jsonb_build_object(
      'email', NEW.email,
      'timestamp', NOW()::text
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update last_login_at on sign in
CREATE OR REPLACE FUNCTION handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_login_at in profiles
  UPDATE profiles 
  SET last_login_at = NOW(), updated_at = NOW()
  WHERE id = NEW.user_id;

  -- Log login activity
  INSERT INTO user_activities (user_id, activity_type, activity_data, created_at)
  VALUES (
    NEW.user_id,
    'user_login',
    jsonb_build_object(
      'timestamp', NOW()::text,
      'session_id', NEW.id
    ),
    NOW()
  );

  -- Create or update session record
  INSERT INTO user_sessions (id, user_id, device_info, ip_address, user_agent, last_active, created_at)
  VALUES (
    NEW.id,
    NEW.user_id,
    COALESCE(NEW.data->>'user_agent', 'Unknown Device'),
    (NEW.data->>'ip')::inet,
    NEW.data->>'user_agent',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    last_active = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for login tracking (if auth.sessions table exists)
-- Note: This might need adjustment based on your Supabase version
-- DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;
-- CREATE TRIGGER on_auth_session_created
--   AFTER INSERT ON auth.sessions
--   FOR EACH ROW EXECUTE FUNCTION handle_user_login();

-- Function to clean up old activities (keep last 1000 per user)
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS void AS $$
BEGIN
  DELETE FROM user_activities
  WHERE id IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM user_activities
    ) t
    WHERE t.rn > 1000
  );
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old sessions (remove sessions older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE last_active < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Full text search index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING gin(
  to_tsvector('english', 
    COALESCE(display_name, '') || ' ' || 
    COALESCE(bio, '') || ' ' || 
    COALESCE(company, '') || ' ' ||
    COALESCE(location, '')
  )
);

-- Add some sample data for testing
INSERT INTO user_activities (user_id, activity_type, activity_data, created_at)
SELECT 
  id,
  'profile_viewed',
  jsonb_build_object('timestamp', NOW()::text),
  NOW()
FROM profiles
WHERE id IN (SELECT id FROM profiles LIMIT 5)
ON CONFLICT DO NOTHING;

-- Create a view for user stats
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.id,
  p.display_name,
  p.email,
  p.created_at as joined_at,
  p.last_login_at,
  COUNT(DISTINCT po.id) as portfolio_count,
  COUNT(DISTINCT ua.id) as activity_count,
  COALESCE(SUM(po.amount * po.avg_price), 0) as total_portfolio_value
FROM profiles p
LEFT JOIN portfolios po ON p.id = po.user_id
LEFT JOIN user_activities ua ON p.id = ua.user_id AND ua.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id, p.display_name, p.email, p.created_at, p.last_login_at;

-- Grant necessary permissions
GRANT SELECT ON user_stats TO authenticated;

COMMENT ON TABLE user_activities IS 'Tracks all user activities for audit and analytics';
COMMENT ON TABLE user_sessions IS 'Manages active user sessions across devices';
COMMENT ON TABLE user_security_settings IS 'Stores security-related settings and configurations';
COMMENT ON TABLE user_preferences IS 'Stores user interface and application preferences';
COMMENT ON VIEW user_stats IS 'Provides aggregated statistics for users';
