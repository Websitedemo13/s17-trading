import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeamStore } from '@/stores/teamStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Users,
  Crown,
  Shield,
  UserPlus,
  Settings,
  Share2,
  Send,
  MoreVertical,
  Copy,
  Link2,
  Mail,
  TrendingUp,
  BarChart3,
  Target,
  Calendar,
  Clock,
  MessageSquare,
  Activity,
  Zap,
  Star,
  Hash
} from 'lucide-react';

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentTeam, 
    teamMembers, 
    loading, 
    fetchTeamMembers, 
    inviteMember,
    removeMember,
    updateMemberRole,
    generateInviteCode,
    leaveTeam,
    setCurrentTeam
  } = useTeamStore();

  const [message, setMessage] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      user_id: 'demo-user-1',
      content: 'Chào mọi người! Market hôm nay có vẻ bullish đấy',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user: {
        display_name: 'Trader Pro',
        avatar_url: ''
      }
    },
    {
      id: '2',
      user_id: 'demo-user-2', 
      content: 'BTC đã break resistance 45k rồi, có thể sẽ test 48k trong tuần này',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      user: {
        display_name: 'Crypto Master',
        avatar_url: ''
      }
    },
    {
      id: '3',
      user_id: user?.id || '',
      content: 'Đúng rồi, volume cũng tăng mạnh. Đã long từ 44.5k',
      created_at: new Date(Date.now() - 900000).toISOString(),
      user: {
        display_name: user?.display_name || 'Bạn',
        avatar_url: user?.avatar_url || ''
      }
    }
  ]);

  useEffect(() => {
    if (teamId) {
      // In a real app, fetch team details here
      // For demo, set mock data
      setCurrentTeam({
        id: teamId,
        name: 'Crypto Hunters Vietnam',
        description: 'Nhóm trading crypto chuyên nghiệp, tập trung vào swing trading và phân tích kỹ thuật. Chia sẻ signals, h��c hỏi và cùng nhau profit!',
        avatar_url: '',
        created_by: 'admin-user',
        created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 24,
        role: Math.random() > 0.5 ? 'admin' : 'member'
      });
      fetchTeamMembers(teamId);
    }
  }, [teamId, fetchTeamMembers, setCurrentTeam]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      user_id: user?.id || '',
      content: message,
      created_at: new Date().toISOString(),
      user: {
        display_name: user?.display_name || 'Bạn',
        avatar_url: user?.avatar_url || ''
      }
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !teamId) return;

    const success = await inviteMember(teamId, inviteEmail);
    if (success) {
      setShowInviteDialog(false);
      setInviteEmail('');
    }
  };

  const handleGenerateInviteCode = async () => {
    if (!teamId) return;
    
    const code = await generateInviteCode(teamId);
    if (code) {
      setInviteCode(code);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Đã sao chép",
      description: "Mã mời đã được sao chép vào clipboard",
    });
  };

  const handleLeaveTeam = async () => {
    if (!teamId) return;
    
    const success = await leaveTeam(teamId);
    if (success) {
      navigate('/teams');
    }
  };

  const isAdmin = currentTeam?.role === 'admin';
  
  if (!currentTeam) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải thông tin nhóm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/teams')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentTeam.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {currentTeam.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {currentTeam.name}
                {isAdmin && <Crown className="h-5 w-5 text-yellow-600" />}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {currentTeam.member_count} thành viên
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Tạo {new Date(currentTeam.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Mời thành viên
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mời thành viên mới</DialogTitle>
                    <DialogDescription>
                      Mời người khác tham gia nhóm trading của bạn
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        placeholder="Nhập email thành viên..."
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Hoặc chia sẻ mã mời</label>
                      <div className="flex gap-2">
                        <Input
                          value={inviteCode || teamId}
                          readOnly
                          placeholder="Nhấn tạo mã để có mã mời"
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleGenerateInviteCode}
                          disabled={!!inviteCode}
                        >
                          {inviteCode ? <Copy className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                        </Button>
                        {inviteCode && (
                          <Button variant="outline" onClick={handleCopyInviteCode}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chia sẻ mã này để mời người khác tham gia nhóm
                      </p>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowInviteDialog(false)}
                        className="flex-1"
                      >
                        Hủy
                      </Button>
                      <Button 
                        onClick={handleInviteMember}
                        disabled={!inviteEmail.trim()}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Gửi lời mời
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ nhóm
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={handleLeaveTeam}
              >
                Rời nhóm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Team Description */}
      {currentTeam.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{currentTeam.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Thành viên
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Hiệu suất
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Tín hiệu
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Kênh chung
              </CardTitle>
              <CardDescription>
                Thảo luận và chia sẻ ý kiến trading với các thành viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.user?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {msg.user?.display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">
                              {msg.user?.display_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Thành viên nhóm ({currentTeam.member_count})</CardTitle>
              <CardDescription>
                Quản lý thành viên và quyền hạn trong nhóm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock members data */}
                {[
                  { 
                    id: '1', 
                    name: 'Trader Pro', 
                    role: 'admin', 
                    joined: '2024-01-15',
                    status: 'online',
                    trades: 156,
                    winRate: 68
                  },
                  { 
                    id: '2', 
                    name: 'Crypto Master', 
                    role: 'member', 
                    joined: '2024-01-20',
                    status: 'online',
                    trades: 89,
                    winRate: 74
                  },
                  { 
                    id: '3', 
                    name: 'Moon Walker', 
                    role: 'member', 
                    joined: '2024-01-25',
                    status: 'offline',
                    trades: 45,
                    winRate: 52
                  }
                ].map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                          member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{member.name}</span>
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role === 'admin' ? (
                              <>
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Thành viên
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tham gia {new Date(member.joined).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-semibold">{member.trades}</div>
                        <div className="text-xs text-muted-foreground">Giao dịch</div>
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          "text-sm font-semibold",
                          member.winRate >= 60 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {member.winRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">Win rate</div>
                      </div>
                      
                      {isAdmin && member.role !== 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              Thăng cấp Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Xóa khỏi nhóm
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Hiệu suất nhóm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tổng giao dịch</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Win rate trung bình</span>
                    <span className="font-semibold text-green-600">64.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>P&L tháng này</span>
                    <span className="font-semibold text-green-600">+$12,450</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Top performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Crypto Master', return: '+24.5%', rank: 1 },
                    { name: 'Trader Pro', return: '+18.2%', rank: 2 },
                    { name: 'Moon Walker', return: '+12.8%', rank: 3 }
                  ].map((trader) => (
                    <div key={trader.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                          {trader.rank}
                        </Badge>
                        <span>{trader.name}</span>
                      </div>
                      <span className="font-semibold text-green-600">{trader.return}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Tín hiệu trading
              </CardTitle>
              <CardDescription>
                Các tín hiệu mua/bán được chia sẻ bởi thành viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: '1',
                    author: 'Trader Pro',
                    symbol: 'BTC/USDT',
                    type: 'LONG',
                    entry: '44,500',
                    target: '48,000',
                    stopLoss: '42,800',
                    confidence: 85,
                    time: '2 giờ trước'
                  },
                  {
                    id: '2',
                    author: 'Crypto Master',
                    symbol: 'ETH/USDT',
                    type: 'SHORT',
                    entry: '2,650',
                    target: '2,400',
                    stopLoss: '2,750',
                    confidence: 72,
                    time: '4 giờ trước'
                  }
                ].map((signal) => (
                  <div key={signal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={signal.type === 'LONG' ? 'default' : 'destructive'}>
                          {signal.type}
                        </Badge>
                        <span className="font-semibold">{signal.symbol}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{signal.time}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Entry: </span>
                        <span className="font-semibold">${signal.entry}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target: </span>
                        <span className="font-semibold text-green-600">${signal.target}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">SL: </span>
                        <span className="font-semibold text-red-600">${signal.stopLoss}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-muted-foreground">
                        Bởi {signal.author}
                      </span>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold">{signal.confidence}% tin cậy</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamDetail;
