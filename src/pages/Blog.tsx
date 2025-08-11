import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Calendar, 
  Eye, 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp,
  Clock,
  Tag,
  Filter,
  Bookmark,
  ChevronRight,
  Globe,
  ArrowUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  readTime: number;
  featured: boolean;
  imageUrl?: string;
  status: 'draft' | 'published';
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  color: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      // Mock blog data - in production this would come from your API
      const mockCategories: BlogCategory[] = [
        { id: '1', name: 'Phân tích thị trường', slug: 'market-analysis', description: 'Phân tích xu hướng và dự đoán thị trường', postCount: 15, color: 'bg-blue-500' },
        { id: '2', name: 'Tin tức Crypto', slug: 'crypto-news', description: 'Tin tức mới nhất về tiền điện tử', postCount: 23, color: 'bg-orange-500' },
        { id: '3', name: 'Chứng khoán VN', slug: 'vietnam-stocks', description: 'Tin tức và phân tích TTCK Việt Nam', postCount: 18, color: 'bg-green-500' },
        { id: '4', name: 'Hướng dẫn Trading', slug: 'trading-guide', description: 'Kiến thức và kỹ thuật giao dịch', postCount: 12, color: 'bg-purple-500' },
        { id: '5', name: 'Công nghệ Blockchain', slug: 'blockchain-tech', description: 'Xu hướng công nghệ blockchain', postCount: 8, color: 'bg-cyan-500' },
        { id: '6', name: 'Kinh tế vĩ mô', slug: 'macro-economics', description: 'Phân tích kinh tế và chính sách', postCount: 10, color: 'bg-red-500' }
      ];

      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Bitcoin sẽ đạt $100,000 trong năm 2024? Phân tích từ các chuyên gia',
          excerpt: 'Nhiều nhà phân tích hàng đầu dự đoán Bitcoin có thể đạt mức $100,000 vào cuối năm 2024, dựa trên các yếu t�� như halving, ETF và adoption tổ chức.',
          content: '# Bitcoin sẽ đạt $100,000 trong năm 2024?\n\nCác chuyên gia...',
          author: { id: '1', name: 'Nguyễn Văn An', avatar: '', role: 'Senior Analyst' },
          category: 'Tin tức Crypto',
          tags: ['Bitcoin', 'Dự đoán', 'ETF', 'Halving'],
          publishedAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          views: 15420,
          likes: 234,
          comments: 89,
          readTime: 8,
          featured: true,
          imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=400&fit=crop',
          status: 'published'
        },
        {
          id: '2',
          title: 'VIC và VHM dẫn dắt nhóm cổ phiếu bất động sản tăng mạnh',
          excerpt: 'Hai ông lớn bất động sản VIC và VHM cùng tăng trần trong phiên giao dịch hôm nay, kéo theo cả nhóm cổ phiếu bất động sản...',
          content: '# VIC và VHM tăng trần\n\nTrong phiên giao dịch...',
          author: { id: '2', name: 'Trần Thị Bình', avatar: '', role: 'Market Reporter' },
          category: 'Chứng khoán VN',
          tags: ['VIC', 'VHM', 'Bất động sản', 'HOSE'],
          publishedAt: '2024-01-14T14:30:00Z',
          updatedAt: '2024-01-14T14:30:00Z',
          views: 8750,
          likes: 156,
          comments: 45,
          readTime: 5,
          featured: false,
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
          status: 'published'
        },
        {
          id: '3',
          title: 'Ethereum Layer 2: Cuộc cách mạng trong hệ sinh thái DeFi',
          excerpt: 'Các giải pháp Layer 2 như Arbitrum, Optimism đang thay đổi cách chúng ta sử dụng Ethereum, giảm phí gas và tăng tốc độ giao dịch...',
          content: '# Layer 2 Revolution\n\nEthereum Layer 2...',
          author: { id: '3', name: 'Lê Hoàng Nam', avatar: '', role: 'Blockchain Expert' },
          category: 'Công nghệ Blockchain',
          tags: ['Ethereum', 'Layer 2', 'DeFi', 'Scaling'],
          publishedAt: '2024-01-13T09:15:00Z',
          updatedAt: '2024-01-13T09:15:00Z',
          views: 12300,
          likes: 298,
          comments: 67,
          readTime: 12,
          featured: true,
          imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=400&fit=crop',
          status: 'published'
        },
        {
          id: '4',
          title: 'Chiến lược DCA: Phương pháp đầu tư thông minh cho người mới',
          excerpt: 'Dollar Cost Averaging (DCA) là một trong những chiến lược đầu tư hiệu quả nhất cho người mới bắt đầu. Tìm hiểu cách áp dụng...',
          content: '# Chiến lược DCA\n\nDCA là gì...',
          author: { id: '4', name: 'Phạm Minh Tuấn', avatar: '', role: 'Investment Advisor' },
          category: 'Hướng dẫn Trading',
          tags: ['DCA', 'Strategy', 'Investment', 'Beginner'],
          publishedAt: '2024-01-12T16:45:00Z',
          updatedAt: '2024-01-12T16:45:00Z',
          views: 9890,
          likes: 187,
          comments: 34,
          readTime: 6,
          featured: false,
          status: 'published'
        },
        {
          id: '5',
          title: 'Fed sẽ cắt giảm lãi suất? Tác động đến thị trường crypto và chứng khoán',
          excerpt: 'Quyết định sắp tới của Fed về lãi suất có thể tác động mạnh đến cả thị trường crypto và chứng khoán toàn cầu...',
          content: '# Fed Interest Rate Decision\n\nThe Federal Reserve...',
          author: { id: '5', name: 'Dr. Hoàng Văn Cường', avatar: '', role: 'Economic Analyst' },
          category: 'Kinh tế vĩ mô',
          tags: ['Fed', 'Interest Rate', 'Macro', 'Global Market'],
          publishedAt: '2024-01-11T11:20:00Z',
          updatedAt: '2024-01-11T11:20:00Z',
          views: 18760,
          likes: 342,
          comments: 123,
          readTime: 10,
          featured: true,
          imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
          status: 'published'
        }
      ];

      setCategories(mockCategories);
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading blog data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu blog",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory && post.status === 'published';
    });

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
    }

    return filtered;
  }, [posts, searchTerm, selectedCategory, sortBy]);

  const featuredPosts = posts.filter(post => post.featured && post.status === 'published');
  const trendingPosts = posts.filter(post => post.status === 'published')
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    .slice(0, 5);

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    toast({
      title: bookmarkedPosts.includes(postId) ? "Đã bỏ lưu" : "Đã lưu bài viết",
      description: bookmarkedPosts.includes(postId) ? "Bài viết đã được xóa khỏi danh sách lưu" : "Bài viết đã được thêm vào danh sách lưu"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">S17 Trading Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tin tức, phân tích và kiến thức đầu tư từ các chuyên gia hàng đầu
        </p>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Bài viết nổi bật
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPosts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <Badge className="mb-2">{post.category}</Badge>
                      <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Tabs value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <TabsList>
                      <TabsTrigger value="latest">Mới nhất</TabsTrigger>
                      <TabsTrigger value="popular">Phổ biến</TabsTrigger>
                      <TabsTrigger value="trending">Thịnh hành</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <div className="space-y-6">
            {filteredAndSortedPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {post.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{post.category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                          <h3 
                            className="text-xl font-semibold mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2"
                            onClick={() => setSelectedPost(post)}
                          >
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {post.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{post.author.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{post.readTime} phút đọc</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(post.id)}
                        >
                          <Bookmark 
                            className={cn(
                              "h-4 w-4",
                              bookmarkedPosts.includes(post.id) && "fill-primary text-primary"
                            )} 
                          />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{formatNumber(post.views)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{formatNumber(post.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{formatNumber(post.comments)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Danh mục
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('all')}
                >
                  Tất cả ({posts.length})
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className={cn("w-3 h-3 rounded-full mr-2", category.color)} />
                    {category.name} ({category.postCount})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-green-600" />
                Bài viết thịnh hành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatNumber(post.views)} views</span>
                        <span>•</span>
                        <span>{formatNumber(post.likes)} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="space-y-4">
                  {selectedPost.imageUrl && (
                    <img
                      src={selectedPost.imageUrl}
                      alt={selectedPost.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Badge>{selectedPost.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(selectedPost.publishedAt)}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl">{selectedPost.title}</DialogTitle>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {selectedPost.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedPost.author.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedPost.author.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedPost.readTime} phút đọc</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(selectedPost.views)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground">{selectedPost.excerpt}</p>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line">{selectedPost.content}</div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex gap-1">
                    {selectedPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      {formatNumber(selectedPost.likes)}
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {formatNumber(selectedPost.comments)}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blog;
