import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Clock,
  Globe,
  Star,
  Zap,
  Award,
  Target,
  Activity,
  PieChart,
  LineChart,
  DollarSign,
  Download,
  Upload,
  Settings,
  RefreshCw,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark
} from 'lucide-react';
import { BlogPost, BlogCategory, BlogAnalytics, useBlogStore } from '@/stores/blogStore';
import BlogEditor from './BlogEditor';

const AdminBlogManager = () => {
  const {
    posts,
    categories,
    analytics,
    loading,
    currentLanguage,
    setLanguage,
    fetchPosts,
    deletePost,
    publishPost,
    unpublishPost,
    schedulePost,
    archivePost,
    duplicatePost,
    bulkUpdatePosts,
    bulkDeletePosts,
    fetchAnalytics
  } = useBlogStore();

  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchPosts();
    fetchAnalytics();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category.id === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || post.difficulty === difficultyFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesDifficulty;
  });

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredPosts.length / pageSize);

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === paginatedPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(paginatedPosts.map(post => post.id));
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingPost(undefined);
    setShowEditor(true);
  };

  const handleDelete = async (postId: string) => {
    const success = await deletePost(postId);
    if (success) {
      setSelectedPosts(prev => prev.filter(id => id !== postId));
    }
    setShowDeleteDialog(false);
    setPostToDelete(null);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) return;

    let success = false;
    switch (action) {
      case 'publish':
        success = await bulkUpdatePosts(selectedPosts, { status: 'published' });
        break;
      case 'unpublish':
        success = await bulkUpdatePosts(selectedPosts, { status: 'draft' });
        break;
      case 'archive':
        success = await bulkUpdatePosts(selectedPosts, { status: 'archived' });
        break;
      case 'delete':
        success = await bulkDeletePosts(selectedPosts);
        break;
      case 'feature':
        success = await bulkUpdatePosts(selectedPosts, { featured: true });
        break;
      case 'unfeature':
        success = await bulkUpdatePosts(selectedPosts, { featured: false });
        break;
    }

    if (success) {
      setSelectedPosts([]);
      toast({
        title: "Thành công",
        description: `Đã thực hiện thao tác cho ${selectedPosts.length} bài viết`
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      case 'archived': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'scheduled': return 'Đã lên lịch';
      case 'archived': return 'Lưu trữ';
      default: return 'Không xác định';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return 'Không xác định';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showEditor) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={() => {
          setShowEditor(false);
          setEditingPost(undefined);
          fetchPosts();
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingPost(undefined);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Blog</h2>
          <p className="text-muted-foreground">
            Tạo, chỉnh sửa và quản lý nội dung blog của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={currentLanguage} onValueChange={(value: 'en' | 'vi') => setLanguage(value)}>
            <SelectTrigger className="w-32">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài viết
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Bài viết</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tổng bài viết</p>
                    <p className="text-3xl font-bold">{analytics?.total_posts || posts.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  +{posts.filter(p => new Date(p.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length} trong tuần
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Đã xuất bản</p>
                    <p className="text-3xl font-bold">{analytics?.published_posts || posts.filter(p => p.status === 'published').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((posts.filter(p => p.status === 'published').length / posts.length) * 100)}% tổng số
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lượt xem</p>
                    <p className="text-3xl font-bold">{formatNumber(analytics?.total_views || posts.reduce((sum, p) => sum + p.metrics.views, 0))}</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Trung bình {Math.round((posts.reduce((sum, p) => sum + p.metrics.views, 0) / posts.length) || 0)}/bài
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tương tác</p>
                    <p className="text-3xl font-bold">{formatNumber(analytics?.total_likes || posts.reduce((sum, p) => sum + p.metrics.likes, 0))}</p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  +{posts.reduce((sum, p) => sum + p.metrics.comments_count, 0)} bình luận
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm bài viết..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                      <SelectItem value="archived">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name[currentLanguage]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="beginner">Cơ bản</SelectItem>
                      <SelectItem value="intermediate">Trung cấp</SelectItem>
                      <SelectItem value="advanced">Nâng cao</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => fetchPosts()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedPosts.length > 0 && (
                <div className="flex items-center gap-2 mt-4 p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedPosts.length} bài viết được chọn
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('publish')}>
                    Xuất bản
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('unpublish')}>
                    Hủy xuất bản
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('feature')}>
                    Đánh dấu nổi bật
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                    Lưu trữ
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                    Xóa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách bài viết</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPosts.length === paginatedPosts.length && paginatedPosts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Độ khó</TableHead>
                    <TableHead>Thống kê</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPosts.includes(post.id)}
                          onCheckedChange={() => handleSelectPost(post.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium line-clamp-1">
                            {post.title[currentLanguage]}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {post.excerpt[currentLanguage]}
                          </div>
                          <div className="flex items-center gap-2">
                            {post.featured && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Nổi bật
                              </Badge>
                            )}
                            {post.trending && (
                              <Badge variant="secondary" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            {post.premium && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{post.author.name}</div>
                            <div className="text-xs text-muted-foreground">{post.author.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          style={{ backgroundColor: post.category.color + '20', borderColor: post.category.color }}
                        >
                          {post.category.name[currentLanguage]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getStatusColor(post.status)}`}>
                          {getStatusText(post.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getDifficultyColor(post.difficulty)}`}>
                          {getDifficultyText(post.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(post.metrics.views)}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {formatNumber(post.metrics.likes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.metrics.comments_count}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(post.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(post)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug[currentLanguage]}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem trước
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicatePost(post.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Nhân bản
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {post.status === 'published' ? (
                              <DropdownMenuItem onClick={() => unpublishPost(post.id)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Hủy xuất bản
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => publishPost(post.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Xuất bản
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => archivePost(post.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Lưu trữ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setPostToDelete(post.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredPosts.length)} của {filteredPosts.length} bài viết
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Bài viết phổ biến
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.popular_posts?.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium line-clamp-1">{post.title[currentLanguage]}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(post.metrics.views)} lượt xem • {post.metrics.likes} thích
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Nguồn traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.traffic_sources?.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-sm">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(source.visits)}</div>
                        <div className="text-xs text-muted-foreground">{source.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất theo danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.slice(0, 6).map((category) => {
                  const categoryPosts = posts.filter(p => p.category.id === category.id);
                  const totalViews = categoryPosts.reduce((sum, p) => sum + p.metrics.views, 0);
                  const totalLikes = categoryPosts.reduce((sum, p) => sum + p.metrics.likes, 0);
                  
                  return (
                    <Card key={category.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{category.name[currentLanguage]}</h4>
                            <Badge style={{ backgroundColor: category.color + '20', color: category.color }}>
                              {categoryPosts.length} bài
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(totalViews)} lượt xem • {formatNumber(totalLikes)} thích
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý danh mục</CardTitle>
              <CardDescription>
                Tạo và quản lý danh mục cho blog của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Tính năng quản lý danh mục sẽ được phát triển trong phiên bản tiếp theo
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Blog</CardTitle>
              <CardDescription>
                Cấu hình các thiết lập chung cho blog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Tính năng cài đặt sẽ được phát triển trong phiên bản tiếp theo
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => postToDelete && handleDelete(postToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlogManager;
