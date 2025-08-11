import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from './authStore';

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
      // First check if user is authenticated using auth store
      const authUser = useAuthStore.getState().user;
      if (!authUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Check if team exists and user is a member
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .single();

      if (teamError || !teamData) {
        throw new Error('Nhóm không tồn tại hoặc đã bị xóa');
      }

      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', authUser.id)
        .single();

      if (memberError || !memberData) {
        throw new Error(`Bạn không có quyền truy cập nhóm "${teamData.name}"`);
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
      let profilesMap = new Map();

      // Try to fetch user profiles, fallback if profiles table doesn't exist
      if (userIds.length > 0) {
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);

          if (!profilesError && profilesData) {
            profilesMap = new Map(
              profilesData.map(profile => [profile.id, profile])
            );
          }
        } catch (profileError) {
          console.log('Profiles table not available, using fallback user data');
        }
      }

      // Combine messages with user data (fallback to Anonymous if no profile found)
      const messages = messagesData?.map(message => ({
        ...message,
        user: profilesMap.get(message.user_id) || {
          display_name: 'Anonymous',
          avatar_url: null
        }
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

      // Check if team exists and user is a member
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .single();

      if (teamError || !teamData) {
        throw new Error('Nhóm không tồn tại hoặc đã bị xóa');
      }

      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', authUser.id)
        .single();

      if (memberError || !memberData) {
        throw new Error(`Bạn không có quyền gửi tin nhắn trong nhóm "${teamData.name}"`);
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
      .channel(`chat-messages-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `team_id=eq.${teamId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          // Refresh messages when new message is received
          get().fetchMessages(teamId).catch(error => {
            console.error('Error refreshing messages after real-time update:', error);
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to chat messages for team: ${teamId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to chat messages');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
