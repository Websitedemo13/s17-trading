import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
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
  Image as ImageIcon,
  File,
  Mic,
  Video,
  Phone,
  Info,
  X,
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  MessageSquare,
  Clock,
  CheckCheck,
  Zap,
  At,
  Bookmark
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const { user } = useAuthStore();
  const { messages, loading, fetchMessages, sendMessage, subscribeToMessages } = useChatStore();
  const { teams, fetchTeams, createTeam, joinTeam } = useTeamStore();
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTeams().catch((error) => {
      console.error('Error fetching teams:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhóm",
        variant: "destructive"
      });
    });
  }, [fetchTeams]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMessages(selectedTeam.id).catch((error) => {
        console.error('Error fetching messages:', error);
        toast({
          title: "Lỗi", 
          description: "Không thể tải tin nhắn",
          variant: "destructive"
        });
      });
      
      const unsubscribe = subscribeToMessages(selectedTeam.id);
      return unsubscribe;
    }
  }, [selectedTeam, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSendMessage = async () => {
    if (!selectedTeam || !inputMessage.trim() || loading) return;

    const success = await sendMessage(selectedTeam.id, inputMessage);
    if (success) {
      setInputMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    
    // Simple typing indicator simulation
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên nhóm",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await createTeam({
        name: newTeamName,
        description: newTeamDescription
      });

      if (success) {
        setIsCreatingTeam(false);
        setNewTeamName('');
        setNewTeamDescription('');
        await fetchTeams();
        toast({
          title: "Thành công",
          description: "Đã tạo nhóm mới thành công!"
        });
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo nhóm mới",
        variant: "destructive"
      });
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã mời",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await joinTeam(inviteCode);
      if (success) {
        setInviteCode('');
        await fetchTeams();
        toast({
          title: "Thành công", 
          description: "Đã tham gia nhóm thành công!"
        });
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tham gia nhóm",
        variant: "destructive"
      });
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-amber-500" />;
      case 'member':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return `Hôm qua ${date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const TeamSidebar = () => (
    <div className={cn(
      "w-80 border-r border-border bg-gradient-to-b from-card/50 to-card/30 flex flex-col backdrop-blur-sm",
      isMobileView && selectedTeam && "hidden"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Nhóm Chat
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => setIsCreatingTeam(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tạo nhóm mới</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm nhóm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>
        
        {/* Join Team */}
        <div className="mt-3 space-y-2">
          <Input
            placeholder="Mã mời nhóm..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="bg-background/50 border-border/50"
          />
          <Button 
            onClick={handleJoinTeam} 
            variant="outline" 
            size="sm" 
            className="w-full"
            disabled={!inviteCode.trim()}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Tham gia nhóm
          </Button>
        </div>
      </div>

      {/* Teams List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <AnimatePresence>
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTeam(team)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-accent/80 hover:shadow-md hover:scale-[1.02] group",
                  selectedTeam?.id === team.id && "bg-primary/10 border border-primary/20 shadow-lg"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-lg">
                    <AvatarImage src={team.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                      <Hash className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate text-sm">{team.name}</p>
                    {getRoleIcon(team.role)}
                    {team.unread_count && (
                      <Badge variant="destructive" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                        {team.unread_count > 99 ? '99+' : team.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{team.member_count || 0} thành viên</span>
                    {team.last_message_at && (
                      <>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{getTimeDisplay(team.last_message_at)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredTeams.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Không tìm thấy nhóm nào</p>
              <p className="text-xs">Thử tạo nhóm mới hoặc tham gia bằng mã mời</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const ChatHeader = () => selectedTeam && (
    <div className="p-4 border-b border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobileView && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={selectedTeam.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              <Hash className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{selectedTeam.name}</h3>
              {getRoleIcon(selectedTeam.role)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{selectedTeam.member_count || 0} thành viên</span>
              {isTyping && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs">đang nhập...</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gọi thoại</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                  <Video className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gọi video</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setShowTeamInfo(true)} className="hover:bg-accent/50">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thông tin nhóm</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {selectedTeam.description && (
        <p className="text-sm text-muted-foreground mt-2 bg-muted/30 rounded-lg p-2">
          {selectedTeam.description}
        </p>
      )}
    </div>
  );

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isOwn = message.user_id === user?.id;
    const timeDisplay = getTimeDisplay(message.created_at);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex gap-3 group hover:bg-accent/20 p-2 rounded-lg transition-all duration-200",
          isOwn && "flex-row-reverse"
        )}
      >
        <Avatar className="h-8 w-8 border border-border/20">
          <AvatarImage src={message.user?.avatar_url} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
            {message.user?.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn("max-w-[70%] space-y-1", isOwn && "items-end")}>
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isOwn && "flex-row-reverse"
          )}>
            <span className="font-medium">{message.user?.display_name || 'Anonymous'}</span>
            <span>{timeDisplay}</span>
            {isOwn && <CheckCheck className="h-3 w-3 text-primary" />}
          </div>
          
          <div
            className={cn(
              "rounded-2xl p-3 text-sm relative shadow-sm border transition-all duration-200 hover:shadow-md",
              isOwn
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ml-auto border-primary/20"
                : "bg-gradient-to-br from-card to-card/80 border-border/50"
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            
            {/* Message actions */}
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
              isOwn ? "-left-16" : "-right-16"
            )}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm border">
                      <Smile className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Thêm reaction</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm border">
                      <Bookmark className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Lưu tin nhắn</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const MessageInput = () => (
    <div className="p-4 border-t border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
      <div className="flex gap-2 items-end">
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Đính kèm file</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ảnh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            placeholder={`Nhắn tin tới ${selectedTeam?.name || 'nhóm'}...`}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="pr-20 bg-background/50 border-border/50 rounded-xl"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/50">
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Emoji</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              size="sm"
              className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gradient-to-br from-background via-background to-muted/20">
      {/* Create Team Dialog */}
      <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Tạo nhóm mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tên nhóm</label>
              <Input
                placeholder="Nhập tên nhóm"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Mô tả (tùy chọn)</label>
              <Textarea
                placeholder="Mô tả về nhóm..."
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateTeam} className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
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

      {/* Team Sidebar */}
      <TeamSidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedTeam ? (
          <>
            <ChatHeader />
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                <AnimatePresence>
                  {messages.map((message: ChatMessage) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 max-w-md mx-auto p-8"
            >
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <MessageSquare className="h-16 w-16 text-primary/60" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center">
                  <Hash className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Chào mừng đến với S17 Chat
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Chọn một nhóm từ danh sách bên trái để bắt đầu trò chuyện, hoặc tạo nhóm mới để kết nối với đồng nghiệp
                </p>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setIsCreatingTeam(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo nhóm mới
                </Button>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Tham gia nhóm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
