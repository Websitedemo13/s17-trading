import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import { BlogPost } from '@/stores/blogStore';

interface BlogPostCardProps {
  post: BlogPost;
  currentLanguage: 'en' | 'vi';
  likedPosts: string[];
  bookmarkedPosts: string[];
  onPostClick: (post: BlogPost) => void;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onShare: (post: BlogPost) => void;
}

const BlogPostCard = memo(({
  post,
  currentLanguage,
  likedPosts,
  bookmarkedPosts,
  onPostClick,
  onToggleLike,
  onToggleBookmark,
  onShare
}: BlogPostCardProps) => {
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

  return (
    <Card
      className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50"
      onClick={() => onPostClick(post)}
    >
      <div className="relative">
        {post.media.featured_image && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={post.media.featured_image} 
              alt={post.title[currentLanguage]}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
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
                    onToggleLike(post.id);
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
                    onToggleBookmark(post.id);
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
                    onShare(post);
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
  );
});

BlogPostCard.displayName = 'BlogPostCard';

export default BlogPostCard;
