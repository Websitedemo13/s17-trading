import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserPresence as UserPresenceType } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Circle, 
  Pause, 
  Minus, 
  X,
  Clock,
  User
} from 'lucide-react';

interface UserPresenceProps {
  userId: string;
  presence?: UserPresenceType;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Status configurations
const STATUS_CONFIG = {
  online: {
    color: 'bg-green-500',
    text: 'Trực tuyến',
    icon: Circle,
    description: 'Đang hoạt động'
  },
  away: {
    color: 'bg-yellow-500',
    text: 'Vắng mặt',
    icon: Pause,
    description: 'Tạm thời rời khỏi'
  },
  busy: {
    color: 'bg-red-500',
    text: 'Bận',
    icon: Minus,
    description: 'Đừng làm phiền'
  },
  offline: {
    color: 'bg-gray-400',
    text: 'Ngoại tuyến',
    icon: X,
    description: 'Không hoạt động'
  }
};

export const UserPresence = ({ 
  userId, 
  presence, 
  showText = false, 
  size = 'md',
  className 
}: UserPresenceProps) => {
  const status = presence?.status || 'offline';
  const config = STATUS_CONFIG[status];
  
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const getLastSeenText = () => {
    if (!presence?.last_seen || status === 'online') return null;
    
    const lastSeen = new Date(presence.last_seen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xem';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className={cn(
          "rounded-full border border-background",
          config.color,
          sizeClasses[size]
        )} />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{config.text}</span>
          {getLastSeenText() && (
            <span className="text-xs text-muted-foreground">
              {getLastSeenText()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Avatar with presence indicator
export const UserAvatarWithPresence = ({
  user,
  presence,
  size = 'md',
  className
}: {
  user?: { display_name?: string; avatar_url?: string };
  presence?: UserPresenceType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const status = presence?.status || 'offline';
  const config = STATUS_CONFIG[status];
  
  const avatarSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const indicatorSizes = {
    sm: 'h-2 w-2 -bottom-0 -right-0',
    md: 'h-3 w-3 -bottom-0.5 -right-0.5',
    lg: 'h-4 w-4 -bottom-1 -right-1'
  };

  return (
    <div className={cn("relative", className)}>
      <Avatar className={avatarSizes[size]}>
        <AvatarImage src={user?.avatar_url} />
        <AvatarFallback>
          {user?.display_name?.charAt(0) || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "absolute rounded-full border-2 border-background",
        config.color,
        indicatorSizes[size]
      )} />
    </div>
  );
};

// Status selector component
export const StatusSelector = ({
  currentStatus,
  onStatusChange,
  trigger
}: {
  currentStatus: 'online' | 'away' | 'busy' | 'offline';
  onStatusChange: (status: 'online' | 'away' | 'busy' | 'offline') => void;
  trigger?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusSelect = (status: 'online' | 'away' | 'busy' | 'offline') => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <UserPresence userId="" presence={{ status: currentStatus } as UserPresenceType} />
            <span className="text-sm">{STATUS_CONFIG[currentStatus].text}</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <div className="text-sm font-medium p-2">Đặt trạng thái</div>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const StatusIcon = config.icon;
            return (
              <Button
                key={status}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto p-3",
                  currentStatus === status && "bg-accent"
                )}
                onClick={() => handleStatusSelect(status as any)}
              >
                <div className={cn("rounded-full", config.color, "h-3 w-3")} />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm font-medium">{config.text}</span>
                  <span className="text-xs text-muted-foreground">
                    {config.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Online users list component
export const OnlineUsersList = ({
  users,
  presences,
  className
}: {
  users: Array<{ id: string; display_name?: string; avatar_url?: string }>;
  presences: Map<string, UserPresenceType>;
  className?: string;
}) => {
  // Group users by status
  const usersByStatus = users.reduce((acc, user) => {
    const presence = presences.get(user.id);
    const status = presence?.status || 'offline';
    if (!acc[status]) acc[status] = [];
    acc[status].push({ user, presence });
    return acc;
  }, {} as Record<string, Array<{ user: any; presence?: UserPresenceType }>>);

  const statusOrder: (keyof typeof STATUS_CONFIG)[] = ['online', 'away', 'busy', 'offline'];

  return (
    <div className={cn("space-y-4", className)}>
      {statusOrder.map(status => {
        const statusUsers = usersByStatus[status] || [];
        if (statusUsers.length === 0) return null;

        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("rounded-full h-2 w-2", STATUS_CONFIG[status].color)} />
              <span className="text-sm font-medium text-muted-foreground">
                {STATUS_CONFIG[status].text} ({statusUsers.length})
              </span>
            </div>
            
            <div className="space-y-1">
              {statusUsers.map(({ user, presence }) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                  <UserAvatarWithPresence
                    user={user}
                    presence={presence}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.display_name || 'Anonymous'}
                    </div>
                    {presence && presence.status !== 'online' && (
                      <div className="text-xs text-muted-foreground">
                        <UserPresence userId={user.id} presence={presence} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Hook for auto-updating presence
export const usePresenceManager = (
  updatePresence: (status: 'online' | 'away' | 'busy' | 'offline') => Promise<void>
) => {
  const [isActive, setIsActive] = useState(true);
  const [awayTimeout, setAwayTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      setIsActive(true);
      updatePresence('online');

      // Clear existing timeout
      if (awayTimeout) {
        clearTimeout(awayTimeout);
      }

      // Set user as away after 5 minutes of inactivity
      const timeout = setTimeout(() => {
        setIsActive(false);
        updatePresence('away');
      }, 5 * 60 * 1000); // 5 minutes

      setAwayTimeout(timeout);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        handleActivity();
      }
    };

    // Initialize
    handleActivity();

    // Add event listeners
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set offline when window unloads
    const handleUnload = () => {
      updatePresence('offline');
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (awayTimeout) {
        clearTimeout(awayTimeout);
      }
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      
      // Set offline when component unmounts
      updatePresence('offline');
    };
  }, [updatePresence, awayTimeout]);

  return { isActive };
};
