import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  Reply, 
  Users, 
  ArrowLeft, 
  Send,
  Hash,
  X,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveTimestamp } from './LiveTimestamp';
import { MessageReactions } from './MessageReactions';
import { ReadReceipts } from './ReadReceipts';

interface MessageThreadProps {
  parentMessage: ChatMessage;
  replies: ChatMessage[];
  currentUserId?: string;
  onSendReply: (content: string) => Promise<void>;
  onAddReaction: (messageId: string, emoji: string) => Promise<void>;
  onRemoveReaction: (messageId: string, emoji: string) => Promise<void>;
  onClose: () => void;
  className?: string;
}

export const MessageThread = ({
  parentMessage,
  replies,
  currentUserId,
  onSendReply,
  onAddReaction,
  onRemoveReaction,
  onClose,
  className
}: MessageThreadProps) => {
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReply = async () => {
    if (!replyContent.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSendReply(replyContent);
      setReplyContent('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Failed to send reply:', {
        message: errorMessage,
        error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {/* Thread Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Thread</h3>
            <p className="text-sm text-muted-foreground">
              {replies.length} replies
            </p>
          </div>
        </div>
        
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {new Set([parentMessage.user_id, ...replies.map(r => r.user_id)]).size}
        </Badge>
      </div>

      {/* Parent Message */}
      <div className="p-4 border-b bg-muted/30">
        <ThreadMessage
          message={parentMessage}
          isParent={true}
          currentUserId={currentUserId}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
        />
      </div>

      {/* Replies */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ThreadMessage
                  message={reply}
                  isParent={false}
                  currentUserId={currentUserId}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Reply to thread..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendReply}
            disabled={!replyContent.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

interface ThreadMessageProps {
  message: ChatMessage;
  isParent: boolean;
  currentUserId?: string;
  onAddReaction: (messageId: string, emoji: string) => Promise<void>;
  onRemoveReaction: (messageId: string, emoji: string) => Promise<void>;
}

const ThreadMessage = ({
  message,
  isParent,
  currentUserId,
  onAddReaction,
  onRemoveReaction
}: ThreadMessageProps) => {
  const isOwn = message.user_id === currentUserId;

  return (
    <div className={cn(
      "group flex gap-3",
      isOwn && "flex-row-reverse",
      isParent && "bg-accent/20 rounded-lg p-3"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.user?.avatar_url} />
        <AvatarFallback>
          {message.user?.display_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex-1 space-y-2",
        isOwn && "items-end"
      )}>
        {/* User info and timestamp */}
        <div className={cn(
          "flex items-center gap-2",
          isOwn && "flex-row-reverse"
        )}>
          <span className="text-sm font-medium">
            {message.user?.display_name || 'Anonymous'}
          </span>
          <LiveTimestamp timestamp={message.created_at} format="smart" />
          {isParent && (
            <Badge variant="outline" className="text-xs">
              Original
            </Badge>
          )}
        </div>

        {/* Message content */}
        <div className={cn(
          "rounded-lg p-3 text-sm",
          isOwn
            ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
            : "bg-muted max-w-[80%]",
          isParent && "border border-primary/20"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            currentUserId={currentUserId}
            onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
            onRemoveReaction={(emoji) => onRemoveReaction(message.id, emoji)}
          />
        )}

        {/* Read receipts for thread messages */}
        {message.read_receipts && (
          <ReadReceipts
            readReceipts={message.read_receipts}
            currentUserId={currentUserId}
            messageId={message.id}
            showAvatars={false}
          />
        )}
      </div>
    </div>
  );
};

// Thread preview component for showing in main chat
export const ThreadPreview = ({
  parentMessage,
  replyCount,
  lastReply,
  participants,
  onClick,
  className
}: {
  parentMessage: ChatMessage;
  replyCount: number;
  lastReply?: ChatMessage;
  participants: string[];
  onClick: () => void;
  className?: string;
}) => {
  if (replyCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={cn("ml-11 mt-2", className)}
    >
      <Button
        variant="ghost"
        className="w-full justify-start p-3 h-auto bg-accent/30 hover:bg-accent/50 rounded-lg"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-2 text-primary">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Participant avatars */}
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((participantId, index) => (
              <Avatar key={participantId} className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {index + 1}
                </AvatarFallback>
              </Avatar>
            ))}
            {participants.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs">+{participants.length - 3}</span>
              </div>
            )}
          </div>

          {/* Last reply info */}
          {lastReply && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs text-muted-foreground truncate">
                  {lastReply.user?.display_name}: {lastReply.content}
                </p>
                <LiveTimestamp 
                  timestamp={lastReply.created_at} 
                  format="smart" 
                  className="text-xs"
                />
              </div>
            </>
          )}
        </div>
      </Button>
    </motion.div>
  );
};

// Thread sidebar component
export const ThreadSidebar = ({
  threads,
  onThreadSelect,
  selectedThreadId,
  className
}: {
  threads: Array<{
    id: string;
    parentMessage: ChatMessage;
    replyCount: number;
    lastReply?: ChatMessage;
    participants: string[];
  }>;
  onThreadSelect: (threadId: string) => void;
  selectedThreadId?: string;
  className?: string;
}) => {
  return (
    <Card className={cn("w-80 flex flex-col", className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Active Threads
        </h3>
        <p className="text-sm text-muted-foreground">
          {threads.length} active conversations
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {threads.map((thread) => (
            <Button
              key={thread.id}
              variant="ghost"
              className={cn(
                "w-full justify-start p-3 h-auto",
                selectedThreadId === thread.id && "bg-accent"
              )}
              onClick={() => onThreadSelect(thread.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={thread.parentMessage.user?.avatar_url} />
                  <AvatarFallback>
                    {thread.parentMessage.user?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 text-left space-y-1">
                  <p className="text-sm font-medium truncate">
                    {thread.parentMessage.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{thread.replyCount} replies</span>
                    <span>•</span>
                    <span>{thread.participants.length} participants</span>
                  </div>
                  {thread.lastReply && (
                    <p className="text-xs text-muted-foreground truncate">
                      {thread.lastReply.user?.display_name}: {thread.lastReply.content}
                    </p>
                  )}
                </div>

                <div className="flex -space-x-1">
                  {thread.participants.slice(0, 2).map((participantId, index) => (
                    <Avatar key={participantId} className="h-4 w-4 border border-background">
                      <AvatarFallback className="text-xs">
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

// Quote message component for creating threaded conversations
export const QuoteMessage = ({
  message,
  onQuote,
  className
}: {
  message: ChatMessage;
  onQuote: (message: ChatMessage) => void;
  className?: string;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-2", className)}
      onClick={() => onQuote(message)}
    >
      <Quote className="h-3 w-3" />
      Quote
    </Button>
  );
};

// Thread notification badge
export const ThreadNotificationBadge = ({
  count,
  className
}: {
  count: number;
  className?: string;
}) => {
  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className={cn("animate-pulse", className)}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};
