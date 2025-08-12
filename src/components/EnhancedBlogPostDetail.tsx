import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Bookmark,
  Share2,
  Clock,
  Eye,
  MessageCircle,
  Star,
  TrendingUp,
  Award,
  ChevronLeft,
  ExternalLink,
  Copy,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Download,
  Printer,
  BookOpen,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';
import { BlogPost } from '@/stores/blogStore';
import { cn } from '@/lib/utils';

interface EnhancedBlogPostDetailProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLanguage: 'en' | 'vi';
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShare: (post: BlogPost) => void;
  likedPosts: string[];
  bookmarkedPosts: string[];
}

const EnhancedBlogPostDetail = ({
  post,
  open,
  onOpenChange,
  currentLanguage,
  onLike,
  onBookmark,
  onShare,
  likedPosts,
  bookmarkedPosts
}: EnhancedBlogPostDetailProps) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [activeTab, setActiveTab] = useState('content');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (post) {
      const wordCount = post.content[currentLanguage].split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200); // Average reading speed
      setEstimatedReadTime(readTime);
    }
  }, [post, currentLanguage]);

  const handleScroll = (event: any) => {
    const element = event.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setReadingProgress(Math.min(100, Math.max(0, progress)));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const copyToClipboard = () => {
    if (post) {
      const url = `${window.location.origin}/blog/${post.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPost = () => {
    if (post) {
      const content = `# ${post.title[currentLanguage]}\n\n${post.content[currentLanguage]}`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${post.slug[currentLanguage]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!post) return null;

  const isLiked = likedPosts.includes(post.id);
  const isBookmarked = bookmarkedPosts.includes(post.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>
            {typeof post?.title === 'string' ? post.title : post?.title?.[currentLanguage] || 'Blog Post'}
          </DialogTitle>
        </VisuallyHidden>
        {/* Reading Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full z-50">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${readingProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex min-h-full">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {currentLanguage === 'vi' ? 'Quay lại' : 'Back'}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {post.featured && (
                      <Badge className="bg-yellow-500 text-black text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {currentLanguage === 'vi' ? 'Nổi bật' : 'Featured'}
                      </Badge>
                    )}
                    {post.trending && (
                      <Badge className="bg-orange-500 text-white text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {currentLanguage === 'vi' ? 'Thịnh hành' : 'Trending'}
                      </Badge>
                    )}
                    {post.premium && (
                      <Badge className="bg-purple-500 text-white text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={downloadPost}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge 
                    style={{ 
                      backgroundColor: post.category.color + '20', 
                      color: post.category.color,
                      border: `1px solid ${post.category.color}30`
                    }}
                  >
                    {post.category.name[currentLanguage]}
                  </Badge>
                  <Badge className={`text-white text-xs ${getDifficultyColor(post.difficulty)}`}>
                    {getDifficultyText(post.difficulty)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {estimatedReadTime} {currentLanguage === 'vi' ? 'phút đọc' : 'min read'}
                  </Badge>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {post.title[currentLanguage]}
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {post.excerpt[currentLanguage]}
                </p>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {post.author.name}
                        {post.author.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {post.author.role} • {formatDate(post.published_at!)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {formatNumber(post.metrics.views)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.metrics.comments_count}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b px-6">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {currentLanguage === 'vi' ? 'Nội dung' : 'Content'}
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {currentLanguage === 'vi' ? 'Key Insights' : 'Key Insights'}
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {currentLanguage === 'vi' ? 'Tài liệu' : 'Resources'}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="content" className="mt-0">
                <ScrollArea className="h-full" onScrollCapture={handleScroll}>
                  <div className="p-6">
                    {/* Featured Image */}
                    {post.media.featured_image && (
                      <div className="mb-8">
                        <img 
                          src={post.media.featured_image} 
                          alt={post.title[currentLanguage]}
                          className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                        />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <div 
                        className="leading-relaxed"
                        style={{ 
                          lineHeight: '1.8',
                          fontSize: '16px'
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: post.content[currentLanguage]
                            .replace(/\n/g, '<br/>')
                            .replace(/#{1,6} (.*)/g, (match, title) => {
                              const level = match.indexOf(' ');
                              return `<h${level} class="text-2xl font-bold mt-8 mb-4 text-foreground">${title}</h${level}>`;
                            })
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                            .replace(/- (.*)/g, '<li class="ml-4 list-disc">$1</li>')
                            .replace(/^\d+\. (.*)/gm, '<li class="ml-4 list-decimal">$1</li>')
                        }}
                      />
                    </div>

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t">
                      <h3 className="text-lg font-semibold mb-4">
                        {currentLanguage === 'vi' ? 'Thẻ bài viết' : 'Article Tags'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Author Bio */}
                    <div className="mt-8 p-6 bg-muted/30 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        {currentLanguage === 'vi' ? 'Về tác giả' : 'About the Author'}
                        {post.author.verified && <CheckCircle className="h-5 w-5 text-blue-500" />}
                      </h3>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback className="text-lg">{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{post.author.name}</h4>
                          <p className="text-primary font-medium mb-2">{post.author.role}</p>
                          <p className="text-muted-foreground leading-relaxed">
                            {post.author.bio[currentLanguage]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="insights" className="flex-1 mt-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                        <Zap className="h-5 w-5" />
                        {currentLanguage === 'vi' ? 'Điểm chính' : 'Key Takeaways'}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
                          <p className="text-muted-foreground">
                            {currentLanguage === 'vi' 
                              ? 'Hiểu rõ tâm lý thị trường là chìa khóa thành công trong trading'
                              : 'Understanding market psychology is key to trading success'
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
                          <p className="text-muted-foreground">
                            {currentLanguage === 'vi' 
                              ? 'Quản lý rủi ro quan trọng hơn việc tìm kiếm lợi nhuận cao'
                              : 'Risk management is more important than seeking high profits'
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
                          <p className="text-muted-foreground">
                            {currentLanguage === 'vi' 
                              ? 'Kỷ luật và kiên nhẫn là nền tảng của trader thành công'
                              : 'Discipline and patience are the foundation of successful trading'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                          {currentLanguage === 'vi' ? 'Lợi ích' : 'Benefits'}
                        </h4>
                        <ul className="space-y-2 text-sm text-green-600 dark:text-green-400">
                          <li>• {currentLanguage === 'vi' ? 'Cải thiện kết quả trading' : 'Improved trading results'}</li>
                          <li>• {currentLanguage === 'vi' ? 'Giảm stress và áp lực' : 'Reduced stress and pressure'}</li>
                          <li>• {currentLanguage === 'vi' ? 'Tăng tự tin trong quyết định' : 'Increased confidence in decisions'}</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                          {currentLanguage === 'vi' ? 'Lưu ý' : 'Warnings'}
                        </h4>
                        <ul className="space-y-2 text-sm text-orange-600 dark:text-orange-400">
                          <li>• {currentLanguage === 'vi' ? 'Cần thực hành liên tục' : 'Requires continuous practice'}</li>
                          <li>• {currentLanguage === 'vi' ? 'Không có công thức ma thuật' : 'No magic formula exists'}</li>
                          <li>• {currentLanguage === 'vi' ? 'Kết quả không đảm bảo' : 'Results not guaranteed'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="resources" className="flex-1 mt-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {currentLanguage === 'vi' ? 'Tài liệu tham khảo' : 'Reference Materials'}
                      </h3>
                      <div className="space-y-3">
                        <a href="#" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">Trading Psychology by Mark Douglas</div>
                            <div className="text-sm text-muted-foreground">Classic book on trading mindset</div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                        
                        <a href="#" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">TradingView Analysis Tools</div>
                            <div className="text-sm text-muted-foreground">Professional charting platform</div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {currentLanguage === 'vi' ? 'Bài viết liên quan' : 'Related Articles'}
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-1">Risk Management Strategies</h4>
                          <p className="text-sm text-muted-foreground">Learn how to protect your capital</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-1">Technical Analysis Basics</h4>
                          <p className="text-sm text-muted-foreground">Master chart reading skills</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-muted/20 flex flex-col">
            <div className="p-6 border-b">
              <h3 className="font-semibold mb-4">
                {currentLanguage === 'vi' ? 'Tương tác' : 'Interactions'}
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => onLike(post.id)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Đã thích' : 'Thích'} ({formatNumber(post.metrics.likes)})
                </Button>
                
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => onBookmark(post.id)}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Đã lưu' : 'Lưu bài'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onShare(post)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ ({post.metrics.shares})
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-3">
                  {currentLanguage === 'vi' ? 'Thống kê bài viết' : 'Article Stats'}
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {currentLanguage === 'vi' ? 'Lượt xem' : 'Views'}
                    </span>
                    <span className="font-medium">{formatNumber(post.metrics.views)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {currentLanguage === 'vi' ? 'Thích' : 'Likes'}
                    </span>
                    <span className="font-medium">{formatNumber(post.metrics.likes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {currentLanguage === 'vi' ? 'Bình luận' : 'Comments'}
                    </span>
                    <span className="font-medium">{post.metrics.comments_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {currentLanguage === 'vi' ? 'Chia sẻ' : 'Shares'}
                    </span>
                    <span className="font-medium">{post.metrics.shares}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">
                  {currentLanguage === 'vi' ? 'Tiến độ đọc' : 'Reading Progress'}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {currentLanguage === 'vi' ? 'Hoàn thành' : 'Completed'}
                    </span>
                    <span className="font-medium">{Math.round(readingProgress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBlogPostDetail;
