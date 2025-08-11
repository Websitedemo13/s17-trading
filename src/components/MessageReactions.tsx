import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { MessageReaction } from '@/types';
import { cn } from '@/lib/utils';
import { EmojiPicker } from './EmojiPicker';
import { Plus } from 'lucide-react';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId?: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  className?: string;
}

export const MessageReactions = ({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  className
}: MessageReactionsProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  // Check if current user has reacted with specific emoji
  const hasUserReacted = (emoji: string) => {
    return groupedReactions[emoji]?.some(r => r.user_id === currentUserId) || false;
  };

  // Get users who reacted with specific emoji
  const getReactionUsers = (emoji: string) => {
    return groupedReactions[emoji]?.map(r => r.user?.display_name || 'Anonymous') || [];
  };

  // Handle reaction click
  const handleReactionClick = (emoji: string) => {
    if (hasUserReacted(emoji)) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
  };

  // Handle emoji picker selection
  const handleEmojiSelect = (emoji: string) => {
    onAddReaction(emoji);
    setShowEmojiPicker(false);
  };

  if (Object.keys(groupedReactions).length === 0 && !showEmojiPicker) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="h-3 w-3 mr-1" />
              React
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1 flex-wrap", className)}>
        {/* Existing Reactions */}
        {Object.entries(groupedReactions).map(([emoji, emojiReactions]) => {
          const userReacted = hasUserReacted(emoji);
          const users = getReactionUsers(emoji);
          
          return (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs gap-1 transition-all hover:scale-105",
                    userReacted
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted hover:bg-muted/80"
                  )}
                  onClick={() => handleReactionClick(emoji)}
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-medium">
                    {emojiReactions.length}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  {users.length === 1 ? (
                    <span>{users[0]} đã phản ứng với {emoji}</span>
                  ) : users.length === 2 ? (
                    <span>{users[0]} và {users[1]} đã phản ứng với {emoji}</span>
                  ) : users.length === 3 ? (
                    <span>{users[0]}, {users[1]} và {users[2]} đã phản ứng với {emoji}</span>
                  ) : (
                    <span>
                      {users[0]}, {users[1]} và {users.length - 2} người khác đã phản ứng với {emoji}
                    </span>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Add Reaction Button */}
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs transition-all hover:scale-105",
                Object.keys(groupedReactions).length === 0
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Plus className="h-3 w-3" />
            </Button>
          }
        />
      </div>
    </TooltipProvider>
  );
};

// Quick reaction buttons component for common reactions
export const QuickReactions = ({
  onReactionSelect,
  className
}: {
  onReactionSelect: (emoji: string) => void;
  className?: string;
}) => {
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {quickEmojis.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-lg hover:bg-accent hover:scale-110 transition-all"
          onClick={() => onReactionSelect(emoji)}
        >
          {emoji}
        </Button>
      ))}
      <EmojiPicker
        onEmojiSelect={onReactionSelect}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
};

// Reaction count badge for message previews
export const ReactionBadge = ({
  reactions,
  className
}: {
  reactions: MessageReaction[];
  className?: string;
}) => {
  if (reactions.length === 0) return null;

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = 0;
    }
    acc[reaction.emoji]++;
    return acc;
  }, {} as Record<string, number>);

  const topReactions = Object.entries(groupedReactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <Badge variant="secondary" className={cn("text-xs gap-1", className)}>
      {topReactions.map(([emoji, count]) => (
        <span key={emoji} className="flex items-center gap-1">
          <span>{emoji}</span>
          <span>{count}</span>
        </span>
      ))}
      {Object.keys(groupedReactions).length > 3 && (
        <span className="text-muted-foreground">+{Object.keys(groupedReactions).length - 3}</span>
      )}
    </Badge>
  );
};
