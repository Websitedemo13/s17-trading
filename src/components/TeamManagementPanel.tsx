import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedTeamStore } from '@/stores/enhancedTeamStore';
import { useAuthStore } from '@/stores/authStore';
import { EnhancedTeam, ACCOUNT_LIMITS } from '@/types/teams';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Settings,
  Mail,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  Copy,
  Send,
  Star,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';

interface TeamManagementPanelProps {
  team: EnhancedTeam;
  className?: string;
}

export const TeamManagementPanel = ({ team, className }: TeamManagementPanelProps) => {
  const { user } = useAuthStore();
  const {
    userProfile,
    sentInvitations,
    receivedInvitations,
    teamRequests,
    inviteToTeam,
    removeTeamMember,
    updateMemberRole,
    transferOwnership,
    deleteTeam,
    leaveTeam,
    fetchInvitations,
    respondToJoinRequest,
    updateNotificationSettings,
    inviting,
    processing
  } = useEnhancedTeamStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const isOwner = team.is_owner;
  const isAdmin = team.user_role === 'admin' || isOwner;
  const canManageMembers = isAdmin;
  const canDeleteTeam = isOwner;

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive"
      });
      return;
    }

    const success = await inviteToTeam(team.id, inviteEmail, inviteMessage);
    if (success) {
      setInviteEmail('');
      setInviteMessage('');
      setIsInviteOpen(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await removeTeamMember(team.id, memberId);
    if (success) {
      toast({
        title: "Thành công",
        description: "Đã xóa thành viên khỏi nhóm"
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    const success = await updateMemberRole(team.id, memberId, newRole);
    if (success) {
      toast({
        title: "Thành công",
        description: "Đã cập nhật quyền thành viên"
      });
    }
  };

  const handleDeleteTeam = async () => {
    const success = await deleteTeam(team.id);
    if (success) {
      // Navigate away or close panel
    }
  };

  const getRoleIcon = (role: string, isOwner: boolean) => {
    if (isOwner) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (role === 'admin') return <Shield className="h-4 w-4 text-blue-500" />;
    return <Users className="h-4 w-4 text-gray-500" />;
  };

  const getAccountTypeBadge = (accountType: string) => {
    const config = ACCOUNT_LIMITS[accountType as keyof typeof ACCOUNT_LIMITS];
    if (!config) return null;

    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "text-xs",
          accountType === 'basic' && "bg-gray-100 text-gray-700",
          accountType === 'premium' && "bg-blue-100 text-blue-700",
          accountType === 'enterprise' && "bg-purple-100 text-purple-700"
        )}
      >
        {config.name}
      </Badge>
    );
  };

  const teamInvitations = sentInvitations.filter(inv => inv.team_id === team.id);
  const teamJoinRequests = teamRequests.filter(req => req.team_id === team.id);

  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={team.avatar_url} />
              <AvatarFallback className="text-xl font-bold">
                {team.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{team.name}</h2>
              <p className="text-muted-foreground">{team.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {team.member_count} thành viên
                </Badge>
                {isOwner && (
                  <Badge variant="default" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Trưởng nhóm
                  </Badge>
                )}
                {team.user_role === 'admin' && !isOwner && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Quản trị viên
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManageMembers && (
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Mời thành viên
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mời thành viên vào nhóm</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        placeholder="email@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tin nhắn (tùy chọn)</label>
                      <Textarea
                        placeholder="Lời mời tham gia nhóm..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleInviteMember}
                        disabled={inviting || !inviteEmail.trim()}
                        className="flex-1"
                      >
                        {inviting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Gửi lời mời
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteOpen(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="members">
              Thành viên
              {team.pending_requests > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {team.pending_requests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Lời mời
              {teamInvitations.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {teamInvitations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Stats */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Thống kê nhóm</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng thành viên</span>
                    <span className="font-medium">{team.member_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lời mời pending</span>
                    <span className="font-medium">{team.pending_invitations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yêu cầu tham gia</span>
                    <span className="font-medium">{team.pending_requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày tạo</span>
                    <span className="font-medium">
                      {new Date(team.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Hoạt động gần đây</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-muted-foreground">Có tin nhắn mới</span>
                    <span className="text-xs text-muted-foreground ml-auto">2 phút trước</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-muted-foreground">Thành viên mới tham gia</span>
                    <span className="text-xs text-muted-foreground ml-auto">1 giờ trước</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                    <span className="text-muted-foreground">Cập nhật thông tin nhóm</span>
                    <span className="text-xs text-muted-foreground ml-auto">1 ngày trước</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-4 mt-6">
              <h3 className="font-semibold mb-4">Thao tác nhanh</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="flex flex-col h-20 gap-2">
                  <Mail className="h-5 w-5" />
                  <span className="text-xs">Chia sẻ nhóm</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-20 gap-2">
                  <Copy className="h-5 w-5" />
                  <span className="text-xs">Copy link</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-20 gap-2">
                  <Star className="h-5 w-5" />
                  <span className="text-xs">Đánh dấu</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-20 gap-2">
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Cài đặt</span>
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-6">
            <div className="space-y-6">
              {/* Current Members */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Thành viên hiện tại ({team.member_count})</h3>
                <ScrollArea className="max-h-96">
                  <div className="space-y-3">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.user?.avatar_url} />
                            <AvatarFallback>
                              {member.user?.display_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {member.user?.display_name || 'Anonymous'}
                              </span>
                              {getRoleIcon(member.role, member.is_owner)}
                              {member.user?.account_type && getAccountTypeBadge(member.user.account_type)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Tham gia {new Date(member.joined_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        {canManageMembers && member.user_id !== user?.id && !member.is_owner && (
                          <div className="flex items-center gap-2">
                            <Select
                              value={member.role}
                              onValueChange={(role) => handleRoleChange(member.id, role as 'admin' | 'member')}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Thành viên</SelectItem>
                                <SelectItem value="admin">Quản trị</SelectItem>
                              </SelectContent>
                            </Select>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa thành viên</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc muốn xóa {member.user?.display_name} khỏi nhóm?
                                    Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Join Requests */}
              {canManageMembers && teamJoinRequests.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    Yêu cầu tham gia
                    <Badge variant="destructive">{teamJoinRequests.length}</Badge>
                  </h3>
                  <div className="space-y-3">
                    {teamJoinRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.requester?.avatar_url} />
                            <AvatarFallback>
                              {request.requester?.display_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {request.requester?.display_name || 'Anonymous'}
                              </span>
                              {request.requester?.account_type && getAccountTypeBadge(request.requester.account_type)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.message || 'Muốn tham gia nhóm'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => respondToJoinRequest(request.id, true)}
                            disabled={processing}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Chấp nhận
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => respondToJoinRequest(request.id, false)}
                            disabled={processing}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="mt-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Lời mời đã gửi</h3>
              {teamInvitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có lời mời nào được gửi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{invitation.invitee_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {invitation.message || 'Lời mời tham gia nhóm'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Gửi {new Date(invitation.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            invitation.status === 'pending' ? 'default' :
                            invitation.status === 'accepted' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {invitation.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {invitation.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {invitation.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {invitation.status === 'pending' ? 'Đang chờ' :
                           invitation.status === 'accepted' ? 'Đã chấp nhận' :
                           'Đã từ chối'}
                        </Badge>
                        {invitation.status === 'pending' && canManageMembers && (
                          <Button variant="outline" size="sm">
                            Hủy
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              {/* Notification Settings */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Cài đặt thông báo</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Thông báo floating</p>
                      <p className="text-sm text-muted-foreground">
                        Hiển thị thông báo nổi khi có tin nhắn mới
                      </p>
                    </div>
                    <Switch
                      checked={userProfile?.notification_settings?.floating_teams ?? true}
                      onCheckedChange={(checked) => 
                        updateNotificationSettings({ floating_teams: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Âm thanh thông báo</p>
                      <p className="text-sm text-muted-foreground">
                        Phát âm thanh khi có thông báo mới
                      </p>
                    </div>
                    <Switch
                      checked={userProfile?.notification_settings?.sound ?? true}
                      onCheckedChange={(checked) => 
                        updateNotificationSettings({ sound: checked })
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Team Actions */}
              {(isOwner || isAdmin) && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Quản lý nhóm</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Chỉnh sửa thông tin nhóm
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Copy className="h-4 w-4 mr-2" />
                      Sao chép link mời
                    </Button>
                    {isOwner && (
                      <Button variant="outline" className="w-full justify-start">
                        <Crown className="h-4 w-4 mr-2" />
                        Chuyển quyền sở hữu
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              {/* Danger Zone */}
              <Card className="p-4 border-destructive">
                <h3 className="font-semibold mb-4 text-destructive">Vùng nguy hiểm</h3>
                <div className="space-y-3">
                  {!isOwner && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Rời khỏi nhóm
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rời khỏi nhóm</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn rời khỏi nhóm "{team.name}"?
                            Bạn sẽ không thể truy cập các tin nhắn và tài liệu của nhóm.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => leaveTeam(team.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Rời khỏi nhóm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {canDeleteTeam && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa nhóm vĩnh viễn
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa nhóm vĩnh viễn</AlertDialogTitle>
                          <AlertDialogDescription>
                            <AlertTriangle className="h-5 w-5 text-destructive inline mr-2" />
                            Hành động này không thể hoàn tác! Tất cả dữ liệu của nhóm bao gồm
                            tin nhắn, file và thành viên sẽ bị xóa vĩnh viễn.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteTeam}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Xóa vĩnh viễn
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default TeamManagementPanel;
