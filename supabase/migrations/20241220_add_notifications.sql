-- Add notifications table for team notifications
CREATE TABLE IF NOT EXISTS public.team_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'team_invite', 'team_join', 'team_leave', 'role_change', 'team_update')),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID,
    read BOOLEAN DEFAULT FALSE,
    dismissible BOOLEAN DEFAULT TRUE,
    auto_dismiss_ms INTEGER DEFAULT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add indexes for performance
CREATE INDEX team_notifications_team_id_idx ON public.team_notifications(team_id);
CREATE INDEX team_notifications_user_id_idx ON public.team_notifications(user_id);
CREATE INDEX team_notifications_read_idx ON public.team_notifications(read);
CREATE INDEX team_notifications_type_idx ON public.team_notifications(type);
CREATE INDEX team_notifications_created_at_idx ON public.team_notifications(created_at DESC);

-- Add RLS policies
ALTER TABLE public.team_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.team_notifications
    FOR SELECT USING (
        user_id = auth.uid() OR 
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for team admins to create notifications
CREATE POLICY "Team admins can create notifications" ON public.team_notifications
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy for users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON public.team_notifications
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Add team activities table for activity tracking
CREATE TABLE IF NOT EXISTS public.team_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('member_joined', 'member_left', 'role_changed', 'team_created', 'team_updated', 'message_sent', 'file_shared')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for team activities
CREATE INDEX team_activities_team_id_idx ON public.team_activities(team_id);
CREATE INDEX team_activities_user_id_idx ON public.team_activities(user_id);
CREATE INDEX team_activities_type_idx ON public.team_activities(activity_type);
CREATE INDEX team_activities_created_at_idx ON public.team_activities(created_at DESC);

-- Add RLS for team activities
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- Policy for team members to view activities
CREATE POLICY "Team members can view activities" ON public.team_activities
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for team members to create activities
CREATE POLICY "Team members can create activities" ON public.team_activities
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Add function to automatically create notifications for team events
CREATE OR REPLACE FUNCTION create_team_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle team member join
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'team_members' THEN
        INSERT INTO public.team_notifications (
            title,
            message,
            type,
            team_id,
            metadata
        ) VALUES (
            'Thành viên mới tham gia',
            'Có thành viên mới vừa tham gia nhóm',
            'team_join',
            NEW.team_id,
            jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role)
        );
        
        -- Create activity log
        INSERT INTO public.team_activities (
            team_id,
            user_id,
            activity_type,
            description,
            metadata
        ) VALUES (
            NEW.team_id,
            NEW.user_id,
            'member_joined',
            'Đã tham gia nhóm',
            jsonb_build_object('role', NEW.role)
        );
    END IF;
    
    -- Handle team member leave
    IF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'team_members' THEN
        INSERT INTO public.team_notifications (
            title,
            message,
            type,
            team_id,
            metadata
        ) VALUES (
            'Thành viên rời khỏi nhóm',
            'Có thành viên vừa rời khỏi nhóm',
            'team_leave',
            OLD.team_id,
            jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role)
        );
        
        -- Create activity log
        INSERT INTO public.team_activities (
            team_id,
            user_id,
            activity_type,
            description,
            metadata
        ) VALUES (
            OLD.team_id,
            OLD.user_id,
            'member_left',
            'Đã rời khỏi nhóm',
            jsonb_build_object('role', OLD.role)
        );
    END IF;
    
    -- Handle role changes
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'team_members' AND OLD.role != NEW.role THEN
        INSERT INTO public.team_notifications (
            title,
            message,
            type,
            team_id,
            metadata
        ) VALUES (
            'Quyền thành viên được thay đổi',
            'Quyền của một thành viên trong nhóm đã được cập nhật',
            'role_change',
            NEW.team_id,
            jsonb_build_object('user_id', NEW.user_id, 'old_role', OLD.role, 'new_role', NEW.role)
        );
        
        -- Create activity log
        INSERT INTO public.team_activities (
            team_id,
            user_id,
            activity_type,
            description,
            metadata
        ) VALUES (
            NEW.team_id,
            NEW.user_id,
            'role_changed',
            'Quyền được thay đổi từ ' || OLD.role || ' thành ' || NEW.role,
            jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic notifications
CREATE TRIGGER team_member_notification_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION create_team_notification();

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.team_notifications 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup function (would need to be set up in production)
-- SELECT cron.schedule('cleanup-notifications', '0 */6 * * *', 'SELECT cleanup_expired_notifications();');
