-- Emergency fix for profile and notification errors
-- Run this directly in Supabase SQL Editor

-- 1. Ensure all enum types exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE public.account_type AS ENUM ('free', 'premium', 'enterprise');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'premium');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_profile') THEN
        CREATE TYPE public.privacy_profile AS ENUM ('public', 'private', 'friends');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_preference') THEN
        CREATE TYPE public.theme_preference AS ENUM ('light', 'dark', 'system');
    END IF;
END $$;

-- 2. Fix profiles table columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type public.account_type DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 3. Update existing profiles with missing data
UPDATE profiles SET 
  role = COALESCE(role, 'user'::public.user_role),
  account_type = COALESCE(account_type, 'free'::public.account_type),
  email = COALESCE(email, (SELECT email FROM auth.users WHERE id = profiles.id))
WHERE role IS NULL OR account_type IS NULL OR email IS NULL;

-- 4. Create missing notification tables
CREATE TABLE IF NOT EXISTS public.floating_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'message',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'message',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Enable RLS and create basic policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE floating_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile" ON profiles 
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own floating notifications" ON floating_notifications;
CREATE POLICY "Users can manage own floating notifications" ON floating_notifications 
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own team notifications" ON team_notifications;
CREATE POLICY "Users can manage own team notifications" ON team_notifications 
  FOR ALL USING (auth.uid() = user_id);

-- 6. Create profile safety function
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id UUID, user_email TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
    profile_email TEXT;
BEGIN
    SELECT id INTO profile_id FROM profiles WHERE id = user_id;
    
    IF profile_id IS NULL THEN
        IF user_email IS NULL THEN
            SELECT email INTO profile_email FROM auth.users WHERE id = user_id;
        ELSE
            profile_email := user_email;
        END IF;
        
        INSERT INTO profiles (
            id, email, display_name, role, account_type,
            created_at, updated_at
        ) VALUES (
            user_id,
            profile_email,
            COALESCE(split_part(profile_email, '@', 1), 'User'),
            'user'::public.user_role,
            'free'::public.account_type,
            NOW(),
            NOW()
        ) RETURNING id INTO profile_id;
    END IF;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;

-- 8. Set admin account
UPDATE profiles SET 
  role = 'admin'::public.user_role,
  account_type = 'enterprise'::public.account_type
WHERE email = 'quachthanhlong2k3@gmail.com';

-- Success message
SELECT 'Database emergency fix completed!' as result;
