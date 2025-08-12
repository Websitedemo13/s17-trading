import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TeamNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'team_invite' | 'team_join' | 'team_leave' | 'role_change' | 'team_update';
  team_id?: string;
  user_id?: string;
  read: boolean;
  dismissible: boolean;
  auto_dismiss_ms?: number;
  metadata: any;
  created_at: string;
  expires_at?: string;
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id?: string;
  activity_type: 'member_joined' | 'member_left' | 'role_changed' | 'team_created' | 'team_updated' | 'message_sent' | 'file_shared';
  description: string;
  metadata: any;
  created_at: string;
}

interface NotificationState {
  notifications: TeamNotification[];
  activities: TeamActivity[];
  floatingNotifications: TeamNotification[];
  loading: boolean;
  unreadCount: number;
  
  // Notification methods
  fetchNotifications: (teamId?: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: (teamId?: string) => Promise<boolean>;
  dismissNotification: (notificationId: string) => void;
  createNotification: (data: Omit<TeamNotification, 'id' | 'created_at' | 'read'>) => Promise<boolean>;
  
  // Activity methods
  fetchActivities: (teamId: string, limit?: number) => Promise<void>;
  createActivity: (data: Omit<TeamActivity, 'id' | 'created_at'>) => Promise<boolean>;
  
  // Floating notifications
  showFloatingNotification: (notification: TeamNotification) => void;
  hideFloatingNotification: (notificationId: string) => void;
  clearAllFloatingNotifications: () => void;
  
  // Real-time subscriptions
  subscribeToTeamNotifications: (teamId: string) => () => void;
  subscribeToTeamActivities: (teamId: string) => () => void;
  cleanup: () => void;
}

// Helper function to get current user
const getCurrentUser = () => {
  try {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    let user = authData?.state?.user;

    if (!user) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.id) user = userData;
    }

    if (!user) {
      const adminData = JSON.parse(localStorage.getItem('admin-storage') || '{}');
      if (adminData?.state?.user) {
        user = adminData.state.user;
      }
    }

    if (user && user.id) {
      return {
        id: user.id,
        email: user.email || 'admin@example.com',
        display_name: user.user_metadata?.display_name || user.display_name || user.email?.split('@')[0] || 'Admin User'
      };
    }
  } catch (error) {
    console.warn('Error getting current user:', error);
  }

  return {
    id: 'demo-user-admin',
    email: 'admin@s17trading.com',
    display_name: 'Admin User'
  };
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  activities: [],
  floatingNotifications: [],
  loading: false,
  unreadCount: 0,

  fetchNotifications: async (teamId) => {
    set({ loading: true });
    try {
      const currentUser = getCurrentUser();

      // Try Supabase first
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          let query = supabase
            .from('team_notifications')
            .select('*')
            .or(`user_id.eq.${userData.user.id},team_id.in.(${await getTeamIds(userData.user.id)})`)
            .order('created_at', { ascending: false })
            .limit(50);

          if (teamId) {
            query = query.eq('team_id', teamId);
          }

          const { data, error } = await query;

          if (!error && data) {
            const notifications = data.filter(n => 
              !n.expires_at || new Date(n.expires_at) > new Date()
            );
            
            const unreadCount = notifications.filter(n => !n.read).length;
            
            set({ 
              notifications, 
              unreadCount,
              loading: false 
            });
            return;
          }
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using localStorage fallback');
      }

      // Fallback to localStorage with demo notifications
      const demoNotifications: TeamNotification[] = [
        {
          id: 'notif_1',
          title: 'Chào mừng đến với Teams!',
          message: 'Bạn đã được thêm vào nhóm Crypto Traders VN. Hãy bắt đầu chia sẻ kinh nghiệm trading với các thành viên khác.',
          type: 'team_join',
          team_id: 'team_demo_1',
          user_id: currentUser.id,
          read: false,
          dismissible: true,
          auto_dismiss_ms: 8000,
          metadata: { welcomeMessage: true },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 'notif_2',
          title: 'Signal mới: BTC/USDT',
          message: 'Admin vừa chia sẻ signal Long BTC tại $67,500. Check ngay trong nhóm để không bỏ lỡ cơ hội!',
          type: 'info',
          team_id: 'team_demo_1',
          read: false,
          dismissible: true,
          metadata: { signal: 'BTC_LONG', price: 67500 },
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 'notif_3',
          title: 'Thành viên mới tham gia',
          message: 'Sarah Johnson đã tham gia nhóm Stock Analysis Hub. Hãy chào đón thành viên mới!',
          type: 'team_join',
          team_id: 'team_demo_2',
          read: true,
          dismissible: true,
          metadata: { newMember: 'Sarah Johnson' },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif_4',
          title: 'Cập nhật quyền',
          message: 'Bạn đã được thăng cấp thành Moderator trong nhóm DeFi Yield Farmers. Chúc mừng!',
          type: 'role_change',
          team_id: 'team_demo_3',
          read: false,
          dismissible: true,
          metadata: { oldRole: 'member', newRole: 'moderator' },
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];

      const filteredNotifications = teamId 
        ? demoNotifications.filter(n => n.team_id === teamId)
        : demoNotifications;

      const unreadCount = filteredNotifications.filter(n => !n.read).length;

      set({ 
        notifications: filteredNotifications, 
        unreadCount,
        loading: false 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error fetching notifications:', {
        message: errorMessage,
        error
      });
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { error } = await supabase
          .from('team_notifications')
          .update({ read: true })
          .eq('id', notificationId);

        if (!error) {
          const notifications = get().notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter(n => !n.read).length;
          set({ notifications, unreadCount });
          return true;
        }
      }
    } catch (error) {
      console.log('Supabase not available, using localStorage');
    }

    // Fallback to localStorage
    const notifications = get().notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
    return true;
  },

  markAllAsRead: async (teamId) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        let query = supabase
          .from('team_notifications')
          .update({ read: true })
          .eq('read', false);

        if (teamId) {
          query = query.eq('team_id', teamId);
        }

        const { error } = await query;

        if (!error) {
          const notifications = get().notifications.map(n =>
            (!teamId || n.team_id === teamId) ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter(n => !n.read).length;
          set({ notifications, unreadCount });
          return true;
        }
      }
    } catch (error) {
      console.log('Supabase not available, using localStorage');
    }

    // Fallback to localStorage
    const notifications = get().notifications.map(n =>
      (!teamId || n.team_id === teamId) ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
    return true;
  },

  dismissNotification: (notificationId) => {
    const notifications = get().notifications.filter(n => n.id !== notificationId);
    const floatingNotifications = get().floatingNotifications.filter(n => n.id !== notificationId);
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, floatingNotifications, unreadCount });
  },

  createNotification: async (data) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: notification, error } = await supabase
          .from('team_notifications')
          .insert({
            ...data,
            user_id: userData.user.id
          })
          .select()
          .single();

        if (!error && notification) {
          const notifications = [notification, ...get().notifications];
          const unreadCount = notifications.filter(n => !n.read).length;
          set({ notifications, unreadCount });
          return true;
        }
      }
    } catch (error) {
      console.log('Supabase not available, using localStorage');
    }

    // Fallback to localStorage
    const newNotification: TeamNotification = {
      ...data,
      id: 'notif_' + Date.now(),
      created_at: new Date().toISOString(),
      read: false
    };

    const notifications = [newNotification, ...get().notifications];
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
    return true;
  },

  fetchActivities: async (teamId, limit = 20) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data, error } = await supabase
          .from('team_activities')
          .select('*')
          .eq('team_id', teamId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          set({ activities: data });
          return;
        }
      }
    } catch (error) {
      console.log('Supabase not available, using localStorage');
    }

    // Fallback demo activities
    const demoActivities: TeamActivity[] = [
      {
        id: 'activity_1',
        team_id: teamId,
        user_id: getCurrentUser().id,
        activity_type: 'team_created',
        description: 'Nhóm được tạo',
        metadata: {},
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'activity_2',
        team_id: teamId,
        user_id: 'user_2',
        activity_type: 'member_joined',
        description: 'Sarah Johnson đã tham gia nhóm',
        metadata: { role: 'member' },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];

    set({ activities: demoActivities });
  },

  createActivity: async (data) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: activity, error } = await supabase
          .from('team_activities')
          .insert(data)
          .select()
          .single();

        if (!error && activity) {
          const activities = [activity, ...get().activities];
          set({ activities });
          return true;
        }
      }
    } catch (error) {
      console.log('Supabase not available, using localStorage');
    }

    // Fallback to localStorage
    const newActivity: TeamActivity = {
      ...data,
      id: 'activity_' + Date.now(),
      created_at: new Date().toISOString()
    };

    const activities = [newActivity, ...get().activities];
    set({ activities });
    return true;
  },

  showFloatingNotification: (notification) => {
    const floatingNotifications = [...get().floatingNotifications, notification];
    set({ floatingNotifications });

    // Auto dismiss if specified
    if (notification.auto_dismiss_ms) {
      setTimeout(() => {
        get().hideFloatingNotification(notification.id);
      }, notification.auto_dismiss_ms);
    }
  },

  hideFloatingNotification: (notificationId) => {
    const floatingNotifications = get().floatingNotifications.filter(n => n.id !== notificationId);
    set({ floatingNotifications });
  },

  clearAllFloatingNotifications: () => {
    set({ floatingNotifications: [] });
  },

  subscribeToTeamNotifications: (teamId) => {
    try {
      const subscription = supabase
        .channel(`team_notifications_${teamId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'team_notifications',
            filter: `team_id=eq.${teamId}`
          }, 
          (payload) => {
            const newNotification = payload.new as TeamNotification;
            
            // Add to notifications list
            const notifications = [newNotification, ...get().notifications];
            const unreadCount = notifications.filter(n => !n.read).length;
            set({ notifications, unreadCount });

            // Show floating notification
            get().showFloatingNotification(newNotification);

            // Show toast for important notifications
            if (['team_join', 'role_change'].includes(newNotification.type)) {
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.log('Real-time not available');
      return () => {};
    }
  },

  subscribeToTeamActivities: (teamId) => {
    try {
      const subscription = supabase
        .channel(`team_activities_${teamId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'team_activities',
            filter: `team_id=eq.${teamId}`
          }, 
          (payload) => {
            const newActivity = payload.new as TeamActivity;
            const activities = [newActivity, ...get().activities];
            set({ activities });
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.log('Real-time not available');
      return () => {};
    }
  },

  cleanup: () => {
    set({
      notifications: [],
      activities: [],
      floatingNotifications: [],
      unreadCount: 0
    });
  }
}));

// Helper function to get team IDs for current user
async function getTeamIds(userId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);
    
    return data?.map(m => m.team_id).join(',') || '';
  } catch {
    return '';
  }
}
