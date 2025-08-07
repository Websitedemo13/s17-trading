import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  fetchMessages: (teamId: string) => Promise<void>;
  sendMessage: (teamId: string, content: string) => Promise<boolean>;
  subscribeToMessages: (teamId: string) => () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,

  fetchMessages: async (teamId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messages = data?.map(message => ({
        ...message,
        user: { display_name: 'User', avatar_url: null }
      })) || [];

      set({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải tin nhắn",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (teamId: string, content: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          team_id: teamId,
          user_id: userData.user.id,
          content
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn",
        variant: "destructive"
      });
      return false;
    }
  },

  subscribeToMessages: (teamId: string) => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `team_id=eq.${teamId}`
        },
        (payload) => {
          console.log('New message:', payload);
          get().fetchMessages(teamId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));