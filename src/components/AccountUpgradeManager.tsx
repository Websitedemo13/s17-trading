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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedTeamStore } from '@/stores/enhancedTeamStore';
import { useAuthStore } from '@/stores/authStore';
import { AccountType, ACCOUNT_LIMITS } from '@/types/teams';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Star,
  Zap,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Shield,
  Award,
  Gift,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Mail
} from 'lucide-react';

interface AccountUpgradeManagerProps {
  className?: string;
}

export const AccountUpgradeManager = ({ className }: AccountUpgradeManagerProps) => {
  const { user } = useAuthStore();
  const {
    userProfile,
    upgradeRequests,
    fetchUpgradeRequests,
    processUpgradeRequest,
    upgradeUserAccount,
    requestAccountUpgrade,
    processing
  } = useEnhancedTeamStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>('premium');
  const [upgradeReason, setUpgradeReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const isAdmin = userProfile?.is_admin;
  const currentAccountType = userProfile?.account_type || 'basic';
  const currentLimits = ACCOUNT_LIMITS[currentAccountType];

  useEffect(() => {
    if (isAdmin) {
      fetchUpgradeRequests();
    }
  }, [isAdmin, fetchUpgradeRequests]);

  const handleRequestUpgrade = async () => {
    if (!upgradeReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do yêu cầu nâng cấp",
        variant: "destructive"
      });
      return;
    }

    const success = await requestAccountUpgrade(selectedAccountType, upgradeReason);
    if (success) {
      setUpgradeReason('');
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu nâng cấp tài khoản"
      });
    }
  };

  const handleProcessRequest = async (requestId: string, approve: boolean) => {
    const success = await processUpgradeRequest(requestId, approve, adminNotes);
    if (success) {
      setAdminNotes('');
      setSelectedRequest(null);
      fetchUpgradeRequests();
    }
  };

  const getAccountTypeIcon = (accountType: AccountType) => {
    switch (accountType) {
      case 'basic':
        return <User className="h-5 w-5 text-gray-500" />;
      case 'premium':
        return <Star className="h-5 w-5 text-blue-500" />;
      case 'enterprise':
        return <Crown className="h-5 w-5 text-purple-500" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getAccountTypeColor = (accountType: AccountType) => {
    switch (accountType) {
      case 'basic':
        return 'text-gray-700 bg-gray-100';
      case 'premium':
        return 'text-blue-700 bg-blue-100';
      case 'enterprise':
        return 'text-purple-700 bg-purple-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const pendingRequests = upgradeRequests.filter(req => req.status === 'pending');
  const processedRequests = upgradeRequests.filter(req => req.status !== 'pending');

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Quản lý tài khoản</h2>
            <p className="text-muted-foreground">
              {isAdmin ? 'Quản lý nâng cấp tài khoản người dùng' : 'Nâng cấp tài khoản của bạn'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getAccountTypeIcon(currentAccountType)}
            <Badge className={getAccountTypeColor(currentAccountType)}>
              {currentLimits.name}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="upgrade">
              {isAdmin ? 'Yêu cầu nâng cấp' : 'Nâng cấp tài khoản'}
              {isAdmin && pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="plans">Gói dịch vụ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Account Status */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  {getAccountTypeIcon(currentAccountType)}
                  Tài khoản hiện tại
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loại tài khoản</span>
                    <Badge className={getAccountTypeColor(currentAccountType)}>
                      {currentLimits.name}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số nhóm tối đa</span>
                    <span className="font-medium">{currentLimits.max_teams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thành viên/nhóm</span>
                    <span className="font-medium">{currentLimits.max_team_members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tính năng</span>
                    <span className="font-medium">{currentLimits.features.length}</span>
                  </div>
                </div>
              </Card>

              {/* Usage Statistics */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Thống kê sử dụng</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Nhóm đã tham gia</span>
                      <span className="text-sm font-medium">3/{currentLimits.max_teams}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(3 / currentLimits.max_teams) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Tính năng đã dùng</span>
                      <span className="text-sm font-medium">
                        {currentLimits.features.length}/{Math.max(...Object.values(ACCOUNT_LIMITS).map(l => l.features.length))}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(currentLimits.features.length / Math.max(...Object.values(ACCOUNT_LIMITS).map(l => l.features.length))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Admin Stats (Admin only) */}
              {isAdmin && (
                <Card className="p-4 md:col-span-2">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Thống kê quản trị
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{pendingRequests.length}</div>
                      <div className="text-sm text-muted-foreground">Yêu cầu pending</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {processedRequests.filter(r => r.status === 'approved').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Đã duyệt</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {processedRequests.filter(r => r.status === 'rejected').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Đã từ chối</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{upgradeRequests.length}</div>
                      <div className="text-sm text-muted-foreground">Tổng yêu cầu</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Upgrade Tab */}
          <TabsContent value="upgrade" className="mt-6">
            {isAdmin ? (
              /* Admin View - Manage Upgrade Requests */
              <div className="space-y-6">
                {/* Pending Requests */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    Yêu cầu đang chờ duyệt
                    {pendingRequests.length > 0 && (
                      <Badge variant="destructive">{pendingRequests.length}</Badge>
                    )}
                  </h3>
                  
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Không có yêu cầu nâng cấp đang chờ</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={request.user?.avatar_url} />
                                <AvatarFallback>
                                  {request.user?.display_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <h4 className="font-medium">{request.user?.display_name || 'Anonymous'}</h4>
                                <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                                
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">Từ:</span>
                                    <Badge className={getAccountTypeColor(request.current_type)}>
                                      {ACCOUNT_LIMITS[request.current_type].name}
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-muted-foreground">→</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">Đến:</span>
                                    <Badge className={getAccountTypeColor(request.requested_type)}>
                                      {ACCOUNT_LIMITS[request.requested_type].name}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {request.reason && (
                                  <div className="mt-3 p-3 bg-muted rounded-md">
                                    <p className="text-sm text-muted-foreground">Lý do:</p>
                                    <p className="text-sm">{request.reason}</p>
                                  </div>
                                )}
                                
                                <p className="text-xs text-muted-foreground mt-2">
                                  Yêu cầu lúc: {new Date(request.created_at).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleProcessRequest(request.id, true)}
                                  disabled={processing}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Duyệt
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleProcessRequest(request.id, false)}
                                  disabled={processing}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Từ chối
                                </Button>
                              </div>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Ghi chú
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Ghi chú cho yêu cầu</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      placeholder="Ghi chú của admin..."
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      rows={4}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleProcessRequest(request.id, true)}
                                        disabled={processing}
                                        className="flex-1"
                                      >
                                        Duyệt với ghi chú
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleProcessRequest(request.id, false)}
                                        disabled={processing}
                                        className="flex-1"
                                      >
                                        Từ chối với ghi chú
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Processed Requests History */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Lịch sử xử lý</h3>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-3">
                      {processedRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.user?.avatar_url} />
                              <AvatarFallback>
                                {request.user?.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{request.user?.display_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {ACCOUNT_LIMITS[request.current_type].name} → {ACCOUNT_LIMITS[request.requested_type].name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={request.status === 'approved' ? 'secondary' : 'destructive'}
                            >
                              {request.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(request.reviewed_at || request.updated_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            ) : (
              /* User View - Request Account Upgrade */
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Yêu cầu nâng cấp tài khoản</h3>
                
                {currentAccountType === 'enterprise' ? (
                  <div className="text-center py-8">
                    <Crown className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                    <h4 className="text-lg font-semibold mb-2">Bạn đã có gói cao nhất!</h4>
                    <p className="text-muted-foreground">
                      Tài khoản Enterprise cung cấp tất cả tính năng premium
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium">Nâng cấp lên</label>
                      <Select value={selectedAccountType} onValueChange={(value) => setSelectedAccountType(value as AccountType)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ACCOUNT_LIMITS).map(([type, limits]) => {
                            if (type === currentAccountType) return null;
                            return (
                              <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                  {getAccountTypeIcon(type as AccountType)}
                                  <span>{limits.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {limits.max_teams} nhóm
                                  </Badge>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Lý do yêu cầu nâng cấp</label>
                      <Textarea
                        placeholder="Vì sao bạn cần nâng cấp tài khoản? (ví dụ: cần tham gia nhiều nhóm làm việc hơn, cần tính năng video call...)"
                        value={upgradeReason}
                        onChange={(e) => setUpgradeReason(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <Button
                      onClick={handleRequestUpgrade}
                      disabled={processing || !upgradeReason.trim()}
                      className="w-full"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Đang gửi yêu cầu...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Gửi yêu cầu nâng cấp
                        </>
                      )}
                    </Button>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Lưu ý:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Yêu cầu sẽ được admin xem xét trong 1-2 ngày làm việc</li>
                        <li>• Bạn sẽ nhận được thông báo khi yêu cầu được xử lý</li>
                        <li>• Việc nâng cấp hoàn toàn miễn phí</li>
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(ACCOUNT_LIMITS).map(([type, limits]) => (
                <Card 
                  key={type}
                  className={cn(
                    "p-6 relative",
                    currentAccountType === type && "ring-2 ring-primary",
                    type === 'premium' && "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20",
                    type === 'enterprise' && "border-purple-200 bg-purple-50/50 dark:bg-purple-950/20"
                  )}
                >
                  {type === 'premium' && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Phổ biến
                    </Badge>
                  )}
                  {type === 'enterprise' && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                      Tốt nhất
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      {getAccountTypeIcon(type as AccountType)}
                    </div>
                    <h3 className="text-xl font-bold">{limits.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{limits.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{limits.max_teams}</div>
                      <div className="text-sm text-muted-foreground">Nhóm tối đa</div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Thành viên/nhóm</span>
                        <span className="text-sm font-medium">{limits.max_team_members}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Tính năng:</span>
                        <ul className="space-y-1">
                          {limits.features.map((feature) => (
                            <li key={feature} className="text-xs text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature === 'basic_chat' && 'Chat cơ bản'}
                              {feature === 'file_sharing' && 'Chia sẻ file'}
                              {feature === 'video_calls' && 'Gọi video'}
                              {feature === 'advanced_admin' && 'Quản trị nâng cao'}
                              {feature === 'analytics' && 'Thống kê'}
                              {feature === 'api_access' && 'Truy cập API'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {currentAccountType === type ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Đang sử dụng
                      </Button>
                    ) : (
                      <Button 
                        variant={type === 'premium' ? 'default' : type === 'enterprise' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => {
                          setSelectedAccountType(type as AccountType);
                          setActiveTab('upgrade');
                        }}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Nâng cấp
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default AccountUpgradeManager;
