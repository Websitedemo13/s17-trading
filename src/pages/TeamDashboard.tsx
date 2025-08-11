import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeamStore } from '@/stores/teamStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Settings,
  Users,
  UserPlus,
  Share2,
  Copy,
  Crown,
  Shield,
  MoreVertical,
  Trash2,
  Edit,
  Activity,
  Bell,
  BellOff,
  Mail,
  Calendar,
  TrendingUp,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const TeamDashboard = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const {
    currentTeam,
    teamMembers,
    teamSettings,
    loading,
    fetchTeamMembers,
    updateTeam,
    deleteTeam,
    inviteMember,
    removeMember,
    updateMemberRole,
    fetchTeamSettings,
    updateTeamSettings,
    generateInviteLink,
    getTeamStats,
    setCurrentTeam,
    subscribeToTeam,
    subscribeToTeamMembers
  } = useTeamStore();

  const {
    activities,
    notifications,
    fetchActivities,
    fetchNotifications,
    markAllAsRead,
    subscribeToTeamNotifications,
    subscribeToTeamActivities
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamDescription, setEditTeamDescription] = useState('');
  const [teamStats, setTeamStats] = useState<any>({});

  useEffect(() => {
    if (teamId) {
      // Find team in current teams list
      const team = useTeamStore.getState().teams.find(t => t.id === teamId);
      if (team) {
        setCurrentTeam(team);
        setEditTeamName(team.name);
        setEditTeamDescription(team.description || '');
      }

      // Fetch team data
      fetchTeamMembers(teamId);
      fetchTeamSettings(teamId);
      fetchActivities(teamId);
      fetchNotifications(teamId);

      // Get team stats
      getTeamStats(teamId).then(setTeamStats);

      // Set up real-time subscriptions
      const unsubscribeTeam = subscribeToTeam(teamId);
      const unsubscribeMembers = subscribeToTeamMembers(teamId);
      const unsubscribeNotifications = subscribeToTeamNotifications(teamId);
      const unsubscribeActivities = subscribeToTeamActivities(teamId);

      return () => {
        unsubscribeTeam();
        unsubscribeMembers();
        unsubscribeNotifications();
        unsubscribeActivities();
      };
    }
  }, [teamId]);

  const handleInviteMember = async () => {
    if (!teamId || !inviteEmail) return;

    const success = await inviteMember(teamId, inviteEmail, inviteRole);
    if (success) {
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('member');
    }
  };

  const handleUpdateTeam = async () => {
    if (!teamId) return;

    const success = await updateTeam(teamId, {
      name: editTeamName,
      description: editTeamDescription
    });

    if (success) {
      setShowEditDialog(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamId) return;

    const success = await deleteTeam(teamId);
    if (success) {
      navigate('/teams');
    }
  };

  const handleCopyInviteLink = () => {
    if (!teamId) return;

    const inviteLink = generateInviteLink(teamId);
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast({
        title: "Link mời đã được sao chép",
        description: "Chia sẻ link này để mời thành viên tham gia nhóm",
      });
    });
  };

  const handleRemoveMember = async (userId: string) => {
    if (!teamId) return;

    const success = await removeMember(teamId, userId);
    if (success) {
      fetchTeamMembers(teamId);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'member') => {
    if (!teamId) return;

    const success = await updateMemberRole(teamId, userId, newRole);
    if (success) {
      fetchTeamMembers(teamId);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    if (teamId) {
      markAllAsRead(teamId);
    }
  };

  if (!currentTeam) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy nhóm</h2>
          <p className="text-muted-foreground">Nhóm này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentTeam.role === 'admin';
  const unreadNotificationsCount = notifications.filter(n => !n.read && n.team_id === teamId).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentTeam.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {currentTeam.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{currentTeam.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={isAdmin ? 'default' : 'secondary'}>
                  {isAdmin ? (
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
                <span className="text-sm text-muted-foreground">
                  {teamMembers.length} thành viên
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyInviteLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Chia sẻ
          </Button>
          
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Quản lý
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Quản lý nhóm</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa thông tin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Mời thành viên
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa nhóm
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa nhóm</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa nhóm "{currentTeam.name}"? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteTeam} className="bg-red-600 hover:bg-red-700">
                        Xóa nhóm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thành viên</p>
                <p className="text-2xl font-bold">{teamStats.memberCount || teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoạt động tuần</p>
                <p className="text-2xl font-bold">{teamStats.recentActivity?.length || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thông báo</p>
                <p className="text-2xl font-bold">{unreadNotificationsCount}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tạo lập</p>
                <p className="text-sm font-medium">{new Date(currentTeam.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
          <TabsTrigger value="notifications">
            Thông báo {unreadNotificationsCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadNotificationsCount}
              </Badge>
            )}
          </TabsTrigger>
          {isAdmin && <TabsTrigger value="settings">Cài đặt</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Team Description */}
          <Card>
            <CardHeader>
              <CardTitle>Về nhóm này</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {currentTeam.description || 'Chưa có mô tả cho nhóm này.'}
              </p>
            </CardContent>
          </Card>

          {/* Recent Activity Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setActiveTab('activity')}
                  >
                    Xem tất cả hoạt động
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Chưa có hoạt động nào trong nhóm
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Danh sách thành viên ({teamMembers.length})</h3>
            {isAdmin && (
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Mời th��nh viên
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url} />
                      <AvatarFallback>
                        {member.user?.display_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.display_name}</p>
                      <div className="flex items-center gap-2">
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
                        <span className="text-xs text-muted-foreground">
                          Tham gia {new Date(member.joined_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && member.user_id !== useTeamStore.getState().teams.find(t => t.id === teamId)?.created_by && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Quản lý thành viên</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateRole(member.user_id, member.role === 'admin' ? 'member' : 'admin')}
                        >
                          {member.role === 'admin' ? 'Hạ xuống thành viên' : 'Thăng lên admin'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa khỏi nhóm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lịch sử hoạt động</h3>
          </div>

          <div className="space-y-3">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getActivityTypeLabel(activity.activity_type)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Thông báo nhóm</h3>
            {unreadNotificationsCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllNotificationsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Đánh dấu đã đọc tất cả
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.filter(n => n.team_id === teamId).map((notification) => (
              <Card key={notification.id} className={!notification.read ? 'border-primary/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString('vi-VN')}
                        </span>
                        {!notification.read && (
                          <Badge variant="destructive" className="text-xs">Mới</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt nhóm</CardTitle>
                <CardDescription>
                  Quản lý các cài đặt và quyền cho nhóm của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Bật thông báo</Label>
                    <p className="text-xs text-muted-foreground">
                      Gửi thông báo cho các hoạt động trong nhóm
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={teamSettings[teamId]?.enableNotifications !== false}
                    onCheckedChange={(checked) => 
                      updateTeamSettings(teamId!, { enableNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activities">Theo dõi hoạt động</Label>
                    <p className="text-xs text-muted-foreground">
                      Ghi lại các hoạt động của thành viên
                    </p>
                  </div>
                  <Switch
                    id="activities"
                    checked={teamSettings[teamId]?.enableActivities !== false}
                    onCheckedChange={(checked) => 
                      updateTeamSettings(teamId!, { enableActivities: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-join">Cho phép tham gia công khai</Label>
                    <p className="text-xs text-muted-foreground">
                      Thành viên có thể tham gia mà không cần phê duyệt
                    </p>
                  </div>
                  <Switch
                    id="public-join"
                    checked={teamSettings[teamId]?.allowPublicJoin === true}
                    onCheckedChange={(checked) => 
                      updateTeamSettings(teamId!, { allowPublicJoin: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mời thành viên mới</DialogTitle>
            <DialogDescription>
              Nhập email để mời thành viên tham gia nhóm
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Quyền hạn</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Thành viên</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
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
                disabled={!inviteEmail}
                className="flex-1"
              >
                Gửi lời mời
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin nhóm</DialogTitle>
            <DialogDescription>
              Cập nhật tên và mô tả cho nhóm của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tên nhóm</Label>
              <Input
                id="name"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={editTeamDescription}
                onChange={(e) => setEditTeamDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdateTeam}
                disabled={!editTeamName}
                className="flex-1"
              >
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const getActivityTypeLabel = (type: string) => {
  switch (type) {
    case 'member_joined':
      return 'Tham gia';
    case 'member_left':
      return 'Rời nhóm';
    case 'role_changed':
      return 'Thay đổi quyền';
    case 'team_created':
      return 'Tạo nhóm';
    case 'team_updated':
      return 'Cập nhật';
    case 'message_sent':
      return 'Tin nhắn';
    case 'file_shared':
      return 'Chia sẻ file';
    default:
      return 'Hoạt động';
  }
};

const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case 'team_join':
      return 'Tham gia';
    case 'team_leave':
      return 'Rời nhóm';
    case 'role_change':
      return 'Quyền hạn';
    case 'team_update':
      return 'Cập nhật';
    case 'team_invite':
      return 'Lời mời';
    case 'success':
      return 'Thành công';
    case 'warning':
      return 'Cảnh báo';
    case 'error':
      return 'Lỗi';
    default:
      return 'Thông báo';
  }
};

const getNotificationIcon = (type: string) => {
  const iconProps = { className: "h-4 w-4" };
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="h-4 w-4 text-green-600" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-yellow-600" />;
    case 'error':
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-red-600" />;
    case 'team_join':
      return <UserPlus {...iconProps} className="h-4 w-4 text-green-600" />;
    case 'team_leave':
      return <Users {...iconProps} className="h-4 w-4 text-orange-600" />;
    case 'role_change':
      return <Crown {...iconProps} className="h-4 w-4 text-purple-600" />;
    case 'team_update':
      return <Settings {...iconProps} className="h-4 w-4 text-blue-600" />;
    case 'team_invite':
      return <Mail {...iconProps} className="h-4 w-4 text-indigo-600" />;
    default:
      return <Bell {...iconProps} className="h-4 w-4 text-blue-600" />;
  }
};

export default TeamDashboard;
