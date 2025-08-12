import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { MessageReadReceipt } from '@/types';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadReceiptsProps {
  readReceipts: MessageReadReceipt[];
  totalMembers?: number;
  currentUserId?: string;
  messageId: string;
  showAvatars?: boolean;
  maxAvatars?: number;
  className?: string;
}

export const ReadReceipts = ({
  readReceipts = [],
  totalMembers = 0,
  currentUserId,
  messageId,
  showAvatars = true,
  maxAvatars = 3,
  className
}: ReadReceiptsProps) => {
  // Filter out current user from read receipts display
  const otherUserReceipts = readReceipts.filter(receipt => receipt.user_id !== currentUserId);
  const hasCurrentUserRead = readReceipts.some(receipt => receipt.user_id === currentUserId);

  if (otherUserReceipts.length === 0) {
    return null;
  }

  // Group receipts by read time (within 1 minute)
  const groupedReceipts = otherUserReceipts.reduce((groups, receipt) => {
    const readTime = new Date(receipt.read_at).getTime();
    const existingGroup = groups.find(group => 
      Math.abs(new Date(group[0].read_at).getTime() - readTime) < 60000 // Within 1 minute
    );

    if (existingGroup) {
      existingGroup.push(receipt);
    } else {
      groups.push([receipt]);
    }

    return groups;
  }, [] as MessageReadReceipt[][]);

  const visibleReceipts = otherUserReceipts.slice(0, maxAvatars);
  const remainingCount = Math.max(0, otherUserReceipts.length - maxAvatars);

  const getReadText = () => {
    if (otherUserReceipts.length === 1) {
      return `${otherUserReceipts[0].user?.display_name || 'Ai đó'} đã xem`;
    } else if (otherUserReceipts.length === 2) {
      return `${otherUserReceipts[0].user?.display_name || 'Ai đó'} và ${otherUserReceipts[1].user?.display_name || 'ai đó'} đã xem`;
    } else {
      return `${otherUserReceipts[0].user?.display_name || 'Ai đó'} và ${otherUserReceipts.length - 1} người khác đã xem`;
    }
  };

  const getLatestReadTime = () => {
    if (otherUserReceipts.length === 0) return null;
    
    const latest = otherUserReceipts.reduce((latest, receipt) => {
      return new Date(receipt.read_at) > new Date(latest.read_at) ? receipt : latest;
    });

    return new Date(latest.read_at).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!showAvatars) {
    // Simple check/double-check indicator
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {otherUserReceipts.length > 0 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <CheckCheck className="h-3 w-3 text-primary" />
                  {otherUserReceipts.length > 1 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-xs">
                      {otherUserReceipts.length}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  {getReadText()}
                  {getLatestReadTime() && (
                    <div className="text-xs text-muted-foreground">
                      Lúc {getLatestReadTime()}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Check className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1", className)}>
            {/* Read indicator */}
            <div className="flex items-center">
              {otherUserReceipts.length > 0 ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : (
                <Check className="h-3 w-3 text-muted-foreground" />
              )}
            </div>

            {/* User avatars */}
            <div className="flex -space-x-2">
              <AnimatePresence>
                {visibleReceipts.map((receipt, index) => (
                  <motion.div
                    key={receipt.user_id}
                    initial={{ scale: 0, x: 20 }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{ scale: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Avatar className="h-4 w-4 border border-background ring-1 ring-primary/20">
                      <AvatarImage src={receipt.user?.avatar_url} />
                      <AvatarFallback className="text-xs bg-primary/10">
                        {receipt.user?.display_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Remaining count indicator */}
              {remainingCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center"
                >
                  <span className="text-xs font-medium">
                    +{remainingCount}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 max-w-xs">
            <div className="text-sm font-medium">{getReadText()}</div>
            
            {/* Detailed read times */}
            <div className="space-y-1">
              {groupedReceipts.slice(0, 5).map((group, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  <div className="font-medium">
                    {group.map(r => r.user?.display_name || 'Ai đó').join(', ')}
                  </div>
                  <div>
                    {new Date(group[0].read_at).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              ))}
              
              {groupedReceipts.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  và {groupedReceipts.length - 5} lần xem khác...
                </div>
              )}
            </div>

            {/* Progress indicator */}
            {totalMembers > 1 && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span>Đã xem</span>
                  <span>{otherUserReceipts.length}/{totalMembers - 1}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1 mt-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(otherUserReceipts.length / Math.max(1, totalMembers - 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Component for showing read receipts in a list format
export const ReadReceiptsList = ({
  readReceipts,
  className
}: {
  readReceipts: MessageReadReceipt[];
  className?: string;
}) => {
  if (readReceipts.length === 0) {
    return null;
  }

  // Sort by read time, most recent first
  const sortedReceipts = [...readReceipts].sort(
    (a, b) => new Date(b.read_at).getTime() - new Date(a.read_at).getTime()
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium text-muted-foreground">
        Đã xem bởi {readReceipts.length} người
      </div>
      
      <div className="space-y-1">
        {sortedReceipts.map((receipt) => (
          <div key={receipt.user_id} className="flex items-center gap-3 py-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={receipt.user?.avatar_url} />
              <AvatarFallback className="text-xs">
                {receipt.user?.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {receipt.user?.display_name || 'Anonymous'}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {new Date(receipt.read_at).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short'
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook for managing read receipts
export const useReadReceipts = (
  messageId: string,
  markAsRead: (messageId: string) => Promise<void>
) => {
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

  useEffect(() => {
    const markMessageAsRead = async () => {
      if (!hasMarkedAsRead) {
        try {
          await markAsRead(messageId);
          setHasMarkedAsRead(true);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
          console.error('Failed to mark message as read:', {
            message: errorMessage,
            error
          });
        }
      }
    };

    // Mark as read when component mounts (message becomes visible)
    const timer = setTimeout(markMessageAsRead, 1000);

    return () => clearTimeout(timer);
  }, [messageId, markAsRead, hasMarkedAsRead]);

  return { hasMarkedAsRead };
};

// Delivery status indicator
export const DeliveryStatus = ({
  status,
  className
}: {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  className?: string;
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <div className="h-3 w-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      {getStatusIcon()}
    </div>
  );
};
