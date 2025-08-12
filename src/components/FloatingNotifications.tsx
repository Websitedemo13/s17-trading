import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Info, Users, Crown, UserPlus, UserMinus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { useAdminStore } from '@/stores/adminStore';
import { cn } from '@/lib/utils';

const NotificationIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "h-5 w-5 flex-shrink-0" };
  
  switch (type) {
    case 'success':
      return <Check {...iconProps} className="h-5 w-5 flex-shrink-0 text-green-600" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="h-5 w-5 flex-shrink-0 text-yellow-600" />;
    case 'error':
      return <AlertTriangle {...iconProps} className="h-5 w-5 flex-shrink-0 text-red-600" />;
    case 'team_join':
      return <UserPlus {...iconProps} className="h-5 w-5 flex-shrink-0 text-green-600" />;
    case 'team_leave':
      return <UserMinus {...iconProps} className="h-5 w-5 flex-shrink-0 text-orange-600" />;
    case 'role_change':
      return <Crown {...iconProps} className="h-5 w-5 flex-shrink-0 text-purple-600" />;
    case 'team_update':
      return <Settings {...iconProps} className="h-5 w-5 flex-shrink-0 text-blue-600" />;
    case 'team_invite':
      return <Users {...iconProps} className="h-5 w-5 flex-shrink-0 text-indigo-600" />;
    default:
      return <Info {...iconProps} className="h-5 w-5 flex-shrink-0 text-blue-600" />;
  }
};

const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800';
    case 'error':
      return 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800';
    case 'team_join':
      return 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800';
    case 'team_leave':
      return 'border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800';
    case 'role_change':
      return 'border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800';
    case 'team_update':
      return 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800';
    case 'team_invite':
      return 'border-indigo-200 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-800';
    default:
      return 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800';
  }
};

const FloatingNotifications = () => {
  const { floatingNotifications, hideFloatingNotification, markAsRead } = useNotificationStore();

  useEffect(() => {
    // Cleanup expired notifications
    const interval = setInterval(() => {
      floatingNotifications.forEach(notification => {
        if (notification.expires_at && new Date(notification.expires_at) < new Date()) {
          hideFloatingNotification(notification.id);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [floatingNotifications, hideFloatingNotification]);

  const handleDismiss = (notificationId: string) => {
    markAsRead(notificationId);
    hideFloatingNotification(notificationId);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {floatingNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.4 
            }}
            className={cn(
              "relative p-4 rounded-lg border shadow-lg backdrop-blur-sm",
              "transition-all duration-200 hover:shadow-xl",
              getNotificationStyle(notification.type)
            )}
          >
            <div className="flex items-start gap-3">
              <NotificationIcon type={notification.type} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {notification.title}
                  </h4>
                  
                  {notification.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-background/80"
                      onClick={() => handleDismiss(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(notification.type)}
                  </Badge>
                  
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(notification.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            {notification.auto_dismiss_ms && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-primary/30 rounded-b-lg"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ 
                  duration: notification.auto_dismiss_ms / 1000,
                  ease: "linear"
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'success':
      return 'Thành công';
    case 'warning':
      return 'Cảnh báo';
    case 'error':
      return 'Lỗi';
    case 'team_join':
      return 'Tham gia';
    case 'team_leave':
      return 'Rời nhóm';
    case 'role_change':
      return 'Quyền hạn';
    case 'team_update':
      return 'Cập nhật';
    case 'team_invite':
      return 'Lời mời';
    default:
      return 'Thông báo';
  }
};

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  
  return date.toLocaleDateString('vi-VN');
};

export default FloatingNotifications;
