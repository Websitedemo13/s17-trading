import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
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
  Star,
  Flame,
  Award,
  Users,
  BookOpen,
  DollarSign,
  Target,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Send,
  ArrowUp,
  BarChart3,
  TrendingDown,
  Hash,
  Play,
  Download,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { BlogPost, BlogCategory, useBlogStore } from '@/stores/blogStore';
import BlogPostDetail from '@/components/BlogPostDetail';

const Blog = () => {
  const {
    posts,
    categories,
    loading,
    currentLanguage,
    setLanguage,
    fetchPosts,
    fetchCategories,
    likePost,
    unlikePost,
    bookmarkPost,
    unbookmarkPost,
    likedPosts,
    bookmarkedPosts,
    userBookmarks,
    fetchUserBookmarks,
    incrementViews
  } = useBlogStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePost, setSharePost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchUserBookmarks();
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      if (post.status !== 'published') return false;
      
      const matchesSearch = 
        post.title[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || post.category.id === selectedCategory;
      
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'featured' && post.featured) ||
        (activeTab === 'trending' && post.trending) ||
        (activeTab === 'premium' && post.premium) ||
        (activeTab === 'saved' && bookmarkedPosts.includes(post.id));

      return matchesSearch && matchesCategory && matchesTab;
    });

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.metrics.views - a.metrics.views);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.metrics.likes + b.metrics.comments_count + b.metrics.shares) - (a.metrics.likes + a.metrics.comments_count + a.metrics.shares));
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime());
        break;
    }

    return filtered;
  }, [posts, searchTerm, selectedCategory, sortBy, currentLanguage, activeTab]);

  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);

  const featuredPosts = posts.filter(post => post.featured && post.status === 'published');
  const trendingPosts = posts
    .filter(post => post.status === 'published')
    .sort((a, b) => (b.metrics.likes + b.metrics.comments_count) - (a.metrics.likes + a.metrics.comments_count))
    .slice(0, 5);

  const toggleBookmark = (postId: string) => {
    if (bookmarkedPosts.includes(postId)) {
      unbookmarkPost(postId);
    } else {
      bookmarkPost(postId);
    }
  };

  const toggleLike = (postId: string) => {
    if (likedPosts.includes(postId)) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    setShowPostDetail(true);
    incrementViews(post.id);
  };

  const handleShare = (post: BlogPost) => {
    setSharePost(post);
    setShowShareDialog(true);
  };

  const shareToSocial = (platform: string, post: BlogPost) => {
    const url = `${window.location.origin}/blog/${post.id}`;
    const text = `${post.title[currentLanguage]} - ${post.excerpt[currentLanguage]} #S17Trading #CryptoNews`;
    const hashtags = post.tags.slice(0, 3).join(',');

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(post.title[currentLanguage])}&summary=${encodeURIComponent(post.excerpt[currentLanguage])}`;
        break;
      case 'telegram':
        shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case 'copy':
        const shareText = `${post.title[currentLanguage]}\n\n${post.excerpt[currentLanguage]}\n\nĐọc thêm: ${url}`;
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Đã sao chép link",
          description: "Nội dung chia sẻ đã được sao chép vào clipboard"
        });
        setShowShareDialog(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US', {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500'; 
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    if (currentLanguage === 'vi') {
      switch (difficulty) {
        case 'beginner': return 'Cơ bản';
        case 'intermediate': return 'Trung cấp';
        case 'advanced': return 'Nâng cao';
        default: return 'Không xác định';
      }
    } else {
      switch (difficulty) {
        case 'beginner': return 'Beginner';
        case 'intermediate': return 'Intermediate';
        case 'advanced': return 'Advanced';
        default: return 'Unknown';
      }
    }
  };

  const getTabLabel = (tab: string) => {
    if (currentLanguage === 'vi') {
      switch (tab) {
        case 'all': return 'Tất cả';
        case 'featured': return 'Nổi bật';
        case 'trending': return 'Thịnh hành';
        case 'premium': return 'Premium';
        case 'saved': return 'Đã lưu';
        default: return tab;
      }
    } else {
      switch (tab) {
        case 'all': return 'All';
        case 'featured': return 'Featured';
        case 'trending': return 'Trending';
        case 'premium': return 'Premium';
        case 'saved': return 'Saved';
        default: return tab;
      }
    }
  };

  const getSortLabel = (sort: string) => {
    if (currentLanguage === 'vi') {
      switch (sort) {
        case 'latest': return 'Mới nhất';
        case 'popular': return 'Phổ biến';
        case 'trending': return 'Thịnh hành';
        default: return sort;
      }
    } else {
      switch (sort) {
        case 'latest': return 'Latest';
        case 'popular': return 'Popular';
        case 'trending': return 'Trending';
        default: return sort;
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">
              {currentLanguage === 'vi' ? 'Đang tải nội dung...' : 'Loading content...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium">
            <BookOpen className="h-4 w-4" />
            {currentLanguage === 'vi' ? 'Blog S17 Trading' : 'S17 Trading Blog'}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            {currentLanguage === 'vi' 
              ? 'Kiến thức Đầu tư & Trading'
              : 'Investment & Trading Knowledge'
            }
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {currentLanguage === 'vi'
              ? 'Khám phá những phân tích sâu sắc, chiến lược đầu tư và tin tức thị trường từ các chuyên gia hàng đầu'
              : 'Discover deep insights, investment strategies and market news from leading experts'
            }
          </p>
        </div>

        {/* Language & Search Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={currentLanguage} onValueChange={(value: 'en' | 'vi') => setLanguage(value)}>
              <SelectTrigger className="w-40">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={currentLanguage === 'vi' ? "Tìm kiếm bài viết..." : "Search articles..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {currentLanguage === 'vi' ? 'Tất cả danh mục' : 'All categories'}
                </SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name[currentLanguage]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">{getSortLabel('latest')}</SelectItem>
                <SelectItem value="popular">{getSortLabel('popular')}</SelectItem>
                <SelectItem value="trending">{getSortLabel('trending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Posts Hero */}
        {featuredPosts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              {currentLanguage === 'vi' ? 'Bài viết nổi bật' : 'Featured Articles'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Featured Post */}
              <Card className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
                <div className="relative">
                  {featuredPosts[0]?.media.featured_image && (
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={featuredPosts[0].media.featured_image} 
                        alt={featuredPosts[0].title[currentLanguage]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-500 text-black font-medium">
                          <Star className="h-3 w-3 mr-1" />
                          {currentLanguage === 'vi' ? 'Nổi bật' : 'Featured'}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          {featuredPosts[0].metrics.read_time[currentLanguage]} {currentLanguage === 'vi' ? 'phút đọc' : 'min read'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge 
                          style={{ 
                            backgroundColor: featuredPosts[0].category.color + '20', 
                            color: featuredPosts[0].category.color,
                            border: `1px solid ${featuredPosts[0].category.color}30`
                          }}
                        >
                          {featuredPosts[0].category.name[currentLanguage]}
                        </Badge>
                        <Badge className={`text-white ${getDifficultyColor(featuredPosts[0].difficulty)}`}>
                          {getDifficultyText(featuredPosts[0].difficulty)}
                        </Badge>
                      </div>
                      
                      <h3 className="text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {featuredPosts[0].title[currentLanguage]}
                      </h3>
                      
                      <p className="text-muted-foreground line-clamp-3">
                        {featuredPosts[0].excerpt[currentLanguage]}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={featuredPosts[0].author.avatar} />
                            <AvatarFallback>{featuredPosts[0].author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{featuredPosts[0].author.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(featuredPosts[0].published_at!)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(featuredPosts[0].metrics.views)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {formatNumber(featuredPosts[0].metrics.likes)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Trending Posts Sidebar */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  {currentLanguage === 'vi' ? 'Thịnh hành' : 'Trending'}
                </h3>
                
                <div className="space-y-4">
                  {trendingPosts.slice(0, 4).map((post, index) => (
                    <Card key={post.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title[currentLanguage]}
                            </h4>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {post.category.name[currentLanguage]}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(post.metrics.views)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.metrics.likes}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="all">{getTabLabel('all')}</TabsTrigger>
            <TabsTrigger value="featured">{getTabLabel('featured')}</TabsTrigger>
            <TabsTrigger value="trending">{getTabLabel('trending')}</TabsTrigger>
            <TabsTrigger value="premium">{getTabLabel('premium')}</TabsTrigger>
            <TabsTrigger value="saved">
              {currentLanguage === 'vi' ? `Đã lưu (${userBookmarks.length})` : `Saved (${userBookmarks.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-8">
            {/* Posts Grid */}
            {paginatedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50"
                      onClick={() => handlePostClick(post)}
                    >
                      <div className="relative">
                        {post.media.featured_image && (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={post.media.featured_image} 
                              alt={post.title[currentLanguage]}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                              {post.featured && (
                                <Badge className="bg-yellow-500 text-black text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  {currentLanguage === 'vi' ? 'Nổi bật' : 'Featured'}
                                </Badge>
                              )}
                              {post.trending && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {currentLanguage === 'vi' ? 'Hot' : 'Trending'}
                                </Badge>
                              )}
                              {post.premium && (
                                <Badge className="bg-purple-500 text-white text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="absolute bottom-3 right-3">
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {post.metrics.read_time[currentLanguage]} {currentLanguage === 'vi' ? 'phút' : 'min'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge 
                                style={{ 
                                  backgroundColor: post.category.color + '20', 
                                  color: post.category.color,
                                  border: `1px solid ${post.category.color}30`
                                }}
                                className="text-xs"
                              >
                                {post.category.name[currentLanguage]}
                              </Badge>
                              <Badge className={`text-white text-xs ${getDifficultyColor(post.difficulty)}`}>
                                {getDifficultyText(post.difficulty)}
                              </Badge>
                            </div>
                            
                            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title[currentLanguage]}
                            </h3>
                            
                            <p className="text-muted-foreground line-clamp-3 text-sm">
                              {post.excerpt[currentLanguage]}
                            </p>
                            
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={post.author.avatar} />
                                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">{post.author.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(post.published_at!)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(post.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Heart className={`h-4 w-4 ${likedPosts.includes(post.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </Button>
                                <span className="text-sm">{formatNumber(post.metrics.likes)}</span>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(post.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Bookmark className={`h-4 w-4 ${bookmarkedPosts.includes(post.id) ? 'fill-primary text-primary' : ''}`} />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(post);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      {currentLanguage === 'vi' ? 'Trước' : 'Previous'}
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="px-2">...</span>
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-10 h-10 p-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {currentLanguage === 'vi' ? 'Sau' : 'Next'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {currentLanguage === 'vi' 
                      ? (searchTerm ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào')
                      : (searchTerm ? 'No articles found' : 'No articles yet')
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {currentLanguage === 'vi'
                      ? (searchTerm 
                          ? 'Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc'
                          : 'Các bài viết sẽ được cập nhật sớm'
                        )
                      : (searchTerm
                          ? 'Try adjusting your search terms or filters'
                          : 'Articles will be updated soon'
                        )
                    }
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Categories Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Hash className="h-6 w-6 text-primary" />
            {currentLanguage === 'vi' ? 'Danh mục' : 'Categories'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const categoryPostCount = posts.filter(p => p.category.id === category.id && p.status === 'published').length;
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0"
                  style={{ backgroundColor: category.color + '10' }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold" style={{ color: category.color }}>
                          {category.name[currentLanguage]}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description[currentLanguage]}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {categoryPostCount} {currentLanguage === 'vi' ? 'bài viết' : 'articles'}
                        </div>
                      </div>
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <BarChart3 className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentLanguage === 'vi' ? 'Chia sẻ bài viết' : 'Share Article'}
            </DialogTitle>
            <DialogDescription>
              {currentLanguage === 'vi' 
                ? 'Chia sẻ bài viết này với bạn bè và đồng nghiệp'
                : 'Share this article with friends and colleagues'
              }
            </DialogDescription>
          </DialogHeader>
          {sharePost && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium line-clamp-2">{sharePost.title[currentLanguage]}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {sharePost.excerpt[currentLanguage]}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => shareToSocial('facebook', sharePost)}
                  className="flex items-center gap-2"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => shareToSocial('twitter', sharePost)}
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => shareToSocial('linkedin', sharePost)}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => shareToSocial('copy', sharePost)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {currentLanguage === 'vi' ? 'Sao chép' : 'Copy Link'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blog;
