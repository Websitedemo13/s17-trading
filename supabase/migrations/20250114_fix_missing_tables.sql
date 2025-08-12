-- Fix missing tables that are causing the errors

-- Create floating_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.floating_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'team_message',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  avatar_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'message',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  avatar_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all notification tables
ALTER TABLE public.floating_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for floating_notifications
DROP POLICY IF EXISTS "Users can manage their own floating notifications" ON public.floating_notifications;
CREATE POLICY "Users can manage their own floating notifications" ON public.floating_notifications 
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for team_notifications
DROP POLICY IF EXISTS "Users can manage their own team notifications" ON public.team_notifications;
CREATE POLICY "Users can manage their own team notifications" ON public.team_notifications 
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for user_activities
DROP POLICY IF EXISTS "Users can view their own activities" ON public.user_activities;
CREATE POLICY "Users can view their own activities" ON public.user_activities
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activities" ON public.user_activities;
CREATE POLICY "Users can insert their own activities" ON public.user_activities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_sessions
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_floating_notifications_user_id ON public.floating_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_floating_notifications_unread ON public.floating_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_team_notifications_user_id ON public.team_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_team_notifications_unread ON public.team_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Enable realtime for notification tables
ALTER TABLE public.floating_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.team_notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
DO $$ 
BEGIN
    -- Try to add tables to realtime publication, ignore errors if already exists
    BEGIN
        ALTER publication supabase_realtime ADD TABLE public.floating_notifications;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Ignore if already exists
    END;
    
    BEGIN
        ALTER publication supabase_realtime ADD TABLE public.team_notifications;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Ignore if already exists
    END;
    
    BEGIN
        ALTER publication supabase_realtime ADD TABLE public.user_activities;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Ignore if already exists
    END;
    
    BEGIN
        ALTER publication supabase_realtime ADD TABLE public.user_sessions;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Ignore if already exists
    END;
END $$;

-- Function to safely create profile if missing
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(user_id UUID, user_email TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
    profile_email TEXT;
BEGIN
    -- Check if profile exists
    SELECT id INTO profile_id FROM public.profiles WHERE id = user_id;
    
    IF profile_id IS NULL THEN
        -- Get email from auth.users if not provided
        IF user_email IS NULL THEN
            SELECT email INTO profile_email FROM auth.users WHERE id = user_id;
        ELSE
            profile_email := user_email;
        END IF;
        
        -- Create profile with all required fields
        INSERT INTO public.profiles (
            id, 
            email, 
            display_name, 
            role, 
            account_type,
            theme_preference,
            language,
            timezone,
            currency,
            privacy_profile,
            notification_email,
            notification_push,
            notification_sms,
            privacy_portfolio,
            privacy_activity,
            two_factor_enabled,
            email_verified,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            profile_email,
            COALESCE(split_part(profile_email, '@', 1), 'User'),
            'user'::public.user_role,
            'free'::public.account_type,
            'system'::public.theme_preference,
            'vi',
            'Asia/Ho_Chi_Minh',
            'USD',
            'public'::public.privacy_profile,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            NOW(),
            NOW()
        ) RETURNING id INTO profile_id;
        
        -- Log the profile creation
        INSERT INTO public.user_activities (user_id, activity_type, activity_data, created_at)
        VALUES (
            user_id,
            'profile_created',
            jsonb_build_object('email', profile_email, 'timestamp', NOW()::text),
            NOW()
        );
    END IF;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists TO authenticated;

-- Create trigger to ensure profile exists when accessing it
CREATE OR REPLACE FUNCTION public.trigger_ensure_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Only for authenticated requests
    IF auth.uid() IS NOT NULL THEN
        PERFORM public.ensure_profile_exists(auth.uid());
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.floating_notifications IS 'Floating notifications for real-time UI feedback';
COMMENT ON TABLE public.team_notifications IS 'Team-based notifications for collaboration';
COMMENT ON TABLE public.user_activities IS 'User activity logging for audit and analytics';
COMMENT ON TABLE public.user_sessions IS 'Active user sessions across devices';
COMMENT ON FUNCTION public.ensure_profile_exists IS 'Safely creates a profile if it does not exist';

SELECT 'Missing tables and functions created successfully!' as message;
