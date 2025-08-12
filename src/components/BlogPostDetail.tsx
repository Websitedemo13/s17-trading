import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlogPost } from '@/stores/blogStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Clock,
  Heart,
  Share2,
  Bookmark,
  Star,
  TrendingUp,
  Award,
  Eye,
  MessageCircle,
  ThumbsUp,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  ExternalLink,
  BookOpen,
  Calendar,
  User,
  Tag,
  BarChart3,
  Zap
} from 'lucide-react';

interface BlogPostDetailProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLanguage: 'en' | 'vi';
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (post: BlogPost) => void;
  likedPosts?: string[];
  bookmarkedPosts?: string[];
}

export const BlogPostDetail = ({
  post,
  open,
  onOpenChange,
  currentLanguage,
  onLike,
  onBookmark,
  onShare,
  likedPosts = [],
  bookmarkedPosts = []
}: BlogPostDetailProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!post) return null;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: currentLanguage === 'vi' ? "Đã sao chép" : "Copied",
      description: currentLanguage === 'vi' ? "Đã sao chép vào clipboard" : "Copied to clipboard"
    });
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-bold mb-6 mt-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {paragraph.replace('# ', '')}
          </h1>
        );
      } else if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-semibold mb-4 mt-6 text-foreground">
            {paragraph.replace('## ', '')}
          </h2>
        );
      } else if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-medium mb-3 mt-4 text-foreground">
            {paragraph.replace('### ', '')}
          </h3>
        );
      } else if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
        return (
          <li key={index} className="ml-6 mb-2 text-muted-foreground">
            {paragraph.replace(/^[•-] /, '')}
          </li>
        );
      } else if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
        return (
          <p key={index} className="font-semibold mb-3 text-lg text-primary">
            {paragraph.replace(/\*\*/g, '')}
          </p>
        );
      } else if (paragraph.trim()) {
        return (
          <p key={index} className="mb-4 leading-relaxed text-foreground">
            {paragraph}
          </p>
        );
      }
      return <br key={index} />;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>
            {typeof post.title === 'string' ? post.title : post.title[currentLanguage]}
          </DialogTitle>
        </VisuallyHidden>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="flex flex-col h-full"
        >
          {/* Header Image */}
          {post.media.featured_image && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <motion.img
                src={post.media.featured_image}
                alt={post.title[currentLanguage]}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: imageLoaded ? 1 : 1.1 }}
                transition={{ duration: 0.6 }}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {post.featured && (
                  <Badge className="bg-yellow-500 text-black">
                    <Star className="h-3 w-3 mr-1" />
                    {currentLanguage === 'vi' ? 'Nổi bật' : 'Featured'}
                  </Badge>
                )}
                {post.trending && (
                  <Badge className="bg-orange-500 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {currentLanguage === 'vi' ? 'Hot' : 'Trending'}
                  </Badge>
                )}
                {post.premium && (
                  <Badge className="bg-purple-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    style={{ 
                      backgroundColor: post.category.color + '20', 
                      color: post.category.color,
                      border: `1px solid ${post.category.color}50`
                    }}
                  >
                    {post.category.name[currentLanguage]}
                  </Badge>
                  <Badge className={`text-white ${getDifficultyColor(post.difficulty)}`}>
                    {getDifficultyText(post.difficulty)}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                  {post.title[currentLanguage]}
                </h1>
                <p className="text-gray-200 text-sm">
                  {post.excerpt[currentLanguage]}
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 md:p-8">
              {/* Author and Meta Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">{post.author.role}</div>
                    <div className="text-sm text-muted-foreground">
                      {post.author.bio[currentLanguage]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.published_at!)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.metrics.read_time[currentLanguage]} {currentLanguage === 'vi' ? 'phút đọc' : 'min read'}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{formatNumber(post.metrics.views)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{formatNumber(post.metrics.likes)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{post.metrics.comments_count}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{post.metrics.shares}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLike?.(post.id)}
                    className={likedPosts.includes(post.id) ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBookmark?.(post.id)}
                    className={bookmarkedPosts.includes(post.id) ? "text-blue-500" : ""}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarkedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare?.(post)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <Separator className="mb-6" />

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {renderContent(post.content[currentLanguage])}
              </div>

              <Separator className="my-8" />

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {currentLanguage === 'vi' ? 'Bài viết hữu ích?' : 'Found this helpful?'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {currentLanguage === 'vi' 
                    ? 'Chia sẻ với bạn bè và đồng nghiệp để cùng học hỏi!'
                    : 'Share with friends and colleagues to learn together!'
                  }
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={() => onLike?.(post.id)} variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {currentLanguage === 'vi' ? 'Thích' : 'Like'}
                  </Button>
                  <Button onClick={() => onShare?.(post)} variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    {currentLanguage === 'vi' ? 'Chia sẻ' : 'Share'}
                  </Button>
                  <Button onClick={() => copyToClipboard(post.title[currentLanguage])} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    {currentLanguage === 'vi' ? 'Sao chép' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostDetail;
