import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTeamStore } from '@/stores/teamStore';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Send, Users, ArrowLeft, Crown, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { teams, currentTeam, setCurrentTeam, fetchTeamMembers, teamMembers } = useTeamStore();
  const { messages, loading, fetchMessages, sendMessage, subscribeToMessages } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
      fetchTeamMembers(teamId);
      fetchMessages(teamId);
      
      // Subscribe to real-time messages
      const unsubscribe = subscribeToMessages(teamId);
      return unsubscribe;
    }
  }, [teamId, teams, setCurrentTeam, fetchTeamMembers, fetchMessages, subscribeToMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !teamId || sendingMessage) return;

    setSendingMessage(true);
    try {
      const success = await sendMessage(teamId, inputMessage);
      if (success) {
        setInputMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Team Info Sidebar */}
      <div className="w-80 border-r bg-card/50 backdrop-blur-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/teams')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold truncate">{currentTeam.name}</h1>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">{currentTeam.member_count || 0} thành viên</span>
            </div>
            
            {currentTeam.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentTeam.description}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Thành viên</span>
            </div>
            
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.user?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate">
                      {member.user?.display_name || 'Người dùng'}
                    </span>
                    {member.role === 'admin' && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Chat nhóm</h2>
            <Badge variant="secondary" className="ml-auto">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trading Discussion
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.user_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.user_id !== user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {message.user?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.user_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.user_id !== user?.id && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.user?.display_name || 'Người dùng'}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {message.user_id === user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user?.user_metadata?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendingMessage}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={sendingMessage || !inputMessage.trim()}
              size="icon"
            >
              {sendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;