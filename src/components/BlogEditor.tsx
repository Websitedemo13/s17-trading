import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import {
  Save,
  Eye,
  Globe,
  Settings,
  Image,
  Tag,
  Calendar,
  Users,
  FileText,
  Trash2,
  Copy,
  Upload,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Type,
  Palette,
  Hash,
  Star,
  Clock,
  Zap,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import { BlogPost, BlogCategory, useBlogStore } from '@/stores/blogStore';

interface BlogEditorProps {
  post?: BlogPost;
  onSave?: (post: BlogPost) => void;
  onCancel?: () => void;
}

const BlogEditor = ({ post, onSave, onCancel }: BlogEditorProps) => {
  const { 
    categories, 
    currentLanguage, 
    setLanguage, 
    createPost, 
    updatePost, 
    generateSlug 
  } = useBlogStore();

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: { en: '', vi: '' },
    slug: { en: '', vi: '' },
    excerpt: { en: '', vi: '' },
    content: { en: '', vi: '' },
    author: {
      id: '1',
      name: 'Quách Thành Long',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      role: 'Chief Editor',
      bio: {
        en: 'Expert financial analyst with 8+ years of experience in crypto and stock markets.',
        vi: 'Chuyên gia phân tích tài chính với 8+ năm kinh nghiệm về crypto và chứng khoán.'
      },
      verified: true
    },
    category: categories[0] || {
      id: '1',
      name: { en: 'Market Analysis', vi: 'Phân tích thị trường' },
      slug: 'market-analysis',
      color: '#3B82F6'
    },
    tags: [],
    seo: {
      meta_title: { en: '', vi: '' },
      meta_description: { en: '', vi: '' },
      keywords: []
    },
    media: {
      featured_image: '',
      gallery: [],
      video_url: ''
    },
    status: 'draft',
    difficulty: 'intermediate',
    featured: false,
    trending: false,
    premium: false
  });

  const [activeTab, setActiveTab] = useState('content');
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData(post);
    }
  }, [post]);

  const handleInputChange = (field: string, value: any, lang?: 'en' | 'vi') => {
    setFormData(prev => {
      if (lang && typeof prev[field] === 'object' && prev[field] !== null) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [lang]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleNestedInputChange = (parentField: string, field: string, value: any, lang?: 'en' | 'vi') => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: lang && typeof prev[parentField]?.[field] === 'object' ? {
          ...prev[parentField][field],
          [lang]: value
        } : value
      }
    }));
  };

  const generateSlugFromTitle = (lang: 'en' | 'vi') => {
    const title = formData.title?.[lang] || '';
    if (title) {
      const slug = generateSlug(title, lang);
      handleInputChange('slug', slug, lang);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.seo?.keywords?.includes(newKeyword.trim())) {
      handleNestedInputChange('seo', 'keywords', [...(formData.seo?.keywords || []), newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    handleNestedInputChange('seo', 'keywords', formData.seo?.keywords?.filter(k => k !== keywordToRemove) || []);
  };

  const handleSave = async (status: BlogPost['status'] = 'draft') => {
    setSaving(true);
    try {
      const postData = {
        ...formData,
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'published' && !post?.published_at && { published_at: new Date().toISOString() })
      } as BlogPost;

      let success = false;
      if (post?.id) {
        success = await updatePost(post.id, postData);
      } else {
        success = await createPost(postData);
      }

      if (success) {
        onSave?.(postData);
        toast({
          title: "Thành công",
          description: status === 'published' ? "Bài viết đã được xuất bản" : "Bài viết đã được lưu",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu bài viết",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderToolbar = () => (
    <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Underline className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Quote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Code className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Link className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Video className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="prose prose-lg max-w-none">
      <h1>{formData.title?.[currentLanguage]}</h1>
      <div className="text-muted-foreground mb-4">
        <p><strong>Tác giả:</strong> {formData.author?.name}</p>
        <p><strong>Danh mục:</strong> {formData.category?.name?.[currentLanguage]}</p>
        <p><strong>Độ khó:</strong> {formData.difficulty}</p>
      </div>
      
      {formData.media?.featured_image && (
        <img 
          src={formData.media.featured_image} 
          alt={formData.title?.[currentLanguage]}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}
      
      <div className="whitespace-pre-wrap">
        {formData.content?.[currentLanguage]}
      </div>
      
      {formData.tags && formData.tags.length > 0 && (
        <div className="mt-6">
          <h3>Tags</h3>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {post ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
          <p className="text-muted-foreground">
            {post ? 'Cập nhật nội dung và cài đặt cho bài viết' : 'Viết và xuất bản bài viết chất lượng cao'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Chỉnh sửa' : 'Xem trước'}
          </Button>
          
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
        </div>
      </div>

      {isPreviewMode ? (
        <Card>
          <CardContent className="pt-6">
            {renderPreview()}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Nội dung</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Title */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Tiêu đề
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tiêu đề ({currentLanguage === 'vi' ? 'Tiếng Việt' : 'English'})</Label>
                      <Input
                        value={formData.title?.[currentLanguage] || ''}
                        onChange={(e) => handleInputChange('title', e.target.value, currentLanguage)}
                        placeholder="Nhập tiêu đề bài viết..."
                        className="text-lg"
                      />
                    </div>
                    
                    <div>
                      <Label>Slug URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.slug?.[currentLanguage] || ''}
                          onChange={(e) => handleInputChange('slug', e.target.value, currentLanguage)}
                          placeholder="url-slug-bai-viet"
                        />
                        <Button
                          variant="outline"
                          onClick={() => generateSlugFromTitle(currentLanguage)}
                        >
                          Tự động
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Excerpt */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tóm tắt</CardTitle>
                    <CardDescription>
                      Tóm tắt ngắn gọn về nội dung bài viết (150-300 ký tự)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.excerpt?.[currentLanguage] || ''}
                      onChange={(e) => handleInputChange('excerpt', e.target.value, currentLanguage)}
                      placeholder="Viết tóm tắt hấp dẫn để thu hút người đọc..."
                      rows={3}
                    />
                    <div className="text-sm text-muted-foreground mt-2">
                      {formData.excerpt?.[currentLanguage]?.length || 0}/300 ký tự
                    </div>
                  </CardContent>
                </Card>

                {/* Content Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nội dung chính</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {renderToolbar()}
                    <Textarea
                      value={formData.content?.[currentLanguage] || ''}
                      onChange={(e) => handleInputChange('content', e.target.value, currentLanguage)}
                      placeholder="Viết nội dung bài viết của bạn ở đây..."
                      className="min-h-[500px] border-0 resize-none rounded-t-none"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6">
                {/* SEO Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Cài đặt SEO
                    </CardTitle>
                    <CardDescription>
                      Tối ưu hóa bài viết cho công cụ tìm kiếm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Meta Title</Label>
                      <Input
                        value={formData.seo?.meta_title?.[currentLanguage] || ''}
                        onChange={(e) => handleNestedInputChange('seo', 'meta_title', e.target.value, currentLanguage)}
                        placeholder="Tiêu đề SEO (50-60 ký tự)"
                      />
                    </div>
                    
                    <div>
                      <Label>Meta Description</Label>
                      <Textarea
                        value={formData.seo?.meta_description?.[currentLanguage] || ''}
                        onChange={(e) => handleNestedInputChange('seo', 'meta_description', e.target.value, currentLanguage)}
                        placeholder="Mô tả SEO (150-160 ký tự)"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Keywords</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Thêm từ khóa..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                          />
                          <Button onClick={addKeyword} variant="outline">
                            Thêm
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.seo?.keywords?.map(keyword => (
                            <Badge key={keyword} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                              {keyword} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                {/* Media Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Hình ảnh & Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Featured Image URL</Label>
                      <Input
                        value={formData.media?.featured_image || ''}
                        onChange={(e) => handleNestedInputChange('media', 'featured_image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div>
                      <Label>Video URL (Optional)</Label>
                      <Input
                        value={formData.media?.video_url || ''}
                        onChange={(e) => handleNestedInputChange('media', 'video_url', e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>

                    {formData.media?.featured_image && (
                      <div>
                        <Label>Preview</Label>
                        <img 
                          src={formData.media.featured_image} 
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Xuất bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Trạng thái</Label>
                  <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                    {formData.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => handleSave('draft')}
                    variant="outline"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu nháp
                  </Button>
                  <Button 
                    onClick={() => handleSave('published')}
                    disabled={saving}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Xuất bản
                  </Button>
                </div>

                {onCancel && (
                  <Button variant="ghost" onClick={onCancel} className="w-full">
                    Hủy
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Category & Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Phân loại
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Danh mục</Label>
                  <Select 
                    value={formData.category?.id} 
                    onValueChange={(value) => {
                      const category = categories.find(c => c.id === value);
                      handleInputChange('category', category);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name[currentLanguage]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Độ khó</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => handleInputChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Cơ bản</SelectItem>
                      <SelectItem value="intermediate">Trung cấp</SelectItem>
                      <SelectItem value="advanced">Nâng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Thêm tag..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button onClick={addTag} variant="outline">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Tùy chọn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Bài viết nổi bật</Label>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Trending</Label>
                  <Switch
                    checked={formData.trending}
                    onCheckedChange={(checked) => handleInputChange('trending', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Premium content</Label>
                  <Switch
                    checked={formData.premium}
                    onCheckedChange={(checked) => handleInputChange('premium', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
