import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';
import { useBlogStore } from '@/stores/blogStore';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Activity, 
  Shield, 
  Database,
  Brain,
  BarChart3,
  Globe,
  Settings,
  DollarSign,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { isAdmin, adminUser, stats, loading, fetchStats, getAllUsers, updateUserStatus, deleteUser } = useAdminStore();
  const { posts, loading: blogLoading, fetchPosts, createPost, updatePost, deletePost, publishPost, unpublishPost } = useBlogStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      loadUsers();
      fetchPosts();
    }
  }, [isAdmin, fetchStats, fetchPosts]);

  const loadUsers = async () => {
    const userData = await getAllUsers();
    setUsers(userData);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ tiêu đề v�� nội dung",
        variant: "destructive"
      });
      return;
    }

    const success = await createPost({
      title: newPostTitle,
      content: newPostContent,
      author: adminUser?.email || 'admin',
      status: 'draft',
      slug: newPostTitle.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    });

    if (success) {
      setNewPostTitle('');
      setNewPostContent('');
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    const success = await updatePost(editingPost.id, {
      title: editingPost.title,
      content: editingPost.content
    });

    if (success) {
      setEditingPost(null);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    let success = false;

    switch (action) {
      case 'activate':
        success = await updateUserStatus(userId, true);
        break;
      case 'deactivate':
        success = await updateUserStatus(userId, false);
        break;
      case 'delete':
        success = await deleteUser(userId);
        break;
    }

    if (success) {
      loadUsers(); // Reload users after action
    }
  };

  // Redirect if not admin
  if (!isAdmin || !adminUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", `text-${color}-600`)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", `text-${color}-600`)}>
          {value}
        </div>
        {change && (
          <p className={cn(
            "text-xs flex items-center gap-1",
            change > 0 ? "text-green-600" : "text-red-600"
          )}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
            {change > 0 ? '+' : ''}{change}% từ tháng trước
          </p>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }: any) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", `bg-${color}-100`, `text-${color}-600`)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Đang tải dashboard admin...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Chào mừng {adminUser.displayName} - Quản lý toàn bộ hệ thống S17 Trading
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          Super Admin Access
        </Badge>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng người dùng"
            value={stats.totalUsers.toLocaleString()}
            change={stats.monthlyGrowth.users}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Người dùng hoạt động"
            value={stats.activeUsers.toLocaleString()}
            change={5.2}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Tổng nhóm chat"
            value={stats.totalTeams}
            change={stats.monthlyGrowth.teams}
            icon={MessageSquare}
            color="purple"
          />
          <StatCard
            title="Bài viết blog"
            value={stats.totalPosts}
            change={stats.monthlyGrowth.posts}
            icon={FileText}
            color="orange"
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-6 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Nhóm chat
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Training
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Hệ thống
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>Các chức năng quản lý thường dùng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickActionCard
                  title="Quản lý người dùng"
                  description="Xem, sửa, khóa tài khoản"
                  icon={Users}
                  color="blue"
                  onClick={() => setActiveTab('users')}
                />
                <QuickActionCard
                  title="Đào tạo AI"
                  description="Training dataset và model"
                  icon={Brain}
                  color="purple"
                  onClick={() => setActiveTab('ai')}
                />
                <QuickActionCard
                  title="Quản lý blog"
                  description="CRUD bài viết và danh mục"
                  icon={FileText}
                  color="green"
                  onClick={() => setActiveTab('blog')}
                />
                <QuickActionCard
                  title="Nhóm chat"
                  description="Moderation và thống kê"
                  icon={MessageSquare}
                  color="orange"
                  onClick={() => setActiveTab('groups')}
                />
                <QuickActionCard
                  title="Cài đặt hệ thống"
                  description="Config và bảo trì"
                  icon={Settings}
                  color="gray"
                  onClick={() => setActiveTab('system')}
                />
                <QuickActionCard
                  title="Thống kê chi tiết"
                  description="Analytics và báo cáo"
                  icon={BarChart3}
                  color="cyan"
                  onClick={() => toast({ title: "Đang phát triển", description: "Tính năng sẽ có trong phiên bản tiếp theo" })}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Trạng thái hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Server</span>
                    <Badge className="bg-green-100 text-green-700">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WebSocket</span>
                    <Badge className="bg-green-100 text-green-700">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Service</span>
                    <Badge className="bg-yellow-100 text-yellow-700">Training</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">5 người dùng mới đăng ký (2 phút trước)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Nhóm "Crypto VN" tạo mới (15 phút trước)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">AI model cập nhật thành công (1 giờ trước)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Bài viết mới được xuất bản (3 giờ trước)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quản lý người dùng
              </CardTitle>
              <CardDescription>
                Tổng cộng {users.length} người d��ng trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName || 'Chưa đặt tên'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={user.role === 'Premium User' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Đăng nhập lần cuối: {new Date(user.lastLogin).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </Badge>
                      {user.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'deactivate')}
                          disabled={loading}
                        >
                          Khóa
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          disabled={loading}
                        >
                          Kích hoạt
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUserAction(user.id, 'delete')}
                        disabled={loading}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Quản lý nhóm chat
              </CardTitle>
              <CardDescription>
                Kiểm duyệt và quản lý các nhóm chat trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quản lý nhóm chat</h3>
                <p className="text-muted-foreground mb-4">
                  Tính năng đang được phát triển để quản lý và kiểm duyệt các nhóm chat
                </p>
                <Button>Xem tất cả nhóm</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Training Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Training Dashboard
              </CardTitle>
              <CardDescription>
                Đào tạo và tối ưu hóa AI trading assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Model Performance</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span>94.2%</span>
                      </div>
                      <Progress value={94.2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Response Quality</span>
                        <span>89.7%</span>
                      </div>
                      <Progress value={89.7} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>User Satisfaction</span>
                        <span>92.1%</span>
                      </div>
                      <Progress value={92.1} className="h-2" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Training Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Cập nhật dataset
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Fine-tune model
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      A/B test responses
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Xem analytics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Management Tab */}
        <TabsContent value="blog" className="space-y-6">
          {/* Create New Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Tạo bài viết mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Tiêu đề bài viết..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
              <Textarea
                placeholder="Nội dung bài viết..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
              />
              <Button onClick={handleCreatePost} disabled={blogLoading}>
                <FileText className="h-4 w-4 mr-2" />
                Tạo bài viết
              </Button>
            </CardContent>
          </Card>

          {/* Blog Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê Blog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{posts.length}</div>
                  <div className="text-sm text-muted-foreground">Tổng bài viết</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {posts.filter(p => p.status === 'published').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Đã xuất bản</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {posts.filter(p => p.status === 'draft').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Bản nháp</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {posts.filter(p => p.created_at > new Date(Date.now() - 30*24*60*60*1000).toISOString()).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tháng này</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách bài viết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {post.author} • {new Date(post.created_at).toLocaleDateString('vi-VN')}
                      </p>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.status === 'draft' ? (
                        <Button
                          size="sm"
                          onClick={() => publishPost(post.id)}
                          disabled={blogLoading}
                        >
                          Xuất bản
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unpublishPost(post.id)}
                          disabled={blogLoading}
                        >
                          Hủy xuất bản
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPost(post)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePost(post.id)}
                        disabled={blogLoading}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}

                {posts.length === 0 && !blogLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có bài viết nào
                  </div>
                )}

                {blogLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Post Modal */}
          {editingPost && (
            <Card>
              <CardHeader>
                <CardTitle>Chỉnh sửa bài viết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                />
                <Textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button onClick={handleUpdatePost} disabled={blogLoading}>
                    Cập nhật
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPost(null)}>
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt hệ thống
              </CardTitle>
              <CardDescription>
                Cấu hình và bảo trì hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Database</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Backup database
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Optimize performance
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Maintenance</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      Clear cache
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Security scan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
