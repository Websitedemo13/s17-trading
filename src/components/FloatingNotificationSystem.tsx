import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { FloatingNotification, NOTIFICATION_PRIORITIES } from '@/types/teams';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useEnhancedTeamStore } from '@/stores/enhancedTeamStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  BellOff,
  MessageSquare,
  Users,
  UserPlus,
  Settings,
  Crown,
  Check,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

interface FloatingNotificationSystemProps {
  className?: string;
}

export const FloatingNotificationSystem = ({ className }: FloatingNotificationSystemProps) => {
  const { user } = useAuthStore();
  const { userProfile, updateNotificationSettings } = useEnhancedTeamStore();
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('floating_notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_dismissed', false)
          .order('created_at', { ascending: false })
          .limit(showAll ? 50 : 5);

        if (error) {
          console.error('Supabase error fetching notifications:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });

          // Don't show error for table not existing yet or relation errors
          if (error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== '42703') {
            toast({
              title: "Lỗi",
              description: `Không thể tải thông báo: ${error.message || 'Unknown error'}`,
              variant: "destructive"
            });
          } else if (error.code === '42P01' || error.code === '42703') {
            // Table doesn't exist yet, just log it
            console.log('Floating notifications table not set up yet, this is normal for new installations');
          }
          setNotifications([]); // Set empty array as fallback
          return;
        }
        setNotifications(data || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching notifications:', errorMessage);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('floating-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'floating_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as FloatingNotification;
          
          // Only show if notifications are enabled
          if (userProfile?.notification_settings?.floating_teams) {
            setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
            
            // Play sound if enabled
            if (userProfile?.notification_settings?.sound) {
              playNotificationSound();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userProfile, showAll]);

  // Update enabled state from user profile
  useEffect(() => {
    if (userProfile && userProfile.notification_settings) {
      setIsEnabled(userProfile.notification_settings.floating_teams ?? true);
    } else {
      // Default to enabled if profile not loaded yet
      setIsEnabled(true);
    }
  }, [userProfile]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback to system beep
        console.beep?.();
      });
    } catch (error) {
      console.log('Could not play notification sound');
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('floating_notifications')
        .update({ is_dismissed: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('floating_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('floating_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      toast({
        title: "Thành công",
        description: "Đã đánh dấu tất cả thông báo là đã đọc"
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    const success = await updateNotificationSettings({
      floating_teams: enabled
    });

    if (success) {
      setIsEnabled(enabled);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'team_message':
        return <MessageSquare className="h-4 w-4" />;
      case 'team_invite':
        return <UserPlus className="h-4 w-4" />;
      case 'team_request':
        return <Users className="h-4 w-4" />;
      case 'account_upgrade':
        return <Crown className="h-4 w-4" />;
      case 'system':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes}p`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const priorityNotifications = notifications.filter(n => n.priority >= 3);

  if (!isEnabled) {
    return (
      <div className={cn(
        "fixed top-4 right-4 z-50",
        className
      )}>
        <Card className="p-4 bg-muted/80 backdrop-blur-sm border-dashed">
          <div className="flex items-center gap-3">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Thông báo floating đã tắt
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleNotifications(true)}
            >
              Bật
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]",
      className
    )}>
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="bg-background/95 backdrop-blur-sm shadow-2xl border border-border/50">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Thông báo</h3>
                    <p className="text-xs text-muted-foreground">
                      {unreadCount} chưa đọc
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? 'Thu gọn' : 'Xem tất cả'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNotifications(false)}
                  >
                    <BellOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className={cn("max-h-96", showAll && "max-h-[60vh]")}>
                <div className="p-2 space-y-1">
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "group relative p-3 rounded-lg border transition-all cursor-pointer",
                          notification.is_read 
                            ? "bg-muted/30 border-border/50" 
                            : "bg-accent/50 border-primary/20 shadow-sm",
                          NOTIFICATION_PRIORITIES[notification.priority]?.bg
                        )}
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            {notification.avatar_url ? (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={notification.avatar_url} />
                                <AvatarFallback>
                                  {getNotificationIcon(notification.type)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center",
                                NOTIFICATION_PRIORITIES[notification.priority]?.bg,
                                NOTIFICATION_PRIORITIES[notification.priority]?.color
                              )}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "text-sm font-medium truncate",
                                !notification.is_read && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              
                              <div className="flex items-center gap-1">
                                {notification.priority >= 3 && (
                                  <Zap className="h-3 w-3 text-orange-500" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.content}
                            </p>

                            {/* Priority indicator */}
                            {notification.priority > 1 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "text-xs",
                                    NOTIFICATION_PRIORITIES[notification.priority]?.color
                                  )}
                                >
                                  {NOTIFICATION_PRIORITIES[notification.priority]?.name}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Dismiss button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Unread indicator */}
                        {!notification.is_read && (
                          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {notifications.length} thông báo
                      {priorityNotifications.length > 0 && (
                        <span className="text-orange-500 ml-1">
                          ({priorityNotifications.length} ưu tiên)
                        </span>
                      )}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Cập nhật real-time</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {notifications.length === 0 && isEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-4"
          >
            <Card className="p-4 bg-muted/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Không có thông báo mới</p>
                    <p className="text-xs text-muted-foreground">
                      Thông báo sẽ hiển thị ở đây
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleNotifications(false)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook for creating floating notifications
export const useFloatingNotifications = () => {
  const createNotification = async (
    userId: string,
    type: FloatingNotification['type'],
    title: string,
    content: string,
    options?: {
      teamId?: string;
      messageId?: string;
      avatarUrl?: string;
      priority?: 1 | 2 | 3 | 4;
      metadata?: Record<string, any>;
    }
  ) => {
    try {
      const { error } = await supabase.rpc('create_floating_notification', {
        target_user_id: userId,
        notification_type: type,
        notification_title: title,
        notification_content: content,
        team_uuid: options?.teamId,
        message_uuid: options?.messageId,
        notification_avatar: options?.avatarUrl,
        notification_priority: options?.priority || 2
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating floating notification:', error);
      return false;
    }
  };

  return { createNotification };
};

export default FloatingNotificationSystem;
