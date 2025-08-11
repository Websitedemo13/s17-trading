-- Enhanced Team Management System
-- This migration adds team roles, membership limits, account types, and floating notifications

-- Create user account types enum
CREATE TYPE public.account_type AS ENUM ('basic', 'premium', 'enterprise');

-- Create team invitation status enum  
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- Create team join request status enum
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');

-- Add account type and team limit to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type public.account_type DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS max_teams INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"floating_teams": true, "sound": true, "desktop": true}';

-- Update team_members table to include more role information
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT false;

-- Create team invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team join requests table
CREATE TABLE IF NOT EXISTS public.team_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.request_status NOT NULL DEFAULT 'pending',
  message TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, requester_id)
);

-- Create floating notifications table
CREATE TABLE IF NOT EXISTS public.floating_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'team_message', -- team_message, team_invite, team_request, etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  avatar_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1, -- 1=low, 2=normal, 3=high, 4=urgent
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create account upgrade requests table
CREATE TABLE IF NOT EXISTS public.account_upgrade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_type public.account_type NOT NULL,
  current_type public.account_type NOT NULL DEFAULT 'basic',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floating_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for team invitations
CREATE POLICY "Team owners can manage invitations" ON public.team_invitations 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = team_invitations.team_id 
      AND tm.user_id = auth.uid() 
      AND (tm.role = 'admin' OR tm.is_owner = true)
    )
  );

CREATE POLICY "Users can view their own invitations" ON public.team_invitations 
  FOR SELECT USING (
    invitee_id = auth.uid() OR invitee_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can respond to their invitations" ON public.team_invitations 
  FOR UPDATE USING (
    invitee_id = auth.uid() OR invitee_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Create policies for team join requests
CREATE POLICY "Users can create join requests" ON public.team_join_requests 
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their own requests" ON public.team_join_requests 
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "Team owners can manage join requests" ON public.team_join_requests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = team_join_requests.team_id 
      AND tm.user_id = auth.uid() 
      AND (tm.role = 'admin' OR tm.is_owner = true)
    )
  );

-- Create policies for floating notifications
CREATE POLICY "Users can manage their own notifications" ON public.floating_notifications 
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for account upgrade requests
CREATE POLICY "Users can create upgrade requests" ON public.account_upgrade_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own upgrade requests" ON public.account_upgrade_requests 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all upgrade requests" ON public.account_upgrade_requests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Functions for team management

-- Function to check if user can join more teams
CREATE OR REPLACE FUNCTION can_join_team(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_team_count INTEGER;
  user_max_teams INTEGER;
BEGIN
  -- Get user's current team count and max teams
  SELECT 
    (SELECT COUNT(*) FROM public.team_members WHERE user_id = user_uuid),
    COALESCE(max_teams, 5)
  INTO user_team_count, user_max_teams
  FROM public.profiles 
  WHERE id = user_uuid;
  
  RETURN user_team_count < user_max_teams;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create floating notification
CREATE OR REPLACE FUNCTION create_floating_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_content TEXT,
  team_uuid UUID DEFAULT NULL,
  message_uuid UUID DEFAULT NULL,
  notification_avatar TEXT DEFAULT NULL,
  notification_priority INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Check if user has floating notifications enabled
  IF NOT (
    SELECT COALESCE(notification_settings->>'floating_teams', 'true')::BOOLEAN 
    FROM public.profiles 
    WHERE id = target_user_id
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Create the notification
  INSERT INTO public.floating_notifications (
    user_id, team_id, message_id, type, title, content, 
    avatar_url, priority
  ) VALUES (
    target_user_id, team_uuid, message_uuid, notification_type,
    notification_title, notification_content, notification_avatar, notification_priority
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send team message notifications
CREATE OR REPLACE FUNCTION notify_team_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Create floating notifications for all team members except the sender
  INSERT INTO public.floating_notifications (user_id, team_id, message_id, type, title, content, avatar_url)
  SELECT 
    tm.user_id,
    NEW.team_id,
    NEW.id,
    'team_message',
    (SELECT name FROM public.teams WHERE id = NEW.team_id),
    LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
    (SELECT avatar_url FROM public.profiles WHERE id = NEW.user_id)
  FROM public.team_members tm
  JOIN public.profiles p ON p.id = tm.user_id
  WHERE tm.team_id = NEW.team_id 
  AND tm.user_id != NEW.user_id
  AND COALESCE(p.notification_settings->>'floating_teams', 'true')::BOOLEAN = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team message notifications
DROP TRIGGER IF EXISTS team_message_notification_trigger ON public.chat_messages;
CREATE TRIGGER team_message_notification_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_team_message();

-- Function to upgrade user account
CREATE OR REPLACE FUNCTION upgrade_user_account(
  target_user_id UUID,
  new_account_type public.account_type,
  admin_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  new_max_teams INTEGER;
BEGIN
  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = admin_user_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can upgrade accounts';
  END IF;
  
  -- Set max teams based on account type
  CASE new_account_type
    WHEN 'basic' THEN new_max_teams := 5;
    WHEN 'premium' THEN new_max_teams := 15;
    WHEN 'enterprise' THEN new_max_teams := 50;
  END CASE;
  
  -- Update user account
  UPDATE public.profiles 
  SET 
    account_type = new_account_type,
    max_teams = new_max_teams,
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee ON public.team_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON public.team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON public.team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_join_requests_team ON public.team_join_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_team_join_requests_requester ON public.team_join_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_floating_notifications_user ON public.floating_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_floating_notifications_unread ON public.floating_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_account_upgrade_requests_status ON public.account_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_team_members_owner ON public.team_members(team_id, is_owner) WHERE is_owner = true;

-- Enable realtime for new tables
ALTER TABLE public.team_invitations REPLICA IDENTITY FULL;
ALTER TABLE public.team_join_requests REPLICA IDENTITY FULL;
ALTER TABLE public.floating_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.account_upgrade_requests REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER publication supabase_realtime ADD TABLE public.team_invitations;
ALTER publication supabase_realtime ADD TABLE public.team_join_requests;
ALTER publication supabase_realtime ADD TABLE public.floating_notifications;
ALTER publication supabase_realtime ADD TABLE public.account_upgrade_requests;

-- Create triggers for updated_at
CREATE TRIGGER update_team_invitations_updated_at 
  BEFORE UPDATE ON public.team_invitations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_join_requests_updated_at 
  BEFORE UPDATE ON public.team_join_requests 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_upgrade_requests_updated_at 
  BEFORE UPDATE ON public.account_upgrade_requests 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Set first user as admin (for development)
UPDATE public.profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM public.profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);
