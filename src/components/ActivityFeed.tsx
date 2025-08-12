import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import {
  Activity,
  User,
  Key,
  Eye,
  Settings,
  Bell,
  Palette,
  Shield,
  Trash2,
  Download,
  Camera,
  Edit,
  LogIn,
  LogOut,
  Smartphone,
  Globe,
  Clock,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

const getActivityIcon = (activityType: string) => {
  const iconMap: Record<string, any> = {
    'user_login': LogIn,
    'user_logout': LogOut,
    'profile_updated': Edit,
    'avatar_updated': Camera,
    'password_changed': Key,
    'profile_viewed': Eye,
    'privacy_settings_updated': Shield,
    'notification_settings_updated': Bell,
    'appearance_settings_updated': Palette,
    '2fa_enabled': Shield,
    '2fa_disabled': Shield,
    'data_exported': Download,
    'account_deletion_initiated': Trash2,
    'session_created': LogIn,
    'session_revoked': LogOut,
    'user_registered': User,
    'backup_codes_generated': Key,
    'avatar_deleted': Camera,
    'all_sessions_revoked': Smartphone,
    'default': Activity
  };

  return iconMap[activityType] || iconMap.default;
};

const getActivityColor = (activityType: string) => {
  const colorMap: Record<string, string> = {
    'user_login': 'text-success',
    'user_logout': 'text-muted-foreground',
    'profile_updated': 'text-primary',
    'avatar_updated': 'text-primary',
    'password_changed': 'text-warning',
    'privacy_settings_updated': 'text-info',
    'notification_settings_updated': 'text-info',
    'appearance_settings_updated': 'text-info',
    '2fa_enabled': 'text-success',
    '2fa_disabled': 'text-destructive',
    'data_exported': 'text-primary',
    'account_deletion_initiated': 'text-destructive',
    'user_registered': 'text-success',
    'backup_codes_generated': 'text-warning',
    'avatar_deleted': 'text-warning',
    'all_sessions_revoked': 'text-warning',
    'default': 'text-muted-foreground'
  };

  return colorMap[activityType] || colorMap.default;
};

const getActivityTitle = (activityType: string) => {
  const titleMap: Record<string, string> = {
    'user_login': 'Đăng nhập',
    'user_logout': 'Đăng xuất',
    'profile_updated': 'Cập nhật hồ sơ',
    'avatar_updated': 'Thay đổi ảnh đại diện',
    'avatar_deleted': 'Xóa ảnh đại diện',
    'password_changed': 'Đổi mật khẩu',
    'profile_viewed': 'Xem hồ sơ',
    'privacy_settings_updated': 'Cập nhật riêng tư',
    'notification_settings_updated': 'Cập nhật thông báo',
    'appearance_settings_updated': 'Cập nhật giao diện',
    '2fa_enabled': 'Kích hoạt 2FA',
    '2fa_disabled': 'Tắt 2FA',
    'data_exported': 'Xuất dữ liệu',
    'account_deletion_initiated': 'Yêu cầu xóa tài khoản',
    'session_created': 'Tạo phiên đăng nhập',
    'session_revoked': 'Thu hồi phiên',
    'user_registered': 'Đăng ký tài khoản',
    'backup_codes_generated': 'Tạo mã dự phòng',
    'all_sessions_revoked': 'Thu hồi tất cả phiên',
    'default': 'Hoạt động'
  };

  return titleMap[activityType] || titleMap.default;
};

const getActivityDescription = (activityType: string, activityData: any) => {
  switch (activityType) {
    case 'profile_updated':
      if (activityData?.fields) {
        const fieldNames = activityData.fields.map((field: string) => {
          const nameMap: Record<string, string> = {
            'display_name': 'tên hiển thị',
            'bio': 'tiểu sử',
            'phone': 'số điện thoại',
            'location': 'địa chỉ',
            'website': 'website',
            'company': 'công ty'
          };
          return nameMap[field] || field;
        }).join(', ');
        return `Đã cập nhật: ${fieldNames}`;
      }
      return 'Cập nhật thông tin cá nhân';
    
    case 'avatar_updated':
      return 'Thay đổi ảnh đại diện thành công';
    
    case 'password_changed':
      return 'Mật khẩu đã được thay đổi';
    
    case 'privacy_settings_updated':
      return 'Cập nhật cài đặt quyền riêng tư';
    
    case 'notification_settings_updated':
      return 'Cập nhật cài đặt thông báo';
    
    case 'appearance_settings_updated':
      return 'Cập nhật giao diện hiển thị';
    
    case '2fa_enabled':
      return 'Đã kích hoạt xác thực hai yếu tố';
    
    case '2fa_disabled':
      return 'Đã tắt xác thực hai yếu tố';
    
    case 'data_exported':
      return 'Xuất dữ liệu cá nhân thành công';
    
    case 'backup_codes_generated':
      return `Tạo ${activityData?.count || 10} mã dự phòng mới`;
    
    case 'all_sessions_revoked':
      return 'Thu hồi tất cả phiên đăng nhập';
    
    case 'user_login':
      return 'Đăng nhập vào hệ thống';
    
    case 'user_registered':
      return 'Tạo tài khoản mới';
    
    default:
      return 'Thực hiện hoạt động';
  }
};

const getDeviceInfo = (userAgent?: string) => {
  if (!userAgent) return 'Thiết bị không xác định';
  
  if (userAgent.includes('Mobile')) return 'Điện thoại';
  if (userAgent.includes('Tablet')) return 'Máy tính bảng';
  if (userAgent.includes('Chrome')) return 'Chrome Desktop';
  if (userAgent.includes('Firefox')) return 'Firefox Desktop';
  if (userAgent.includes('Safari')) return 'Safari Desktop';
  if (userAgent.includes('Edge')) return 'Edge Desktop';
  
  return 'Máy tính';
};

interface ActivityFeedProps {
  userId?: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export const ActivityFeed = ({ 
  userId, 
  limit = 20, 
  showHeader = true,
  className = ""
}: ActivityFeedProps) => {
  const { user } = useAuthStore();
  const { activities, fetchUserActivities, loading } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchUserActivities(targetUserId, limit);
    }
  }, [targetUserId, limit]);

  const handleRefresh = async () => {
    if (!targetUserId) return;
    
    setRefreshing(true);
    await fetchUserActivities(targetUserId, limit);
    setRefreshing(false);
  };

  const groupedActivities = activities.reduce((groups: Record<string, ActivityItem[]>, activity) => {
    const date = new Date(activity.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  if (!targetUserId) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Vui lòng đăng nhập để xem hoạt động</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Lịch sử hoạt động
            </CardTitle>
            <CardDescription>
              Theo dõi các hoạt động gần đây của tài khoản
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </CardHeader>
      )}
      
      <CardContent className={showHeader ? "" : "pt-6"}>
        {loading && activities.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Chưa có hoạt động nào</p>
            <p className="text-sm">Các hoạt động của bạn sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {new Date(date).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                  </div>
                  
                  <div className="space-y-3 ml-6 border-l-2 border-border pl-4">
                    {dayActivities.map((activity, index) => {
                      const IconComponent = getActivityIcon(activity.activity_type);
                      const iconColor = getActivityColor(activity.activity_type);
                      const title = getActivityTitle(activity.activity_type);
                      const description = getActivityDescription(activity.activity_type, activity.activity_data);
                      const deviceInfo = getDeviceInfo(activity.user_agent);
                      
                      return (
                        <div key={activity.id} className="flex items-start space-x-3 relative">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border ${iconColor} absolute -left-8`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{title}</p>
                              <div className="flex items-center gap-2">
                                <time className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(activity.created_at), {
                                    addSuffix: true,
                                    locale: vi
                                  })}
                                </time>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{description}</p>
                            
                            {/* Additional details */}
                            <div className="flex items-center gap-4 mt-1">
                              {activity.ip_address && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Globe className="h-3 w-3" />
                                  {activity.ip_address}
                                </div>
                              )}
                              {activity.user_agent && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Smartphone className="h-3 w-3" />
                                  {deviceInfo}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {Object.keys(groupedActivities).indexOf(date) < Object.keys(groupedActivities).length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
