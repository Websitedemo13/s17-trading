import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';
import { useEnhancedChatStore } from '@/stores/enhancedChatStore';
import { useTeamStore } from '@/stores/teamStore';
import { Team, ChatMessage } from '@/types';
import { 
  Send, 
  Plus, 
  Users, 
  Settings, 
  Hash, 
  MoreVertical,
  UserPlus,
  Search,
  Paperclip,
  Smile,
  Crown,
  Shield,
  Reply,
  Edit3,
  Pin,
  Trash2,
  Download,
  Image as ImageIcon,
  File,
  Mic,
  Video,
  Phone,
  Info,
  X,
  ArrowLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Import our new components
import { EmojiPicker } from '@/components/EmojiPicker';
import { MessageReactions } from '@/components/MessageReactions';
import { TypingIndicator, useTypingIndicator } from '@/components/TypingIndicator';
import { UserAvatarWithPresence, StatusSelector, OnlineUsersList, usePresenceManager } from '@/components/UserPresence';

const EnhancedChat = () => {
  const { user } = useAuthStore();
  const { 
    messages, 
    loading, 
    typingUsers,
    userPresences,
    fetchMessages, 
    sendMessage, 
    replyToMessage,
    addReaction,
    removeReaction,
    setTyping,
    updatePresence,
    markMessageAsRead,
    editMessage,
    deleteMessage,
    pinMessage,
    subscribeToMessages,
    subscribeToTyping,
    subscribeToPresence,
    subscribeToReactions
  } = useEnhancedChatStore();
  const { teams, fetchTeams, createTeam, joinTeam } = useTeamStore();
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMembersList, setShowMembersList] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing indicator hook
  const { startTyping, stopTyping } = useTypingIndicator(selectedTeam?.id || '', setTyping);

  // Presence manager hook
  usePresenceManager(updatePresence);

  useEffect(() => {
    fetchTeams();
    updatePresence('online');
  }, [fetchTeams, updatePresence]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMessages(selectedTeam.id);
      const unsubscribeMessages = subscribeToMessages(selectedTeam.id);
      const unsubscribeTyping = subscribeToTyping(selectedTeam.id);
      const unsubscribeReactions = subscribeToReactions(selectedTeam.id);
      
      return () => {
        unsubscribeMessages();
        unsubscribeTyping();
        unsubscribeReactions();
      };
    }
  }, [selectedTeam, fetchMessages, subscribeToMessages, subscribeToTyping, subscribeToReactions]);

  useEffect(() => {
    const unsubscribePresence = subscribeToPresence();
    return unsubscribePresence;
  }, [subscribeToPresence]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedTeam || !inputMessage.trim() || loading) return;

    let success = false;

    if (replyToMessage) {
      success = await replyToMessage(selectedTeam.id, inputMessage, replyToMessage.id);
      setReplyToMessage(null);
    } else {
      success = await sendMessage(selectedTeam.id, inputMessage);
    }

    if (success) {
      setInputMessage('');
      stopTyping();
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;

    const success = await editMessage(editingMessage.id, editContent);
    if (success) {
      setEditingMessage(null);
      setEditContent('');
      toast({
        title: "Thành công",
        description: "Đã chỉnh sửa tin nhắn"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (e.target.value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleEditMessage();
      } else {
        handleSendMessage();
      }
    }
    if (e.key === 'Escape') {
      if (editingMessage) {
        setEditingMessage(null);
        setEditContent('');
      }
      if (replyToMessage) {
        setReplyToMessage(null);
      }
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    const success = await createTeam({
      name: newTeamName,
      description: newTeamDescription
    });

    if (success) {
      setIsCreatingTeam(false);
      setNewTeamName('');
      setNewTeamDescription('');
      fetchTeams();
      toast({
        title: "Thành công",
        description: "Đã tạo nhóm mới thành công!"
      });
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) return;

    const success = await joinTeam(inviteCode);
    if (success) {
      setInviteCode('');
      fetchTeams();
      toast({
        title: "Thành công", 
        description: "Đã tham gia nhóm thành công!"
      });
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId);
    const userReacted = message?.reactions?.some(r => r.user_id === user?.id && r.emoji === emoji);
    
    if (userReacted) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'member':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}p`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric', 
      month: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const MessageComponent = ({ message }: { message: ChatMessage }) => {
    const isOwn = message.user_id === user?.id;
    const isReplying = message.reply_to;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "group flex gap-3 hover:bg-accent/20 rounded-lg p-2 transition-colors",
          isOwn && "flex-row-reverse"
        )}
      >
        <UserAvatarWithPresence
          user={message.user}
          presence={userPresences.get(message.user_id)}
          size="sm"
        />
        
        <div className={cn(
          "flex-1 max-w-[70%] space-y-1",
          isOwn && "items-end"
        )}>
          {/* User info and timestamp */}
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isOwn && "flex-row-reverse"
          )}>
            <span className="font-medium">
              {message.user?.display_name || 'Anonymous'}
            </span>
            <span>{formatTime(message.created_at)}</span>
            {message.edited_at && (
              <Badge variant="secondary" className="text-xs">
                Đã chỉnh sửa
              </Badge>
            )}
            {message.is_pinned && (
              <Pin className="h-3 w-3 text-primary" />
            )}
          </div>

          {/* Reply context */}
          {isReplying && message.reply_message && (
            <div className={cn(
              "bg-muted/50 rounded-lg p-2 border-l-2 border-primary",
              isOwn && "ml-auto"
            )}>
              <div className="text-xs text-muted-foreground mb-1">
                Trả lời {message.reply_message.user?.display_name}
              </div>
              <div className="text-sm truncate">
                {message.reply_message.content}
              </div>
            </div>
          )}

          {/* Message content */}
          <div className={cn(
            "rounded-2xl p-3 text-sm break-words",
            isOwn
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted",
            message.is_pinned && "ring-2 ring-primary/20"
          )}>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Reactions */}
          <MessageReactions
            reactions={message.reactions || []}
            currentUserId={user?.id}
            onAddReaction={(emoji) => handleReaction(message.id, emoji)}
            onRemoveReaction={(emoji) => handleReaction(message.id, emoji)}
          />

          {/* Message actions */}
          <div className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn && "flex-row-reverse"
          )}>
            <EmojiPicker
              onEmojiSelect={(emoji) => handleReaction(message.id, emoji)}
              trigger={
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <Smile className="h-3 w-3" />
                </Button>
              }
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => setReplyToMessage(message)}
            >
              <Reply className="h-3 w-3" />
            </Button>
            {isOwn && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setEditingMessage(message);
                    setEditContent(message.content);
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => pinMessage(message.id, !message.is_pinned)}
                >
                  <Pin className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-destructive"
                  onClick={() => deleteMessage(message.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-8rem)] flex bg-gradient-to-br from-background via-background to-accent/20">
        {/* Sidebar */}
        <motion.div 
          className="w-80 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col"
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 25 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Nhóm Chat
              </h2>
              <div className="flex items-center gap-2">
                <StatusSelector
                  currentStatus="online"
                  onStatusChange={updatePresence}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                  }
                />
                <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="hover:scale-105 transition-transform">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tạo nhóm mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Tên nhóm"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                      />
                      <Textarea
                        placeholder="Mô tả nhóm (tùy chọn)"
                        value={newTeamDescription}
                        onChange={(e) => setNewTeamDescription(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleCreateTeam} className="flex-1">
                          Tạo nhóm
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreatingTeam(false)}
                          className="flex-1"
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhóm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            
            {/* Join Team */}
            <div className="mt-3 space-y-2">
              <Input
                placeholder="Mã mời nhóm..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="bg-background/50"
              />
              <Button 
                onClick={handleJoinTeam} 
                variant="outline" 
                size="sm" 
                className="w-full hover:scale-105 transition-transform"
                disabled={!inviteCode.trim()}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Tham gia nhóm
              </Button>
            </div>
          </div>

          {/* Teams List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {filteredTeams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedTeam(team)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-accent/50 hover:scale-[1.02]",
                      selectedTeam?.id === team.id && "bg-accent ring-2 ring-primary/20"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={team.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                        <Hash className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{team.name}</p>
                        {getRoleIcon(team.role)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{team.member_count || 0} thành viên</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedTeam ? (
            <>
              {/* Chat Header */}
              <motion.div 
                className="p-4 border-b border-border bg-card/30 backdrop-blur-sm"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 25 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedTeam.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                        <Hash className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedTeam.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedTeam.member_count || 0} thành viên
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Gọi thoại</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                          <Video className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Gọi video</TooltipContent>
                    </Tooltip>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:scale-110 transition-transform"
                      onClick={() => setShowMembersList(!showMembersList)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:scale-110 transition-transform"
                      onClick={() => setShowChatInfo(!showChatInfo)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {selectedTeam.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedTeam.description}
                  </p>
                )}
              </motion.div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <MessageComponent key={message.id} message={message} />
                    ))}
                  </AnimatePresence>
                  
                  {/* Typing Indicator */}
                  <TypingIndicator 
                    typingUsers={typingUsers}
                    currentUserId={user?.id}
                  />
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Reply/Edit Context */}
              <AnimatePresence>
                {(replyToMessage || editingMessage) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-muted/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {replyToMessage && (
                          <>
                            <Reply className="h-4 w-4 text-primary" />
                            <div>
                              <div className="text-sm font-medium">
                                Trả lời {replyToMessage.user?.display_name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-96">
                                {replyToMessage.content}
                              </div>
                            </div>
                          </>
                        )}
                        {editingMessage && (
                          <>
                            <Edit3 className="h-4 w-4 text-primary" />
                            <div className="text-sm font-medium">Chỉnh sửa tin nhắn</div>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyToMessage(null);
                          setEditingMessage(null);
                          setEditContent('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
                <div className="flex gap-2 items-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Đính kèm file</TooltipContent>
                  </Tooltip>

                  <div className="flex-1">
                    <Input
                      ref={inputRef}
                      placeholder={
                        editingMessage 
                          ? "Chỉnh sửa tin nhắn..."
                          : replyToMessage 
                          ? `Trả lời ${replyToMessage.user?.display_name}...`
                          : `Nhắn tin tới ${selectedTeam.name}...`
                      }
                      value={editingMessage ? editContent : inputMessage}
                      onChange={editingMessage 
                        ? (e) => setEditContent(e.target.value)
                        : handleInputChange
                      }
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      className="bg-background/50 border-2 border-transparent focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <EmojiPicker
                    onEmojiSelect={(emoji) => {
                      if (editingMessage) {
                        setEditContent(prev => prev + emoji);
                      } else {
                        setInputMessage(prev => prev + emoji);
                      }
                    }}
                    trigger={
                      <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                        <Smile className="h-4 w-4" />
                      </Button>
                    }
                  />
                  
                  <Button 
                    onClick={editingMessage ? handleEditMessage : handleSendMessage}
                    disabled={loading || (editingMessage ? !editContent.trim() : !inputMessage.trim())}
                    size="sm"
                    className="hover:scale-110 transition-transform"
                  >
                    {editingMessage ? (
                      <Edit3 className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <motion.div 
              className="flex-1 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center space-y-4">
                <div className="relative">
                  <Hash className="h-24 w-24 mx-auto text-muted-foreground" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Chọn một nhóm để bắt đầu chat</h3>
                  <p className="text-muted-foreground max-w-md">
                    Tạo nhóm mới hoặc tham gia nhóm có sẵn để bắt đầu trò chuyện với đồng nghiệp và b��n bè
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Members Sidebar */}
        <AnimatePresence>
          {showMembersList && selectedTeam && (
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-80 border-l border-border bg-card/50 backdrop-blur-sm p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Thành viên nhóm</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMembersList(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <OnlineUsersList
                users={[]} // Would be populated with team members
                presences={userPresences}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedChat;
