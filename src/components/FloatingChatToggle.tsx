import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useEnhancedTeamStore } from '@/stores/enhancedTeamStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  BellOff,
  Bell,
  Settings,
  X,
  Volume2,
  VolumeX,
  Monitor,
  MonitorX
} from 'lucide-react';

interface FloatingChatToggleProps {
  className?: string;
  compact?: boolean;
}

export const FloatingChatToggle = ({ className, compact = false }: FloatingChatToggleProps) => {
  const { user } = useAuthStore();
  const { userProfile, updateNotificationSettings, fetchUserProfile } = useEnhancedTeamStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !userProfile) {
      fetchUserProfile();
    }
  }, [user, userProfile, fetchUserProfile]);

  const notificationSettings = userProfile?.notification_settings || {
    floating_teams: true,
    sound: true,
    desktop: true
  };

  const handleToggleSetting = async (setting: keyof typeof notificationSettings, value: boolean) => {
    setLoading(true);
    try {
      const success = await updateNotificationSettings({ [setting]: value });
      if (success) {
        toast({
          title: "Thành công",
          description: `Đã ${value ? 'bật' : 'tắt'} ${
            setting === 'floating_teams' ? 'thông báo floating' :
            setting === 'sound' ? 'âm thanh' : 'thông báo desktop'
          }`,
        });
      }
    } catch (error) {
      console.error('Error toggling setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickToggleFloating = async () => {
    await handleToggleSetting('floating_teams', !notificationSettings.floating_teams);
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={quickToggleFloating}
        disabled={loading}
        className={cn(
          "relative transition-all duration-200",
          notificationSettings.floating_teams 
            ? "text-primary hover:text-primary/80" 
            : "text-muted-foreground hover:text-foreground",
          className
        )}
      >
        {notificationSettings.floating_teams ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
          </div>
        )}
      </Button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "gap-2 transition-all duration-200",
          notificationSettings.floating_teams && "border-primary/50 bg-primary/5"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Chat</span>
        {notificationSettings.floating_teams ? (
          <Bell className="h-3 w-3 text-primary" />
        ) : (
          <BellOff className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-full mt-2 right-0 z-50"
          >
            <Card className="w-72 p-4 shadow-lg border bg-background/95 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Cài đặt thông báo Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Floating Teams */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notificationSettings.floating_teams ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Thông báo floating</p>
                      <p className="text-xs text-muted-foreground">
                        Hiển thị thông báo nổi khi có tin nhắn mới
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.floating_teams}
                    onCheckedChange={(checked) => handleToggleSetting('floating_teams', checked)}
                    disabled={loading}
                  />
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notificationSettings.sound ? (
                      <Volume2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Âm thanh</p>
                      <p className="text-xs text-muted-foreground">
                        Phát âm thanh khi có thông báo
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.sound}
                    onCheckedChange={(checked) => handleToggleSetting('sound', checked)}
                    disabled={loading}
                  />
                </div>

                {/* Desktop Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notificationSettings.desktop ? (
                      <Monitor className="h-4 w-4 text-green-500" />
                    ) : (
                      <MonitorX className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Thông báo desktop</p>
                      <p className="text-xs text-muted-foreground">
                        Hiển thị thông báo trên desktop
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.desktop}
                    onCheckedChange={(checked) => handleToggleSetting('desktop', checked)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge 
                    variant={notificationSettings.floating_teams ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {notificationSettings.floating_teams ? "Đang bật" : "Đã tắt"}
                  </Badge>
                </div>
              </div>

              {/* Loading Indicator */}
              {loading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    Đang cập nhật...
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick toggle hook for other components to use
export const useFloatingChatToggle = () => {
  const { userProfile, updateNotificationSettings } = useEnhancedTeamStore();
  
  const toggle = async () => {
    const currentState = userProfile?.notification_settings?.floating_teams ?? true;
    return await updateNotificationSettings({ floating_teams: !currentState });
  };

  const isEnabled = userProfile?.notification_settings?.floating_teams ?? true;

  return { toggle, isEnabled };
};

export default FloatingChatToggle;
