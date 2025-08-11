import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import TeamCard from '@/components/TeamCard';
import { useTeamStore } from '@/stores/teamStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Users,
  Trophy,
  TrendingUp,
  Star,
  Clock,
  MoreVertical,
  Settings,
  UserPlus,
  Share2,
  Filter,
  Crown,
  Shield,
  Mail,
  Link2,
  Activity,
  BarChart3,
  Target,
  MessageSquare
} from 'lucide-react';

const Teams = () => {
  const navigate = useNavigate();
  const { teams, loading, fetchTeams, createTeam, joinTeam } = useTeamStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'my-teams' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'recent'>('recent');

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    const success = await createTeam({
      name: newTeamName,
      description: newTeamDescription
    });
    if (success) {
      setShowCreateDialog(false);
      setNewTeamName('');
      setNewTeamDescription('');
      await fetchTeams(); // Refresh teams list
      toast({
        title: "Thành công",
        description: "Nhóm đã được tạo thành công!",
      });
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) return;

    const success = await joinTeam(inviteCode);
    if (success) {
      setShowJoinDialog(false);
      setInviteCode('');
      await fetchTeams();
      toast({
        title: "Thành công",
        description: "Đã tham gia nhóm thành công!",
      });
    }
  };

  const filteredAndSortedTeams = (() => {
    let filtered = teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           team.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterType === 'all' ||
                           (filterType === 'my-teams') ||
                           (filterType === 'admin' && team.role === 'admin');

      return matchesSearch && matchesFilter;
    });

    // Sort teams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'members':
          return (b.member_count || 0) - (a.member_count || 0);
        case 'recent':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  })();

  const teamStats = {
    total: teams.length,
    adminTeams: teams.filter(t => t.role === 'admin').length,
    totalMembers: teams.reduce((sum, t) => sum + (t.member_count || 0), 0),
    activeTeams: teams.filter(t => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      return new Date(t.updated_at) > lastWeek;
    }).length
  };

  const handleViewTeam = (teamId: string) => {
    navigate(`/teams/${teamId}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Trading Teams
          </h1>
          <p className="text-muted-foreground">
            Tham gia hoặc tạo nhóm để chia sẻ kinh nghiệm trading và học hỏi lẫn nhau
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Tham gia nhóm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tham gia nhóm existing</DialogTitle>
                <DialogDescription>
                  Nhập mã mời để tham gia một nhóm đã có
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Mã mời nhóm</label>
                  <Input
                    placeholder="Nhập mã mời từ admin nhóm..."
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinDialog(false)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleJoinTeam}
                    disabled={!inviteCode.trim()}
                    className="flex-1"
                  >
                    Tham gia
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo nhóm mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo nhóm trading mới</DialogTitle>
                <DialogDescription>
                  Tạo một nhóm để chia sẻ kiến thức và cùng nhau phát triển trong trading
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tên nhóm *</label>
                  <Input
                    placeholder="Ví dụ: Crypto Hunters Vietnam"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mô tả nhóm</label>
                  <Textarea
                    placeholder="Mô tả về nhóm, mục tiêu và chiến lược trading. Ví dụ: Nhóm tập trung vào swing trading crypto, chia sẻ phân tích kỹ thuật và fundamental..."
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Quyền admin</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bạn sẽ trở thành admin của nhóm và có thể mời thành viên, quản lý nhóm
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleCreateTeam}
                    disabled={!newTeamName.trim()}
                    className="flex-1"
                  >
                    Tạo nhóm
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng nhóm</p>
                <p className="text-2xl font-bold">{teamStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Làm admin</p>
                <p className="text-2xl font-bold">{teamStats.adminTeams}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thành viên</p>
                <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoạt động</p>
                <p className="text-2xl font-bold">{teamStats.activeTeams}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm nhóm theo tên hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>

          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhóm</SelectItem>
              <SelectItem value="my-teams">Nhóm của tôi</SelectItem>
              <SelectItem value="admin">Làm admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sắp xếp:</span>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mới nhất</SelectItem>
              <SelectItem value="name">Tên A-Z</SelectItem>
              <SelectItem value="members">Nhiều thành viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted h-12 w-12"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredAndSortedTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={team.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {team.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {team.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={team.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {team.role === 'admin' ? (
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
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewTeam(team.id)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Xem nhóm
                          </DropdownMenuItem>
                          {team.role === 'admin' && (
                            <>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Cài đặt
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                Chia sẻ mã mời
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Rời nhóm
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {team.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{team.member_count || 0} thành viên</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(team.updated_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleViewTeam(team.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'Không tìm thấy nhóm nào' : 'Chưa có nhóm nào'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc'
                    : 'Hãy tạo nhóm đầu tiên để bắt đầu kết nối với cộng đồng trader'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo nhóm đầu tiên
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Teams;
