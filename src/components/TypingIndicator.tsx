import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TypingIndicator as TypingIndicatorType } from '@/types';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUsers: TypingIndicatorType[];
  currentUserId?: string;
  className?: string;
}

// Animated dots component
const TypingDots = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export const TypingIndicator = ({ typingUsers, currentUserId, className }: TypingIndicatorProps) => {
  // Filter out current user and only show active typing users
  const activeTypingUsers = typingUsers.filter(
    user => user.user_id !== currentUserId && user.is_typing
  );

  if (activeTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    const names = activeTypingUsers.map(user => 
      user.user?.display_name || 'Ai đó'
    );

    if (names.length === 1) {
      return `${names[0]} đang nhập...`;
    } else if (names.length === 2) {
      return `${names[0]} và ${names[1]} đang nhập...`;
    } else {
      return `${names[0]}, ${names[1]} và ${names.length - 2} người khác đang nhập...`;
    }
  };

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      {/* Show avatars for up to 3 typing users */}
      <div className="flex -space-x-2">
        {activeTypingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.user_id} className="h-6 w-6 border-2 border-background">
            <AvatarImage src={user.user?.avatar_url} />
            <AvatarFallback className="text-xs">
              {user.user?.display_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Typing text and animation */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {getTypingText()}
        </span>
        <TypingDots />
      </div>
    </div>
  );
};

// Compact typing indicator for message input area
export const CompactTypingIndicator = ({ typingUsers, currentUserId }: {
  typingUsers: TypingIndicatorType[];
  currentUserId?: string;
}) => {
  const activeTypingUsers = typingUsers.filter(
    user => user.user_id !== currentUserId && user.is_typing
  );

  if (activeTypingUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground">
      <TypingDots className="scale-75" />
      {activeTypingUsers.length === 1 ? (
        <span>{activeTypingUsers[0].user?.display_name || 'Ai đó'} đang nhập</span>
      ) : (
        <span>{activeTypingUsers.length} người đang nhập</span>
      )}
    </div>
  );
};

// Hook for managing typing state
export const useTypingIndicator = (
  teamId: string,
  setTyping: (teamId: string, isTyping: boolean) => Promise<void>
) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      setTyping(teamId, true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);

    setTypingTimeout(timeout);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      setTyping(teamId, false);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTyping) {
        setTyping(teamId, false);
      }
    };
  }, [typingTimeout, isTyping, teamId, setTyping]);

  return {
    isTyping,
    startTyping,
    stopTyping
  };
};
