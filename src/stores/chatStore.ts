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
      // First check if user is authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Check if user is member of the team
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', userData.user.id)
        .single();

      if (memberError || !memberData) {
        throw new Error('Bạn không có quyền truy cập nhóm này');
      }

      // Fetch messages
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Lỗi tải tin nhắn: ${error.message}`);
      }

      // Get unique user IDs from messages
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];

      // Fetch user profiles for all users in the chat
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      // Create a map of user profiles
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      // Combine messages with user data
      const messages = messagesData?.map(message => ({
        ...message,
        user: profilesMap.get(message.user_id) || { display_name: 'Anonymous', avatar_url: null }
      })) || [];

      set({ messages });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('Error fetching messages:', errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      set({ messages: [] });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (teamId: string, content: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Check if user is member of the team
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', userData.user.id)
        .single();

      if (memberError || !memberData) {
        throw new Error('Bạn không có quyền gửi tin nhắn trong nhóm này');
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          team_id: teamId,
          user_id: userData.user.id,
          content
        });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Lỗi gửi tin nhắn: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('Error sending message:', errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
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
