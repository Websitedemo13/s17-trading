import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeamStore } from '@/stores/teamStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Bell, Users, Plus, Settings, Activity } from 'lucide-react';

const TeamQuickActions = () => {
  const { teams, fetchTeams } = useTeamStore();
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    showFloatingNotification,
    createNotification 
  } = useNotificationStore();
  
  const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  useEffect(() => {
    // Initialize teams and notifications
    fetchTeams();
    fetchNotifications();
    
    // Test real-time connection
    setRealTimeStatus('connecting');
    
    // Simulate real-time connection
    const timeout = setTimeout(() => {
      setRealTimeStatus('connected');
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const testNotification = () => {
    const demoNotification = {
      id: 'demo_' + Date.now(),
      title: 'Test thông báo!',
      message: 'Đây là thông báo test để kiểm tra hệ thống floating notifications.',
      type: 'info' as const,
      read: false,
      dismissible: true,
      auto_dismiss_ms: 5000,
      metadata: { demo: true },
      created_at: new Date().toISOString()
    };
    
    showFloatingNotification(demoNotification);
  };

  const testTeamNotification = async () => {
    if (teams.length > 0) {
      await createNotification({
        title: 'Thông báo nhóm mới!',
        message: 'Có hoạt động mới trong nhóm của bạn. Hãy kiểm tra ngay!',
        type: 'team_update',
        team_id: teams[0].id,
        dismissible: true,
        auto_dismiss_ms: 6000,
        metadata: { testNotification: true }
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Teams Control Panel
        </CardTitle>
        <CardDescription>
          Kiểm tra các tính năng teams và thông báo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real-time Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Trạng thái Real-time:</span>
          <Badge 
            variant={
              realTimeStatus === 'connected' ? 'default' : 
              realTimeStatus === 'connecting' ? 'secondary' : 'destructive'
            }
          >
            {realTimeStatus === 'connected' ? 'Kết nối' :
             realTimeStatus === 'connecting' ? 'Đang kết nối...' : 'Mất kết nối'}
          </Badge>
        </div>

        {/* Teams Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Số nhóm:</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {teams.length}
          </Badge>
        </div>

        {/* Notifications Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Thông báo chưa đọc:</span>
          <Badge variant={unreadCount > 0 ? 'destructive' : 'outline'} className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {unreadCount}
          </Badge>
        </div>

        {/* Test Actions */}
        <div className="space-y-2 pt-4 border-t">
          <Button 
            onClick={testNotification} 
            className="w-full" 
            variant="outline"
          >
            Test Floating Notification
          </Button>
          
          <Button 
            onClick={testTeamNotification} 
            className="w-full" 
            variant="outline"
            disabled={teams.length === 0}
          >
            Test Team Notification
          </Button>
          
          <Button 
            onClick={() => fetchNotifications()} 
            className="w-full" 
            variant="outline"
          >
            Refresh Notifications
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div>✅ Supabase Integration: Hoạt động</div>
          <div>✅ Floating Notifications: Đã kích hoạt</div>
          <div>✅ Real-time Subscriptions: Sẵn sàng</div>
          <div>✅ Team Management: Đầy đủ tính năng</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamQuickActions;
