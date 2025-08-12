-- Enhanced Chat Features Migration
-- This migration adds support for reactions, typing indicators, file attachments,
-- read receipts, message threads, and user presence

-- Create message_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create message_attachments table for file uploads
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create typing_indicators table for real-time typing status
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create user_presence table for online status
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline', -- online, away, busy, offline
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_read_receipts table for read status
CREATE TABLE IF NOT EXISTS public.message_read_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Add new columns to chat_messages for enhanced features
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text', -- text, file, image, system
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.chat_messages(id),
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for message_reactions
CREATE POLICY "Team members can read reactions" ON public.message_reactions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm 
      JOIN public.team_members tm ON tm.team_id = cm.team_id 
      WHERE cm.id = message_reactions.message_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own reactions" ON public.message_reactions 
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for message_attachments
CREATE POLICY "Team members can read attachments" ON public.message_attachments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm 
      JOIN public.team_members tm ON tm.team_id = cm.team_id 
      WHERE cm.id = message_attachments.message_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Message authors can manage attachments" ON public.message_attachments 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm 
      WHERE cm.id = message_attachments.message_id 
      AND cm.user_id = auth.uid()
    )
  );

-- Create policies for typing_indicators
CREATE POLICY "Team members can read typing indicators" ON public.typing_indicators 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = typing_indicators.team_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own typing status" ON public.typing_indicators 
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for user_presence
CREATE POLICY "Users can read all presence data" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Users can manage their own presence" ON public.user_presence FOR ALL USING (auth.uid() = user_id);

-- Create policies for message_read_receipts
CREATE POLICY "Team members can read receipts" ON public.message_read_receipts 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm 
      JOIN public.team_members tm ON tm.team_id = cm.team_id 
      WHERE cm.id = message_read_receipts.message_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own read receipts" ON public.message_read_receipts 
  FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_typing_indicators_updated_at 
  BEFORE UPDATE ON public.typing_indicators 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at 
  BEFORE UPDATE ON public.user_presence 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically clear typing indicators after timeout
CREATE OR REPLACE FUNCTION clear_stale_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE updated_at < now() - interval '10 seconds';
END;
$$ language 'plpgsql';

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(user_uuid UUID, new_status TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status, last_seen, updated_at)
  VALUES (user_uuid, new_status, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    status = new_status,
    last_seen = now(),
    updated_at = now();
END;
$$ language 'plpgsql';

-- Function to automatically create read receipts
CREATE OR REPLACE FUNCTION create_read_receipt(msg_id UUID, reader_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.message_read_receipts (message_id, user_id)
  VALUES (msg_id, reader_id)
  ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$ language 'plpgsql';

-- Enable realtime for new tables
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.message_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.message_read_receipts REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER publication supabase_realtime ADD TABLE public.message_reactions;
ALTER publication supabase_realtime ADD TABLE public.message_attachments;
ALTER publication supabase_realtime ADD TABLE public.typing_indicators;
ALTER publication supabase_realtime ADD TABLE public.user_presence;
ALTER publication supabase_realtime ADD TABLE public.message_read_receipts;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_team_id ON public.typing_indicators(team_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON public.user_presence(status);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON public.message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON public.chat_messages(reply_to);
