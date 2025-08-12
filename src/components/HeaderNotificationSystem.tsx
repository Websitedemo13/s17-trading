import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FloatingNotification, NOTIFICATION_PRIORITIES } from '@/types/teams';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellRing,
  Check,
  X,
  MessageSquare,
  Users,
  UserPlus,
  Crown,
  AlertCircle,
  Zap,
  Trash2
} from 'lucide-react';

interface HeaderNotificationSystemProps {
  className?: string;
}

export const HeaderNotificationSystem = ({ className }: HeaderNotificationSystemProps) => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('floating_notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_dismissed', false)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching notifications:', error);
          // Don't show error for table not existing yet
          if (error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== '42703') {
            toast({
              title: "Lỗi",
              description: `Không thể tải thông báo: ${error.message}`,
              variant: "destructive"
            });
          }
          setNotifications([]);
          return;
        }
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('header-notifications')
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
          setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const dismissNotification = async (notificationId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
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

  const clearAllNotifications = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('floating_notifications')
        .update({ is_dismissed: true })
        .eq('user_id', user.id)
        .eq('is_dismissed', false);

      if (error) throw error;

      setNotifications([]);
      setIsOpen(false);
      
      toast({
        title: "Thành công",
        description: "Đã xóa tất cả thông báo"
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-10 w-10 rounded-full transition-all duration-200",
            "hover:bg-accent hover:scale-105",
            unreadCount > 0 && "text-primary",
            className
          )}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 animate-pulse" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          
          {priorityNotifications.length > 0 && (
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96 p-0 bg-background/95 backdrop-blur-sm border-border/50"
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">Thông báo</h3>
                <p className="text-xs text-muted-foreground">
                  {unreadCount} chưa đọc • {notifications.length} tổng cộng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 w-8 p-0"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Xóa tất cả thông báo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Đang tải...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h4 className="font-medium text-sm">Không có thông báo</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Thông báo mới sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              <div className="p-2 space-y-1">
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "group relative p-3 rounded-lg border transition-all cursor-pointer",
                        "hover:bg-accent/50",
                        notification.is_read 
                          ? "bg-muted/30 border-border/50" 
                          : "bg-accent/30 border-primary/20 shadow-sm",
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
                              "bg-primary/10 text-primary"
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

                          {/* Priority badge */}
                          {notification.priority > 2 && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs mt-2"
                            >
                              {NOTIFICATION_PRIORITIES[notification.priority]?.name}
                            </Badge>
                          )}
                        </div>

                        {/* Dismiss button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={(e) => dismissNotification(notification.id, e)}
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
          )}

          {/* Footer with stats */}
          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3 bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {notifications.length} thông báo
                    {priorityNotifications.length > 0 && (
                      <span className="text-orange-500 ml-1">
                        • {priorityNotifications.length} ưu tiên
                      </span>
                    )}
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Trực tuyến
                  </span>
                </div>
              </div>
            </>
          )}
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderNotificationSystem;
