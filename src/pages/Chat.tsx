import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMessages(selectedTeam.id);
      const unsubscribe = subscribeToMessages(selectedTeam.id);
      return unsubscribe;
    }
  }, [selectedTeam, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedTeam || !inputMessage.trim() || loading) return;

    const success = await sendMessage(selectedTeam.id, inputMessage);
    if (success) {
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Nhóm Chat</h2>
            <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
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
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhóm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Join Team */}
          <div className="mt-3 space-y-2">
            <Input
              placeholder="Mã mời nhóm..."
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
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
          <div className="p-2 space-y-1">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
                  selectedTeam?.id === team.id && "bg-accent"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={team.avatar_url} />
                  <AvatarFallback>
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
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedTeam ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedTeam.avatar_url} />
                    <AvatarFallback>
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
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {selectedTeam.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedTeam.description}
                </p>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message: ChatMessage) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.user_id === user?.id && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.user?.avatar_url} />
                      <AvatarFallback>
                        {message.user?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "max-w-[70%] space-y-1",
                        message.user_id === user?.id && "items-end"
                      )}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{message.user?.display_name || 'Anonymous'}</span>
                        <span>
                          {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl p-3 text-sm",
                          message.user_id === user?.id
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder={`Nhắn tin tới ${selectedTeam.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1"
                />
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={loading || !inputMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Hash className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Chọn một nhóm để bắt đầu chat</h3>
                <p className="text-muted-foreground">
                  Tạo nhóm mới hoặc tham gia nhóm có sẵn để bắt đầu trò chuyện
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
