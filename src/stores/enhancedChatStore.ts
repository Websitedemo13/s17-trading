import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChatMessage, 
  MessageReaction, 
  MessageAttachment, 
  TypingIndicator, 
  UserPresence,
  MessageReadReceipt 
} from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from './authStore';

interface EnhancedChatState {
  // Messages
  messages: ChatMessage[];
  loading: boolean;
  
  // Reactions
  addReaction: (messageId: string, emoji: string) => Promise<boolean>;
  removeReaction: (messageId: string, emoji: string) => Promise<boolean>;
  
  // File uploads
  uploadFile: (file: File, teamId: string) => Promise<string | null>;
  sendMessageWithAttachment: (teamId: string, content: string, attachments: MessageAttachment[]) => Promise<boolean>;
  
  // Typing indicators
  typingUsers: TypingIndicator[];
  setTyping: (teamId: string, isTyping: boolean) => Promise<void>;
  
  // User presence
  userPresences: Map<string, UserPresence>;
  updatePresence: (status: 'online' | 'away' | 'busy' | 'offline') => Promise<void>;
  
  // Read receipts
  markMessageAsRead: (messageId: string) => Promise<void>;
  markAllMessagesAsRead: (teamId: string) => Promise<void>;
  
  // Message management
  editMessage: (messageId: string, newContent: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  pinMessage: (messageId: string, isPinned: boolean) => Promise<boolean>;
  
  // Reply functionality
  replyToMessage: (teamId: string, content: string, replyToId: string) => Promise<boolean>;
  
  // Enhanced fetch and send
  fetchMessages: (teamId: string) => Promise<void>;
  sendMessage: (teamId: string, content: string, messageType?: 'text' | 'file' | 'image' | 'system') => Promise<boolean>;
  
  // Real-time subscriptions
  subscribeToMessages: (teamId: string) => () => void;
  subscribeToTyping: (teamId: string) => () => void;
  subscribeToPresence: () => () => void;
  subscribeToReactions: (teamId: string) => () => void;
  
  // Search and filter
  searchMessages: (teamId: string, query: string) => Promise<ChatMessage[]>;
  getMessageThread: (messageId: string) => Promise<ChatMessage[]>;
}

export const useEnhancedChatStore = create<EnhancedChatState>((set, get) => ({
  messages: [],
  loading: false,
  typingUsers: [],
  userPresences: new Map(),

  // Enhanced fetch messages with all related data
  fetchMessages: async (teamId: string) => {
    set({ loading: true });
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Fetch messages with all related data
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          message_reactions(*),
          message_attachments(*),
          message_read_receipts(*),
          reply_message:reply_to(*)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Lỗi tải tin nhắn: ${error.message}`);
      }

      // Get user profiles for all users
      const userIds = [...new Set([
        ...(messagesData?.map(m => m.user_id) || []),
        ...(messagesData?.flatMap(m => m.message_reactions?.map(r => r.user_id) || []) || [])
      ])];

      let profilesMap = new Map();
      if (userIds.length > 0) {
        try {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);

          if (profilesData) {
            profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));
          }
        } catch (profileError) {
          console.log('Profiles table not available, using fallback user data');
        }
      }

      // Process messages with all related data
      const messages: ChatMessage[] = messagesData?.map(message => ({
        ...message,
        user: profilesMap.get(message.user_id) || { display_name: 'Anonymous', avatar_url: null },
        reactions: message.message_reactions?.map(reaction => ({
          ...reaction,
          user: profilesMap.get(reaction.user_id) || { display_name: 'Anonymous', avatar_url: null }
        })) || [],
        attachments: message.message_attachments || [],
        read_receipts: message.message_read_receipts?.map(receipt => ({
          ...receipt,
          user: profilesMap.get(receipt.user_id) || { display_name: 'Anonymous', avatar_url: null }
        })) || [],
        reply_message: message.reply_message ? {
          ...message.reply_message,
          user: profilesMap.get(message.reply_message.user_id) || { display_name: 'Anonymous', avatar_url: null }
        } : undefined
      })) || [];

      set({ messages });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
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

  // Enhanced send message
  sendMessage: async (teamId: string, content: string, messageType = 'text') => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          team_id: teamId,
          user_id: authUser.id,
          content,
          message_type: messageType
        });

      if (error) {
        throw new Error(`Lỗi gửi tin nhắn: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  },

  // Reply to message
  replyToMessage: async (teamId: string, content: string, replyToId: string) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          team_id: teamId,
          user_id: authUser.id,
          content,
          reply_to: replyToId,
          message_type: 'text'
        });

      if (error) {
        throw new Error(`Lỗi gửi phản hồi: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  },

  // Add reaction
  addReaction: async (messageId: string, emoji: string) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return false;

      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: authUser.id,
          emoji
        });

      if (error && !error.message.includes('duplicate')) {
        throw new Error(`Lỗi thêm reaction: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  },

  // Remove reaction
  removeReaction: async (messageId: string, emoji: string) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return false;

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .match({
          message_id: messageId,
          user_id: authUser.id,
          emoji
        });

      if (error) {
        throw new Error(`Lỗi xóa reaction: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  },

  // Upload file
  uploadFile: async (file: File, teamId: string) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${teamId}/${authUser.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (error) {
        throw new Error(`Lỗi upload file: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  },

  // Send message with attachments
  sendMessageWithAttachment: async (teamId: string, content: string, attachments: MessageAttachment[]) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return false;

      // Create message
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          team_id: teamId,
          user_id: authUser.id,
          content,
          message_type: attachments.length > 0 ? 'file' : 'text'
        })
        .select()
        .single();

      if (messageError) {
        throw new Error(`Lỗi tạo tin nhắn: ${messageError.message}`);
      }

      // Add attachments
      if (attachments.length > 0) {
        const attachmentInserts = attachments.map(att => ({
          ...att,
          message_id: messageData.id
        }));

        const { error: attachmentError } = await supabase
          .from('message_attachments')
          .insert(attachmentInserts);

        if (attachmentError) {
          throw new Error(`Lỗi thêm file đính kèm: ${attachmentError.message}`);
        }
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  },

  // Set typing indicator
  setTyping: async (teamId: string, isTyping: boolean) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return;

      await supabase
        .from('typing_indicators')
        .upsert({
          team_id: teamId,
          user_id: authUser.id,
          is_typing: isTyping
        });

      // Auto-clear typing indicator after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          get().setTyping(teamId, false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error setting typing indicator:', error);
    }
  },

  // Update user presence
  updatePresence: async (status: 'online' | 'away' | 'busy' | 'offline') => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return;

      await supabase.rpc('update_user_presence', {
        user_uuid: authUser.id,
        new_status: status
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId: string) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return;

      await supabase.rpc('create_read_receipt', {
        msg_id: messageId,
        reader_id: authUser.id
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  // Mark all messages as read
  markAllMessagesAsRead: async (teamId: string) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return;

      const { messages } = get();
      const teamMessages = messages.filter(m => m.team_id === teamId);
      
      for (const message of teamMessages) {
        await get().markMessageAsRead(message.id);
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  },

  // Edit message
  editMessage: async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          content: newContent,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        throw new Error(`Lỗi chỉnh sửa tin nhắn: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  },

  // Delete message
  deleteMessage: async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw new Error(`Lỗi xóa tin nhắn: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  },

  // Pin/unpin message
  pinMessage: async (messageId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_pinned: isPinned })
        .eq('id', messageId);

      if (error) {
        throw new Error(`Lỗi ${isPinned ? 'ghim' : 'bỏ ghim'} tin nhắn: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  },

  // Search messages
  searchMessages: async (teamId: string, query: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('team_id', teamId)
        .textSearch('content', query)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Lỗi tìm kiếm: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  },

  // Get message thread
  getMessageThread: async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`id.eq.${messageId},reply_to.eq.${messageId}`)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Lỗi tải chuỗi tin nhắn: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting message thread:', error);
      return [];
    }
  },

  // Subscribe to messages
  subscribeToMessages: (teamId: string) => {
    const channel = supabase
      .channel(`enhanced-chat-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `team_id=eq.${teamId}`
        },
        () => {
          get().fetchMessages(teamId);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Subscribe to typing indicators
  subscribeToTyping: (teamId: string) => {
    const channel = supabase
      .channel(`typing-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `team_id=eq.${teamId}`
        },
        async () => {
          const { data } = await supabase
            .from('typing_indicators')
            .select(`
              *,
              profiles(display_name, avatar_url)
            `)
            .eq('team_id', teamId)
            .eq('is_typing', true);

          set({ typingUsers: data || [] });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Subscribe to reactions
  subscribeToReactions: (teamId: string) => {
    const channel = supabase
      .channel(`reactions-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions'
        },
        () => {
          get().fetchMessages(teamId);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Subscribe to presence
  subscribeToPresence: () => {
    const channel = supabase
      .channel('user-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        async () => {
          const { data } = await supabase
            .from('user_presence')
            .select('*');

          const presenceMap = new Map(
            data?.map(presence => [presence.user_id, presence]) || []
          );
          set({ userPresences: presenceMap });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
}));
